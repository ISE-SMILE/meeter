import React, { Component } from 'react';
import Dashboard from './dashboard';
import {  Spinner } from 'react-bootstrap';
import Results from './results';
import StartPage from './startPage';

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ws: null,
            started: false,
            finished: false,
            report:null
        };
    }

    // single websocket instance for the own application and constantly trying to reconnect.

    componentDidMount() {
        this.connect();
    }

    timeout = 250; // Initial timeout duration as a class variable

    /**
     * @function connect
     * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
     */
    connect = () => {
        var ws = new WebSocket("ws://"+window.location.hostname+":3333/data");
        let that = this; // cache the this
        var connectInterval;

        // websocket onopen event listener
        ws.onopen = () => {
            console.log("connected websocket main component");

            this.setState({ ws: ws });

            that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onclose event listener
        ws.onclose = e => {
            console.log(
                `Socket is closed. Reconnect will be attempted in ${Math.min(
                    10000 / 1000,
                    (that.timeout + that.timeout) / 1000
                )} second.`,
                e.reason
            );

            that.timeout = that.timeout + that.timeout; //increment retry interval
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
        };

        // websocket onerror event listener
        ws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            ws.close();
        };
    };

    /**
     * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
     */
    check = () => {
        if (this.isConnected()) this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };

    isConnected = () =>{
        const { ws } = this.state;
        return (!ws || ws.readyState === WebSocket.CLOSED)
    }
    start = () =>{
        this.setState({started:true})
    }
    finished = (event) =>{
        const report = event.report;
        this.setState({finished:true,report:report})
    }
    again = () =>{
        this.setState({started:false, finished:false})
    }


    render() {
        if(!this.state.started){
            return <StartPage start={this.start}/>
        }
        if(!this.state.finished){
            return (!this.isConnected())?<Dashboard key={"view"} websocket={this.state.ws} finished={this.finished} />:
            <div className="text-center">
                <Spinner animation="border" role={"status"}>
                    <span className="sr-only" >Loading...</span>
                </Spinner>
            </div>;}

        return <Results again={this.again} report={this.state.report}/>
    }
}

export default Main;