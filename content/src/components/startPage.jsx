import React, { Component } from 'react';
import {Button, Container} from 'react-bootstrap';

class StartPage extends Component{
    render(){
        return <Container>
            <Button onClick={this.props.start} style={{alignSelf: 'flex-end'}}>Start Experiments</Button>
        </Container>
    }
}
export default StartPage;