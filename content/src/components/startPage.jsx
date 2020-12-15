import React, { Component } from 'react';
import {Button, Card, Container} from 'react-bootstrap';

class StartPage extends Component{
    render(){
        return <Card style={{marginTop:"20px"}}>
            <Card.Header>
            <img src='/SMILE_logo.png' alt="SMILE logo"/>
            </Card.Header>
            <Card.Body>Tolles Projekt und so</Card.Body>
            <Card.Footer>
            <Button onClick={this.props.start } style={{float:"right"}}>Start Experiments</Button>
            </Card.Footer>
        </Card> 
        
        
       
    }
}
export default StartPage;