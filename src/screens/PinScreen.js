import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import Theme from 'config/theme'

export default class PinScreen extends Component {

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
