import React, { Component } from 'react';
import Nodeview from './nodeView';
import { Container,Row } from 'react-bootstrap';

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
    }


    componentDidMount() {
        const {websocket} = this.props // websocket instance passed as props to the child component.
        this.connect(websocket);
    }

    connect(websocket){
        if(websocket != null){
            websocket.onmessage = evt => {
                // listen to data sent from the websocket server
                const nodes = JSON.parse(evt.data)
                this.setState({nodes: nodes})
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

    render() { 
        return (
            <Container fluid className="dashboard">
                {this.connect(this.props.websocket)}
                {this.build()}
            </Container>
        );
    }
}
 
export default Dashboard;