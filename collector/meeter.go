package collector

import (
	"container/ring"
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	time "time"

	"github.com/docker/docker/api/types/filters"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{} //

type Metrics struct {
	nodes         []string
	nodeMetrics   map[string]*ring.Ring
	dockerMetrics map[string]*DockerMetrics
	ctx           context.Context
	interval      time.Duration
}

func (m *Metrics) data() []Message {

	messages := make([]Message, 0)

	for _, n := range m.nodes {
		message := Message{}

		cpu := 0.0
		mem := 0.0
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

				cpu = nodeMetrics.Load
				mem = nodeMetrics.MemUsage
				net = (nodeMetrics.NetTra - *_netTra) - (nodeMetrics.NetRev - *_netRev)

			}
		})

		message.CPU = cpu
		message.MEM = mem
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
			progress := ProgressMessage{}
			progress.Messages = m.data()
			progRand := make([]int8, 0)
			phases := make([]string, 0)
			phases = append(phases, "Total")
			phases = append(phases, "Starting")
			progRand = append(progRand, 100)
			progRand = append(progRand, int8(rand.Intn(101)))
			progress.Progress = progRand
			progress.Phase = phases
			progress.Done = true
			err := c.WriteJSON(progress)
			if err != nil {
				_ = c.Close()
			}
		}
	}
}

func nodeFields() []string {
	return []string{"node_memory_Active", "node_cpu", "node_disk_io_now", "node_load1", "node_memory_MemFree", "node_memory_MemFree", "node_memory_MemTotal", "node_network_receive_bytes", "node_network_transmit_bytes"}
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
			fmt.Println("[Collector] canceled")
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
	}

	for _, n := range nodes {
		m.nodeMetrics[n] = ring.New(ringLength)
	}

	return m
}
