import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Theme from 'config/theme'
import { MessageSvc } from 'services/message'
import I18n from '/i18n'

export default class ChatRow extends Component {

  static defaultProps = {
    id: null,
    name: null,
    lastSeen: null,
  }

  render() {

    const lastSeen = MessageSvc.readableTs(this.props.lastSeen)

    let
      avaText = this.props.name.match(/\b\w/g) || []
      avaText = ((avaText.shift() || '') + (avaText.pop() || '')).toUpperCase()

    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.8}
        onPress={() => $.navigator.navigate('Room', { peer: this.props.id })}
        onLongPress={() => $.navigator.navigate('Room', { peer: this.props.id })}
      >
        <View style={styles.ava}>
          <Text style={styles.avaText}>{ avaText }</Text>
        </View>
        <View style={styles.notAva}>
          <Text style={styles.nameText}>{ this.props.name }</Text>
          <Text style={styles.lastSeen}>Last seen: { lastSeen }</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height: 64,
    backgroundColor: Theme.white,
    flexDirection: 'row',
  },
  ava: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.black,
    borderRadius: 44,
    height: 44,
    width: 44,
    margin: 10,

    elevation: 3, // android
  },
  notAva: {
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: Theme.gray,
    flex: 1,
    height: 64,
    justifyContent: 'center',
  },
  avaText: {
    color: Theme.black,
    fontSize: 18,
    paddingBottom: 2,
    // fontFamily: Theme.condensedFont,
  },
  nameText: {
    fontSize: 15,
    color: Theme.black,
    fontFamily: Theme.thinFont,
    paddingBottom: 1,
  },
  lastSeen: {
    fontSize: 10,
    color: Theme.gray,
    fontFamily: Theme.thinFont,
  },
})
