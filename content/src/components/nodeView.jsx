import React, { Component } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import ProgressBar from './progessBar';
import Graph from './nodeGraph';
import HeatMap from './heatMap';
import Gauge from './gauge'
class Nodeview extends Component {
    state = {

    }

    header() {
        if (this.props.header) {
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
        const labelStyle={
            color: "#8b8ba7",
            marginTop: "0.6em",
            fontSize: "1.3em",
            lineHeight: "1.3em",
            fontWeight: "700",
            textAlign:"center",
        };
    
        return (

            <Container fluid>
                <Row>
                    <Col><h6 style={{ margin: 5 }}><div style={{
                        color: "#8b8ba7",
                        marginTop: "0.6em",
                        fontSize: "1.3em",
                        lineHeight: "1.3em",
                        fontWeight: "700",
                    }}>
                        Total Progress
                </div></h6><ProgressBar completed={this.props.prog} label={`${this.props.prog}%`} style={{ width: '100%' }} bgcolor="#4834d4"/></Col>
                </Row>
                <Row>
                    <Col ms={3} ><HeatMap data={this.props.runtimes} /></Col>
                    <Col xs={3}><Gauge value={this.props.cpu * 100}  /></Col>
                    <Col xs={3}><Gauge value={this.props.mem}  /></Col>
                    <Col xs={3}><Gauge value={this.props.net}  /></Col>

                </Row>
                <Row style={{marginBottom: "0.4em", marginTop: "0em"}}>
                    <Col ms={3} ><div style={labelStyle}>
                        Runtimes
                </div></Col>
                    <Col xs={3}><div style={labelStyle}>
                        CPU usage
                </div></Col>
                    <Col xs={3}><div style={labelStyle}>
                       MEM usage
                </div></Col>
                    <Col xs={3}><div style={labelStyle}>
                        Network
                </div></Col>

                </Row>
            </Container>

        );
    }
}

export default Nodeview;