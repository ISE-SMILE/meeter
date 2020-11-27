package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/docker/docker/api/types/filters"

	"github.com/ise-smile/meeter/collector"
)

const docker_metrics = 2376
const node_metrics = 9100

func main() {
	ctx, cancel := context.WithCancel(context.Background())

	//run cleanup code
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		cancel()
		os.Exit(1)
	}()

	metrics := collector.New(ctx, os.Args[1:], 15)

	go metrics.Collect(time.Second*2, node_metrics, docker_metrics, filters.NewArgs())

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	http.HandleFunc("/data", metrics.Stream)

	log.Println("Listening on :3333...")
	err := http.ListenAndServe(":3333", nil)
	if err != nil {
		log.Fatal(err)
	}

	<-ctx.Done()
}
