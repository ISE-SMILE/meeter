package main

import (
	"context"
	"github.com/ise-smile/meeter/collector"
	"os"
	"os/signal"
	"syscall"
	"time"
)

const docker_metrics = 2376
const node_metrics = 9100

func main() {
	ctx, cancel := context.WithCancel(context.Background())

	//run cleanup code
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)


	metrics := collector.New(ctx, os.Args[1:], 15)

	go func() {
		<-c
		cancel()
		report := make(map[string]interface{})
		report["CIds"] = 4
		report["HIds"] = 1
		report["runtime"] = 13256
		report["reads"] = 197
		report["eLat"] = 403
		report["cost"] = float64(13256)*0.0000000083
		report["tps"] = 197.0/(13256/1000.0)


		metrics.Finish(report)
	}()

	metrics.Setup()
	go metrics.Simulate()
	go metrics.Render()

	<-ctx.Done()

	<-time.After(10*time.Second)
}
