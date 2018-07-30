import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import ChatsList from 'components/ChatsList'
import Theme from 'config/theme'
import GroupAddSvg from 'components/svg/GroupAdd'
import { ProfileSvc } from 'services/profile'

export default class HomeScreen extends Component {

  addChat = () => {

  }

  render() {
    return (
      <View style={styles.container}>
        <ChatsList items={ProfileSvc.all({sortBy: 'lastSeen'})} />
        <TouchableOpacity
          style={styles.addChat}
          activeOpacity={0.8}
          onPress={this.addChat}
        >
          <GroupAddSvg color={Theme.black}/>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.gray,
  },
  addChat: {
    backgroundColor: Theme.white,
    width: 48,
    height: 48,
    borderRadius: 48,
    position: 'absolute',
    right: 18,
    bottom: 18,
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 5, // android
  },
})
