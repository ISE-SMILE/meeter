package collector

import (
	"context"
	"fmt"
	"net/http"
	"time"

	io_prometheus_client "github.com/prometheus/client_model/go"
	"github.com/prometheus/common/expfmt"
)

type NodeStats struct {
	CPUUser   float64 `json:"user"`
	CPUSystem float64 `json:"system"`
	CPUIdle   float64 `json:"idle"`
	CPUIOWait float64 `json:"iowait"`

	Froks     float64 `json:"forks"`
	DiskUsage float64 `json:"disk"`

	Load float64 `json:"load"`

	MemFree  float64 `json:"free"`
	MemTotal float64 `json:"total"`

	NetRev float64 `json:"recived"`
	NetTra float64 `json:"transmitted"`

	CPUUserDelta   float64 `json:"duser"`
	CPUSystemDelta float64 `json:"dsystem"`
	CPUIdleDelta   float64 `json:"didle"`
	CPUIOWaitDelta float64 `json:"diowait"`
	ForksDelta     float64 `json:"dfork"`
	MemUsage       float64 `json:"mem"`
}

func CreateNodeStats(values map[string]*io_prometheus_client.MetricFamily) NodeStats {
	u, s, i, o := CPUStats(values["node_cpu"])
	stats :=  NodeStats{
		u,
		s,
		i,
		o,
		SumCounters(values["node_forks_total"]),
		SumGauge(values["node_disk_io_now"]),
		SumGauge(values["node_load1"]),
		SumGauge(values["node_memory_MemFree"]),
		SumGauge(values["node_memory_MemTotal"]),
		SumGauge(values["node_network_receive_bytes"]),
		SumGauge(values["node_network_transmit_bytes"]),
		0, 0, 0, 0, 0, 0,
	}
	stats.MemUsage = SumGauge(values["node_memory_Active"])/stats.MemTotal
	return stats
}

func (m *NodeStats) update(stats NodeStats) {
	m.CPUUserDelta = m.CPUUser - stats.CPUUser
	m.CPUSystemDelta = m.CPUSystem - stats.CPUSystem
	m.CPUIdleDelta = m.CPUIdle - stats.CPUIdle
	m.CPUIOWaitDelta = m.CPUIOWait - stats.CPUIOWait

	m.ForksDelta = m.Froks - stats.Froks
	m.MemUsage = stats.MemFree / stats.MemTotal

	m.CPUUser = stats.CPUUser
	m.CPUSystem = stats.CPUSystem
	m.CPUIdle = stats.CPUIdle
	m.CPUIOWait = stats.CPUIOWait

	m.MemTotal = stats.MemTotal
	m.MemFree = stats.MemFree

	m.Froks = stats.Froks
	m.DiskUsage = stats.DiskUsage

	m.Load = stats.Load
	m.NetRev = stats.NetRev
	m.NetTra = stats.NetTra
}

func CPUStats(metric *io_prometheus_client.MetricFamily) (float64, float64, float64, float64) {
	var user float64 = 0
	var system float64 = 0
	var idle float64 = 0
	var iowait float64 = 0

	for _, v := range metric.Metric {
		if LabelMatcher(v.Label, "mode", "iowait") {
			iowait += *v.Counter.Value
		}

		if LabelMatcher(v.Label, "mode", "user") {
			user += *v.Counter.Value
		}

		if LabelMatcher(v.Label, "mode", "system") {
			system += *v.Counter.Value
		}

		if LabelMatcher(v.Label, "mode", "idle") {
			idle += *v.Counter.Value
		}
	}

	return user, system, idle, iowait

}

func LabelMatcher(labels []*io_prometheus_client.LabelPair, key, val string) bool {
	for _, l := range labels {
		if l.Name != nil && l.Value != nil && *l.Name == key && *l.Value == val {
			return true
		}
	}
	return false
}

func SumCounters(metrics *io_prometheus_client.MetricFamily) float64 {
	var sum float64 = 0
	if metrics != nil {
		for _, v := range metrics.Metric {
			sum += *v.Counter.Value
		}
	}
	return sum
}

func SumGauge(metrics *io_prometheus_client.MetricFamily) float64 {
	var sum float64 = 0
	if metrics != nil {
		for _, v := range metrics.Metric {
			sum += *v.Gauge.Value
		}
		return sum / float64(len(metrics.Metric))
	}
	return 0
}

func prometheusCollector(ctx context.Context, name, url string, stream chan NodeMetrics, errors chan error, filter []string, refreshInterval time.Duration) {
	parser := expfmt.TextParser{}
	for {
		resp, err := http.Get(url)
		if err != nil {
			errors <- err
		} else {
			metrics, err := parser.TextToMetricFamilies(resp.Body)

			if err != nil {
				errors <- err
			} else {

				data := make(map[string]*io_prometheus_client.MetricFamily)
				for _, key := range filter {
					if val, ok := metrics[key]; ok {
						data[key] = val
					}
				}

				stream <- NodeMetrics{name, data}
				resp.Body.Close()

			}
		}

		select {
		case _ = <-time.After(refreshInterval):
			//nothing
		case _ = <-ctx.Done():
			fmt.Printf("[%s] cacneld", name)
			return

		}

	}
}
