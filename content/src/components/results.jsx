import React, { Component } from 'react';
import {Button, Container} from 'react-bootstrap';


class Results extends Component{

    render(){
        return <Container>
            <Button onClick={this.props.again} style={{alignSelf: 'flex-end'}}>Do it again</Button>
        </Container>
    }
}

export default Results;