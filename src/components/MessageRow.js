import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MessageSvc } from 'services/message'
import Theme from 'config/theme'

export default class MessageRow extends Component {

  static defaultProps = {
    body: '',
    userId: null,
  }

  render() {
    const
      isMe = this.props.userId === null,
      ts = MessageSvc.readableTs(this.props.ts)

    return (
      <View style={[styles.container, {justifyContent: isMe ? 'flex-end' : 'flex-start'}]}>
        <View style={[styles.bubble, isMe ? styles.bblLocal : styles.bblRemote]}>
          <Text style={isMe ? styles.bodyLocal : styles.bodyRemote}>
            { this.props.body }
          </Text>
          <Text style={styles.ts}>{ ts }</Text>
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderColor: Theme.gray,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Theme.white,
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
    textAlign: 'right',
  },
  bodyRemote: {
    color: Theme.black,
  },
  ts: {
    marginTop: 2,
    color: Theme.gray,
    fontSize: 10,
    fontFamily: Theme.thinFont,
    textAlign: 'right',
  },
})
