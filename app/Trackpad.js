import React, {Component} from 'react';
import {Animated, PanResponder, TouchableOpacity, View} from 'react-native';
import WS from 'react-native-websocket'
import dgram from 'dgram';
let TextEndoder = require('text-encoding');
let TextDecoder = TextEndoder.TextDecoder;

class Trackpad extends Component {

    handleMessage(data) {
        console.log("data: " + data);
    }

    handleError() {
        console.log("error");
    }

    handleClose() {
        console.log("disconnected:(");
    }

    sendMessage(message) {
        this.state.ref.send(message);
    }

    onTapped() {
        this.sendMessage('tapped');
    }

    constructor(props) {
        super(props);

        this.state = {
            'pan': {'x': 0, 'y': 0},
            'color': 'steelblue',
            'ref': null,
            'serverUrl': null,
        };

        console.log("LOADING");

        let socket = dgram.createSocket('udp4');

        socket.on('error', (err) => {
              console.log(`server error:\n${err.stack}`);
              socket.close();
        });

        socket.on('message', (msg, rinfo) => {
            msg = new TextDecoder('utf-8').decode(msg)
            console.log(`server got: "${msg}" from ${rinfo.address}:${rinfo.port}`);
            if (msg.startsWith("Android-Trackpad IP:")) {
                console.log("Got an IP address reply, connecting");
                let serverIp = msg.replace("Android-Trackpad IP: ", "");
                this.setState({'serverUrl': "ws://" + serverIp + ":8080/ws"});
            } else {
                console.log("Got an unwanted UDP message. Ignoring it.");
            }
        });

        socket.on('listening', () => {
              const address = socket.address();
              console.log(`server listening ${address.address}:${address.port}`);
        });

        socket.bind(50000);

        const msg = new TextEncoder().encode('Android-Trackpad wants to know your IP');

        console.log("Broadcasting " + new TextDecoder("utf-8").decode(msg));

        socket.send(msg, 0, msg.length, 50000, '255.255.255.255', function(err) {
            if (err) throw err;
        });


        this.panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => false,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) >= 1 || Math.abs(gestureState.dy) >= 1
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

            onPanResponderGrant: (evt, gestureState) => {
                // The gesture has started. Show visual feedback so the user knows
                // what is happening!
                // gestureState.d{x,y} will be set to zero now
                this.setState({'color': 'yellow'});
            },
            onPanResponderMove: (evt, gestureState) => {
                // The most recent move distance is gestureState.move{X,Y}
                // The accumulated gesture distance since becoming responder is
                // gestureState.d{x,y}
                let msg = gestureState.moveX + "x" + gestureState.moveY;
                this.sendMessage(msg);
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                // The user has released all touches while this view is the
                // responder. This typically means a gesture has succeeded
                this.setState({'color': 'steelblue'});
                this.sendMessage('letoff');
            },
            onPanResponderTerminate: (evt, gestureState) => {
                // Another component has become the responder, so this gesture
                // should be cancelled
                console.log("ResponderTerminated");
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // Returns whether this component should block native components from becoming the JS
                // responder. Returns true by default. Is currently only supported on android.
                return true;
            },
        });
    }


    render() {
        return this.state.serverUrl == null ? (
            <React.Fragment>
                <View style={{width: "100%", height: "100%", backgroundColor: "red" }}/>
            </React.Fragment>
            ) : (
            <React.Fragment>
                <WS
                    ref={ref => { this.ws = ref }}
                    url={ this.state.serverUrl }
                    onOpen={() => {
                        this.setState({'ref': this.ws});
                    }}
                    onMessage={this.handleMessage}
                    onError={this.handleError}
                    onClose={this.handleClose}
                    reconnect // Will try to reconnect onClose
                />
                <Animated.View style={{width: "100%", height: "100%", backgroundColor: this.state.color }} {...this.panResponder.panHandlers}>
                    <TouchableOpacity  onPress={() => this.onTapped()} >
                        <View style={{width: "100%", height: "100%"}}/>
                    </TouchableOpacity>
                </Animated.View>

            </React.Fragment>
        );
    }
}

export default Trackpad