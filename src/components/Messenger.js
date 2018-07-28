import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Theme from 'config/theme'

export default class Messenger extends Component {

  static defaultProps = {

  }

  state = {

  }

  takeData(chId, peerId, data) {

  }

  render() {
    return (
      <View style={styles.container}>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.gray,
  },
})
