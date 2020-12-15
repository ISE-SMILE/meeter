import React, { Component } from 'react';
import Nodeview from './nodeView';
import { Button, Container,Row, Col, Card } from 'react-bootstrap';
//import ProgressBar from './progessBar';

class Dashboard extends Component {
    state = {  
        nodes : [
            // {
            //     name:"localhost",
            //     runtimes:[2,1,2,1,1,2,1,2,1,2,2,2,2,0,0,0,0] ,
            //     labels:[1,2,3,4,5,6,7,8,9,10],
            //     cpu:[20,20,30,40,60,20,20,20,40,60],
            //     mem:[20,20,30,40,60,20,20,20,40,60],
            //     net:[20,-20,30,-40,60,20,20,20,40,60],
            // }
        ],
        listening:false,
        progress : [],
        finished: false
    }


    componentDidMount() {
        const {websocket} = this.props // websocket instance passed as props to the child component.
        this.connect(websocket);
    }

    connect(websocket){
        if(websocket != null){
            websocket.onmessage = evt => {
                // listen to data sent from the websocket server
                const data=JSON.parse(evt.data)
                const nodes = data.nodes
                const progress= data.progress
                const phase= data.phase
                const done =data.done
                this.setState({nodes: nodes, progress: progress, phase:phase, done:done})
            }
        }
    }

    // componentDidUpdate(){
    //     const {websocket} = this.props // websocket instance passed as props to the child component.
        
    //     if (!this.isConnected()){
    //         console.log("setting up update");
    //         websocket.onmessage = evt => {
    //             // listen to data sent from the websocket server
    //             const nodes = JSON.parse(evt.data)
    //             this.setState({nodes: nodes})
    //             this.setState({
    //                 listening:true,
    //             })
    //         }
            
    //     } 
    // }

    isConnected = () =>{
        const { websocket } = this.state;
        return (websocket && websocket.readyState !== WebSocket.CLOSED) && this.state.listening;
    }


    build(){
        var res={runtimes:[], cpuIdle:0, cpuLoad:0,memFree:0,memTotal:0,net:0, netTra:0, netRec:0}
        var node;
        for (node of this.state.nodes){
            res.runtimes=res.runtimes.concat(node.runtimes)
            res.cpuIdle+=node.cpuIdle
            res.cpuLoad+=node.cpuLoad
            res.memFree+= node.memFree
            res.memTotal+= node.memTotal
            res.netRec+=node.netRec
            res.netTra+=node.netTra
            res.net+=node.net
            
        }

        const allRuntimes= res.runtimes
        const allCpu=res.cpuLoad/(res.cpuLoad+res.cpuIdle)
        const allMem=(res.memTotal-res.memFree)/res.memTotal
        const allNet=(res.netRec+res.netTra)/(this.state.nodes.length*1000000000)
        return( 
            <Row key="dashboard" ><Nodeview  
            runtimes={allRuntimes} 
            cpu={allCpu}
            prog={this.state.progress[0]} 
            mem={allMem} 
            net={allNet} 
            /></Row>
        )
         
    }
    
    
    continue(){
        return (this.state.done)?<Button onClick={this.props.finished} style={{float:"right"}}>Results</Button>:<div/>
        
    }
   
    render() { 
        

        return (
            <Card className="shadow-sm" style={{marginTop: "20px"}} >
                <Card.Header><div style={{
                        color: "#8b8ba7",
                        marginTop: "0.6em",
                        fontSize: "2em",
                        lineHeight: "1.3em",
                        fontWeight: "700",
                    }}>
                        Dashboard
                </div></Card.Header>
                <Container >
                {this.connect(this.props.websocket)}
                {this.build()}
                </Container>
               
        <Card.Footer><Container >Processing: testdata.csv {this.continue()}</Container></Card.Footer>
            </Card>
            
        );
    }
}
 
export default Dashboard;