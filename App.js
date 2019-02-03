/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Button, Platform, StyleSheet, Text, View, Vibration} from 'react-native';
import SystemSetting from 'react-native-system-setting';
import moment from 'moment';

function getDisplayTime(duration) {
  const diff = moment.duration(duration, 'milliseconds');
  const hours = Math.floor(diff.asHours()).toLocaleString(undefined, { minimumIntegerDigits: 2 });
  const minutes = Math.floor(diff.asMinutes()).toLocaleString(undefined, { minimumIntegerDigits: 2 });
  const seconds = Math.floor(diff.asSeconds()).toLocaleString(undefined, { minimumIntegerDigits: 2 });
  const tail = (Math.floor(diff.asMilliseconds() / 10) % 100).toLocaleString(undefined, { minimumIntegerDigits: 2 });
  return `${hours}:${minutes}:${seconds}:${tail}`;
}

export default class App extends Component {
  constructor(props) {
    super(props);
    SystemSetting.getVolume().then(v => { this.initialVolume = v });
    this.volumeListener = SystemSetting.addVolumeListener(this.volumeHandler);
    this.state = { running: false, startTime: null, timer: null, runningTime: null };
  }

  volumeHandler = newVolume => {
    this.startStop();
    Vibration.vibrate(1);
    SystemSetting.removeVolumeListener(this.volumeListener);
    SystemSetting.setVolume(this.initialVolume);
    setTimeout(() => {
      this.volumeListener = SystemSetting.addVolumeListener(this.volumeHandler);
    }, 100);
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
        return { startTime, running: true, runningTime: 0, timer };
      }
    });
  }

  reset = () => {
    this.setState(previousState => {
      if (previousState.running) {
        clearInterval(previousState.timer);
      }
      return { running: false, timer: null, startTime: null, runningTime: null};
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.timer}>{getDisplayTime(this.state.runningTime)}</Text>
        <Button onPress={this.startStop} title={this.state.running ? "Stop" : "Start"}></Button>
        <Button onPress={this.reset} title="Reset"></Button>
      </View>
    );
  }

  componentWillUnmount = () => {
    clearInterval(this.state.timer);
    SystemSetting.removeVolumeListener(this.volumeListener);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  timer: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
  },
});
