package collector

import (
	"context"
	"fmt"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

func dockerCollector(ctx context.Context, name, url string, stream chan DockerMetrics, errors chan error, filters filters.Args, refreshInterval time.Duration) {
	cli, err := client.NewClient(url, "v1.24", nil, nil)
	if err != nil {
		errors <- err
		return
	}

	for {
		list, err := cli.ContainerList(ctx, types.ContainerListOptions{
			Quiet:   false,
			Size:    false,
			All:     true,
			Latest:  false,
			Since:   "",
			Before:  "",
			Limit:   0,
			Filters: filters,
		})

		if err != nil {
			errors <- err
		} else {
			var running = 0
			var paused = 0
			var total = 0
			var state = make([]int8,0)
			for _, container := range list {
				var val int8 = 0
				switch status := container.State; status {
				case "running":
					val = 2
					running++
				case "paused":
					val =1
					paused++

				}
				total++
				state = append(state,val)
			}

			stream <- DockerMetrics{
				name:    name,
				Running: running,
				Paused:  paused,
				Total:   total,
				State: state,
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
