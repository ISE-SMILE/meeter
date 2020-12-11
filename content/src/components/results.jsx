import React, { Component } from 'react';
import {Button, Card, Container} from 'react-bootstrap';


class Results extends Component{

    render(){
        return <Card>
            <Card.Header>Results</Card.Header>
            <Card.Body> Tolle grafiken! alles super schnell und billig gewesen</Card.Body>
            <Card.Footer><Button onClick={this.props.again} style={{float:"right"}} >Do it again</Button></Card.Footer>
        </Card>
    }
}

export default Results;