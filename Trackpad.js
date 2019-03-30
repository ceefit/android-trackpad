import React, {Component} from 'react';
import { PanResponder, Text, View } from 'react-native';
import WS from 'react-native-websocket'

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

  constructor(props) {
    super(props);

    this.state = {
        'pan' : {'x': 0, 'y': 0},
        'color' : 'steelblue',
        'ref': null,
    };

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
          this.setState({'color': 'yellow'});
          let msg = evt.nativeEvent.locationX + "x" + evt.nativeEvent.locationY;
          this.sendMessage(msg);
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
          let msg = evt.nativeEvent.locationX + "x" + evt.nativeEvent.locationY;
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
            <View style={{width: "100%", height: "100%", backgroundColor: this.state.color}}  {...this._panResponder.panHandlers}>
                <Text>lol</Text>
                <WS
                  ref={ref => {this.ws = ref}}
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
            </View>
        </React.Fragment>
    );
  }
}
export default Trackpad