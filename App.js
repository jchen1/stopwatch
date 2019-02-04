/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {AppState, Button, Platform, StyleSheet, Text, View, Vibration} from 'react-native';
import SystemSetting from 'react-native-system-setting';
import moment from 'moment';

function leftpad(input, minLength, padChar) {
  const str = String(input);
  if (str.length >= minLength) return str;
  return padChar.repeat(minLength - str.length) + str;
}

function getDisplayTime(duration) {
  const diff = moment.duration(duration, 'milliseconds');
  const hours = leftpad(Math.floor(diff.asHours()), 2, '0');
  const minutes = leftpad(Math.floor(diff.asMinutes()), 2, '0');
  const seconds = leftpad(Math.floor(diff.asSeconds()), 2, '0');
  const ms = leftpad(Math.floor(diff.asMilliseconds() / 10) % 100, 2, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

export default class App extends Component {
  constructor(props) {
    super(props);
    SystemSetting.getVolume().then(v => {
      this.initialVolume = v;
      SystemSetting.setVolume(this.initialVolume);
    });
    this.bindVolumeListener();
    this.state = { running: false, startTime: null, timer: null, runningTime: null, appState: AppState.currentState };
  }

  bindVolumeListener = () => {
    setTimeout(() => {
      this.volumeListener = SystemSetting.addVolumeListener(this.volumeHandler);
    }, 100);
  }

  unbindVolumeListener = () => {
    if (this.volumeListener) {
      SystemSetting.removeVolumeListener(this.volumeListener);
      this.volumeListener = null;
    }
  }

  componentDidMount = () => {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  volumeHandler = newVolume => {
    this.startStop();
    Vibration.vibrate(1);
    SystemSetting.removeVolumeListener(this.volumeListener);
    SystemSetting.setVolume(this.initialVolume);
    this.bindVolumeListener();
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      this.bindVolumeListener();
    } else {
      this.unbindVolumeListener();
    }
  }

  startStop = () => {
    this.setState(previousState => {
      if (previousState.running) {
        clearInterval(previousState.timer);
        return { running: false, timer: null };
      } else {
        const startTime = Date.now() - previousState.runningTime;
        const timer = setInterval(() => {
          this.setState(previousState => {
            return { runningTime: Date.now() - previousState.startTime };
          });
        }, 5);
        return { startTime, running: true, runningTime: Date.now() - startTime, timer };
      }
    });
  }

  reset = () => {
    if (!this.state.running) {
      this.setState(previousState => {
        if (previousState.running) {
          clearInterval(previousState.timer);
        }
        return { running: false, timer: null, startTime: null, runningTime: null};
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.timer}>{getDisplayTime(this.state.runningTime)}</Text>
        <View style={styles.buttonContainer}>
          <Button style={styles.button} onPress={this.startStop} title={this.state.running ? "Stop" : "Start"}></Button>
          <Button style={styles.button} onPress={this.reset} title="Reset" color="#ff0000" disabled={this.state.running}></Button>
        </View>
      </View>
    );
  }

  componentWillUnmount = () => {
    clearInterval(this.state.timer);
    this.unbindVolumeListener();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // idk...
    flexGrow: 0.1,
  },
  timer: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
    fontFamily: 'CourierNewPS-BoldMT',
  },
  button: {
    width: '50%',
  }
});
