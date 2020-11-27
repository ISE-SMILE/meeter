import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';

class Graph extends Component {
    constructor(props){
        super();
    }

    getPlot(){
        const labels = this.props.labels;
        const data = this.props.data;
        
        const title = this.props.title;
        const color = this.props.color

        return {
            labels: labels,
            datasets: [
              {
                label: title,
                fill: true,
                lineTension: 0.1,
                backgroundColor: 'rgba('+color+',0.4)',
                borderColor: 'rgba('+color+',1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba('+color+',1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba('+color+',1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: data,
              }
            ]
          }
    }
    

    render() { 
        return ( <React.Fragment><Line data={this.getPlot()} options={{
            scales: {
                yAxes: [{
                    ticks: {
                        display: false
                    }
                }]
        }}} /></React.Fragment> );
    }
}
 
export default Graph;