import React from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';

const ProgressBar = (props) => {
    const { bgcolor, completed } = props;
  
    const containerStyles = {
      height: 30,
      width: '100%',
      backgroundColor: "#e0e0de",
      borderRadius: 50,
      margin: 5,
      alignSelf:"left"
    }
  
    const fillerStyles = {
      height: '100%',
      width: `${completed}%`,
      backgroundColor: bgcolor,
      borderRadius: 'inherit',
      textAlign: 'center',
      transition: 'width 1s ease-in-out'
    }
  
    const labelStyles = {
      height:'100%',
      padding: 1,
      color: 'white',
      fontWeight: 'bold',
      fontSize: 20
    }
    
  
    return (
      <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>{`${completed}%`}</span>
      </div>
    </div>
      
    );
  };
  
  export default ProgressBar;
  