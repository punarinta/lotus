import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Theme from 'config/theme'

export default class MessageRow extends Component {

  static defaultProps = {
    body: '',
    userId: null,
  }

  render() {
    const isMe = this.props.userId === null

    return (
      <View style={[styles.container, {justifyContent: isMe ? 'flex-end' : 'flex-start'}]}>
        <View style={[styles.bubble, isMe ? styles.bblLocal : styles.bblRemote]}>
          <Text style={isMe ? styles.bodyLocal : styles.bodyRemote}>
            { this.props.body }
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
  },
  bubble: {
    padding: 8,
    borderRadius: 6,
    borderColor: Theme.gray,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Theme.white,
    // elevation: 1, // android
  },
  bblLocal: {
    marginLeft: 64,
    marginRight: 16,
    borderBottomRightRadius: 0,
  },
  bblRemote: {
    marginLeft: 16,
    marginRight: 64,
    borderBottomLeftRadius: 0,
  },
  bodyLocal: {
    color: Theme.black,
  },
  bodyRemote: {
    color: Theme.black,
  },
})
