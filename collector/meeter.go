package collector

import (
	"container/ring"
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync/atomic"
	time "time"

	"github.com/docker/docker/api/types/filters"
	"github.com/gorilla/websocket"

	"github.com/gobuffalo/packr"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

var letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func RandStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

var upgrader = websocket.Upgrader{} //

type Metrics struct {
	nodes         []string
	nodeMetrics   map[string]*ring.Ring
	dockerMetrics map[string]*DockerMetrics
	ctx           context.Context
	interval      time.Duration

	progress    uint64
	progressMax uint64

	message string
	server  *http.Server
	running bool

	directMessages chan ProgressMessage
	done           bool
}

const docker_metrics = 2376
const node_metrics = 9100

func (m *Metrics) Setup() {
	if m.server == nil {
		static := packr.NewBox("./static")
		fs := http.FileServer(static)

		router := http.NewServeMux()
		router.Handle("/", fs)
		router.HandleFunc("/data", m.Stream)

		server := &http.Server{
			Addr:         ":3333",
			Handler:      router,
			ReadTimeout:  5 * time.Second,
			WriteTimeout: 10 * time.Second,
			IdleTimeout:  15 * time.Second,
		}

		m.server = server
	}

}

func (m *Metrics) Advance(delta int) {
	atomic.AddUint64(&m.progress,uint64(delta))
}
func (m *Metrics) Expand(delta int) {
	atomic.AddUint64(&m.progressMax,uint64(delta))
}
func (m *Metrics) Render() {
	if !m.running {
		m.running = true
		go m.Collect(time.Second*2, node_metrics, docker_metrics, filters.NewArgs())

		log.Println("Listening on :3333...")

		err := m.server.ListenAndServe()
		if err != nil {
			log.Fatal(err)
		}
		m.running = false
	}

}

func (m *Metrics) Finish(report map[string]interface{}) {
	m.done = true
	m.progress = m.progressMax+1
	msg := prepareMessage(m)
	msg.Report = report
	m.directMessages <- msg 
	//TODO: Extend interface to collect metics for final screen.
	//delay before shutting down the server
	<-time.After(time.Second*2)
	_ = m.server.Shutdown(context.Background())
}
func (m *Metrics) Info(info string) {
	m.message = info
	m.directMessages <- prepareMessage(m)
}

func (m *Metrics) Simulate(){
	for {
		<-time.After(1*time.Second)
		m.message = RandStringRunes(10)
		p := uint64(rand.Int63n(5))
		m.progress += p
		m.progressMax += p + uint64(rand.Int63n(2))
		if m.done {
			return
		}
	}
}

func (m *Metrics) data() []Message {

	messages := make([]Message, 0)

	for _, n := range m.nodes {
		message := Message{}

		cpuIdle := 0.0
		cpuLoad := 0.0
		MemAvailable := 0.0
		memTotal := 0.0
		netRec := 0.0
		netTra := 0.0
		net := 0.0

		var _netRev *float64
		var _netTra *float64
		m.nodeMetrics[n].Do(func(i interface{}) {
			if i != nil {
				nodeMetrics := i.(NodeStats)

				if _netRev == nil {
					_netRev = &nodeMetrics.NetRev
				}

				if _netTra == nil {
					_netTra = &nodeMetrics.NetTra
				}

				cpuIdle = nodeMetrics.CPUIdle
				cpuLoad = nodeMetrics.CPUIOWait + nodeMetrics.CPUSystem + nodeMetrics.CPUUser
				MemAvailable = nodeMetrics.MemAvailable
				memTotal = nodeMetrics.MemTotal
				netRec = nodeMetrics.NetRev
				netTra = nodeMetrics.NetTra
				net = (nodeMetrics.NetTra - *_netTra) - (nodeMetrics.NetRev - *_netRev)

			}
		})

		message.CPUIdle = cpuIdle
		message.CPULoad = cpuLoad
		message.MEMAvail = MemAvailable
		message.MEMTotal = memTotal
		message.NETRec = netRec
		message.NETTra = netTra
		message.NET = net

		if m.dockerMetrics[n] != nil {
			message.Runtimes = m.dockerMetrics[n].State
		}

		message.Name = n
		messages = append(messages, message)
	}

	return messages
}

func (m *Metrics) Stream(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	for {
		select {
		case <-time.After(time.Millisecond * 2000):
			progress := prepareMessage(m)
			err := c.WriteJSON(progress)
			if err != nil {
				_ = c.Close()
			}
		case progress := <-m.directMessages:
			err := c.WriteJSON(progress)
			if err != nil {
				_ = c.Close()
			}
		}
	}
}

func prepareMessage(m *Metrics) ProgressMessage {
	progress := ProgressMessage{}
	progress.Messages = m.data()
	progRand := make([]float64, 0)
	phases := make([]string, 0)
	progRand = append(progRand, float64((m.progress)*100.0/(m.progressMax+1.0)))
	progress.Progress = progRand
	progress.Phase = phases
	progress.Done = m.done
	progress.Info = m.message
	return progress
}

func nodeFields() []string {
	return []string{"node_memory_Active", "node_memory_MemAvailable","node_cpu", "node_disk_io_now", "node_load1", "node_memory_MemFree", "node_memory_MemFree", "node_memory_MemTotal", "node_network_receive_bytes", "node_network_transmit_bytes"}
}

func (m *Metrics) Collect(duration time.Duration, exporterPort, dockerPort int, filter filters.Args) {
	m.interval = duration
	errors := make(chan error)

	nodeMetrics := make(chan NodeMetrics)
	dockerMetrics := make(chan DockerMetrics)
	for _, node := range m.nodes {
		go prometheusCollector(m.ctx, node, fmt.Sprintf("http://%s:%d/metrics", node, exporterPort),
			nodeMetrics, errors, nodeFields(), duration)

		go dockerCollector(m.ctx, node, fmt.Sprintf("http://%s:%d", node, dockerPort),
			dockerMetrics, errors, filter, duration)
	}

	for {
		select {
		case nm := <-nodeMetrics:
			m.nodeMetrics[nm.name].Value = CreateNodeStats(nm.values)
			m.nodeMetrics[nm.name] = m.nodeMetrics[nm.name].Next()
		case dm := <-dockerMetrics:
			m.dockerMetrics[dm.name] = &dm
		case err := <-errors:
			fmt.Printf("%+v\n", err)
		case <-m.ctx.Done():
			return
		}
	}
}

func New(ctx context.Context, nodes []string, ringLength int) *Metrics {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	m := &Metrics{
		ctx:           ctx,
		nodes:         nodes,
		nodeMetrics:   make(map[string]*ring.Ring),
		dockerMetrics: make(map[string]*DockerMetrics),
		directMessages: make(chan ProgressMessage),
	}

	for _, n := range nodes {
		m.nodeMetrics[n] = ring.New(ringLength)
	}

	return m
}
