import React, { Component } from 'react';
import {Button, Card, Container,Row,Col} from 'react-bootstrap';
import Gauge from './gauge'

class Results extends Component{

    render(){
        const cidLabel=this.props.report.CIds+" Runtimes";
        const hidLabel=this.props.report.HIds+" Nodes";
        const readLabel=this.props.report.reads+" Read [MB]";
        const runtimeLabel=this.props.report.eLat+" Runtime [ms]";

        return <Card style={{marginTop:"20px"}}>
            <Card.Header>
                <div style={{
                             color: "#8b8ba7",
                             marginTop: "0.6em",
                             fontSize: "2em",
                             lineHeight: "1.3em",
                             fontWeight: "700",
                         }}>
                    Results
                 </div>
             </Card.Header>
            <Card.Body>
            <Container >
                 <Row>
                    <Col xs={3}><Gauge value={this.props.report.CIds} max={100} label={cidLabel}/></Col>
                    <Col xs={3}><Gauge value={this.props.report.HIds}  max={5} label={hidLabel} /></Col>
                    <Col xs={3}><Gauge value={this.props.report.reads} max={30000} label={readLabel} /></Col>
                    <Col xs={3}><Gauge value={this.props.report.eLat} max={3600} label={runtimeLabel} /></Col>
                 </Row>
                 <Row>
                    <Col ms={12} style={{"text-align":"center"}}>
                        <h5>Used {this.props.report.CId}  unique runtimes and {this.props.report.HId}  unique node</h5>
                        <h5>Throughput of {this.props.report.tps}MB/s with a equivalent cost of {this.props.report.cost}$</h5>
                    </Col>
                 </Row>
                 </Container>
            </Card.Body>
            <Card.Footer><Button onClick={this.props.again} style={{float:"right"}} >Do it again</Button></Card.Footer>
        </Card>
    }
}

export default Results;