import React, { Component } from 'react';
import {Button, Container} from 'react-bootstrap';

class StartPage extends Component{
    render(){
        return <Container>
            <img src='/SMILE_logo.png'/>
            <div>
                <Button onClick={this.props.start} style={{alignSelf: 'flex-end'}}>Start Experiments</Button>
            </div>
        </Container>
    }
}
export default StartPage;