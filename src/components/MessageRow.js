import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Theme from 'config/theme'

export default class MessageRow extends Component {

  static defaultProps = {
    body: '',
    userId: null,
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{ this.props.userId || 'me' }: { this.props.body }</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
