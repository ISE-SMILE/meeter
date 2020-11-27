import React, { Component } from 'react';

const active = '#79db88';
const paused = '#e2ece3';
const stopped = '#aeaea5';
const margin = 1;
const blockPerRow = 20;

class HeatMap extends Component {  

    drawState(){
        const canvas = this.refs.canvas
        const ctx = canvas.getContext("2d")
        const width = canvas.width;
        const height = canvas.height;
  
        const box = (width-(margin*blockPerRow*2))/blockPerRow;
        const max_rows = Math.floor(height/(box+2*margin));
        
        if  (!this.props.data) {
            return
        }
        const data = this.props.data
	
        for(var rows = 0;rows < max_rows;rows++){
            for(var i = 0; i < blockPerRow;i++){
                var idx = blockPerRow*rows+i;
                if(idx < data.length){
                    switch(data[idx]){
                        case 2: ctx.fillStyle = this.props.active?this.props.active:active; break;
                        case 1: ctx.fillStyle = this.props.paused?this.props.paused:paused;; break;
                        case 0: ctx.fillStyle = this.props.stopped?this.props.stopped:stopped;; break;
                        default:
                            ctx.fillStyle = '#fff'; 
                    }
                    ctx.fillRect(i*box+2*i*margin, rows*box+2*rows*margin, box, box);
                }
                
            }
        }
    }

    componentDidMount() {
        this.drawState();
    }  

    componentDidUpdate(){
        this.drawState();
    }
  
    render() {
        return(
            <React.Fragment>
                <canvas ref="canvas" className="ms-3" style={{height:"100%", width:"100%"}}  />
            </React.Fragment>
        )
    }
}

export default HeatMap