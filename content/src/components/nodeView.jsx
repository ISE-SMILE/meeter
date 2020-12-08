import React, { Component } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
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
            <Card className="shadow-sm">
                {this.header()}
                <Card.Body>
                    <Container fluid>
                        <Row>
                            <Col ms={3} ><HeatMap data={this.props.runtimes}/></Col>
                            <Col xs={3}><Gauge value={this.props.cpu*100} /></Col>
                            <Col xs={3}><Gauge value={this.props.mem} /></Col>
                            <Col xs={3}><Gauge value={this.props.net} /></Col>
                        
                        </Row>
                    </Container>
                </Card.Body>
        <Card.Footer className="text-right">{this.props.name}</Card.Footer>
            </Card>
        );
    }
}
 
export default Nodeview;