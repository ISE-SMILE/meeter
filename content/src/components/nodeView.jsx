import React, { Component } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import Graph from './nodeGraph';
import HeatMap from './heatMap';
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
                            <Col xs={3}><Graph color="128,29,211" title="CPU" data={this.props.cpu} labels={this.props.labels}/></Col>
                            <Col xs={3}><Graph color="128,211,29" title="MEM" data={this.props.mem} labels={this.props.labels}/></Col>
                            <Col xs={3}><Graph color="128,29,211" title="Net" data={this.props.net} labels={this.props.labels}/></Col>
                        </Row>
                    </Container>
                </Card.Body>
        <Card.Footer className="text-right">{this.props.name}</Card.Footer>
            </Card>
        );
    }
}
 
export default Nodeview;