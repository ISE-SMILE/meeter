import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDom from 'react-dom'
import './theme.css'


import { defaults } from 'react-chartjs-2';
import Main from './components/Main';
import { Container } from 'react-bootstrap';

defaults.global.legend=false;
defaults.global.scaleShowLabels = false;

// ReactDom.render(<Main/>,document.getElementById("root"));

function getView(){
    return <Container><Main/></Container>
}

ReactDom.render(getView(),document.getElementById("root"));