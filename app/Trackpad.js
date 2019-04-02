import React, {Component} from 'react';
import {Animated, PanResponder, TouchableOpacity, View} from 'react-native';
import WS from 'react-native-websocket'
import dgram from 'dgram';


function toByteArray(obj) {
    let uint = new Uint8Array(obj.length);
    for (let i = 0, l = obj.length; i < l; i++) {
        uint[i] = obj.charCodeAt(i);
    }
    return new Uint8Array(uint);
}


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
        };

        let b = dgram.createSocket('udp4');
        const msg = toByteArray('ping');
        console.log("Broadcasting " + msg);
         b.send(msg, 0, msg.length, 50000, '255.255.255.255', function(err) {
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
        return (
            <React.Fragment>
                <WS
                    ref={ref => { this.ws = ref }}
                    url="ws://10.0.0.50:8080/ws"
                    onOpen={() => {
                        console.log('Open!');
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