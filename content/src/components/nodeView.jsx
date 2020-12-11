import React, { Component } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import ProgressBar from './progessBar';
import Graph from './nodeGraph';
import HeatMap from './heatMap';
import Gauge from './gauge'
class Nodeview extends Component {
    state = { 

    }

    header(){
        if (this.props.header){
            return (
                <Card.Header>
                <Container fluid>
                 <Row>
                    <Col ms={3}><h6 className>Runtimes</h6></Col>
                    <Col xs={3}><h6>CPU Usage [%]</h6></Col>
                    <Col xs={3}><h6>Memory Usage [%]</h6></Col>
                    <Col xs={3}><h6>Network (Transmit-Received)</h6></Col>
                </Row>
                </Container>
                </Card.Header>);
        } else {
            return '';
        }
    }

    render() { 
        return (
           
                    <Container fluid>
                    <Row>
                        <Col><h6 style={{margin:5}}>Total Progress</h6><ProgressBar completed={this.props.prog} label={`${this.props.prog}%`} style={{width:'100%'}} /></Col>
                    </Row>
                        <Row>
                            <Col ms={3} ><HeatMap data={this.props.runtimes}/></Col>
                            <Col xs={3}><Gauge value={this.props.cpu*100} label="CPU usage" /></Col>
                            <Col xs={3}><Gauge value={this.props.mem} label ="MEM usage"/></Col>
                            <Col xs={3}><Gauge value={this.props.net} label ="Network"/></Col>
                        
                        </Row>
                    </Container>

        );
    }
}
 
export default Nodeview;