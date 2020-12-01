import React, { Component } from 'react';
import Nodeview from './nodeView';
import { Button, Container,Row } from 'react-bootstrap';
import ProgressBar from './progessBar';

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
                this.setState({nodes: nodes, progress: progress})
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
        return this.state.nodes.map( (val,index) => 
            <Row key={index} ><Nodeview key={val.name} header={index===0} name={val.name}  
            runtimes={val.runtimes} 
            labels={val.labels} 
            cpu={val.cpu} 
            mem={val.mem} 
            net={val.net} 
            /></Row>
         )
    }
    progress(){
        return this.state.progress.map((val,index) =>
        <Row key={index}>{index}<ProgressBar bgcolor={"#6a1b9a"} completed={val}/></Row>)
    }

    
    continue(){
        return (this.state.progress[0]===100)?<Button onClick={this.props.finished}>Results</Button>:
        <Row/>
    }

    render() { 
        return (
            <Container fluid className="dashboard">
                {this.progress()}
                {this.connect(this.props.websocket)}
                {this.build()}
                {this.continue()}
            </Container>
        );
    }
}
 
export default Dashboard;