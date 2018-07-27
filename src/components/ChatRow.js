import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Theme from 'config/theme'

export default class ChatRow extends Component {

  static defaultProps = {
    id: null,
    name: null,
  }

  render() {

    let avaText = this.props.name.match(/\b\w/g) || []
    avaText = ((avaText.shift() || '') + (avaText.pop() || '')).toUpperCase()

    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.8}
        onPress={() => $.navigator.navigate('Chat', { peer: this.props.id })}
      >
        <View style={styles.ava}>
          <Text style={styles.avaText}>{ avaText }</Text>
        </View>
        <Text style={styles.nameText}>{ this.props.name }</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
    height: 64,
    backgroundColor: '#fff',
    flexDirection: 'row',
  },
  ava: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.1)',
    borderRadius: 48,
    height: 48,
    width: 48,
    margin: 8,
  },
  avaText: {
    color: '#fff',
    fontSize: 18,
  },
  nameText: {
    fontSize: 16,
    color: '#000',
  },
})
