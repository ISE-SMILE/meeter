package collector

import (
	io_prometheus_client "github.com/prometheus/client_model/go"
)

type Message struct {
	Name     string  `json:"name"`
	Runtimes []int8  `json:"runtimes"`
	CPUIdle  float64 `json:"cpuIdle"`
	CPULoad  float64 `json:"cpuLoad"`
	MEMfree  float64 `json:"memFree"`
	MEMTotal float64 `json:"memTotal"`
	NETRec   float64 `json:"netRec"`
	NETTra   float64 `json:"netTra"`
	NET      float64 `json:"net"`
	CPUMax   float64 `json:"cpuMax"`
}

type NodeMetrics struct {
	name   string
	values map[string]*io_prometheus_client.MetricFamily
}

type DockerMetrics struct {
	name    string
	Running int    `json:"running"`
	Paused  int    `json:"paused"`
	Total   int    `json:"total"`
	State   []int8 `json:"stateArray"`
}

type ProgressMessage struct {
	Messages []Message `json:"nodes"`
	Progress []int8    `json:"progress"`
	Phase    []string  `json:"phase"`
	Done     bool      `json:"done"`
}
