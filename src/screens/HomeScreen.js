import React, { Component } from 'react'
import {View, StyleSheet, TouchableOpacity, Platform} from 'react-native'
import ChatsList from 'components/ChatsList'
import Theme from 'config/theme'
import GroupAddSvg from 'components/svg/GroupAdd'

const sampleChats = [
  {
    id: Platform.OS === 'ios' ? 'android@lotus.test' : 'ios@lotus.test',
    name: Platform.OS === 'ios' ? 'Android phone' : 'iOS phone'
  },
  {
    id: 'john.doe@mail.test',
    name: 'John Doe',
  },
  {
    id: 'ronald.pierce@user.test',
    name: 'Ronald Pierce',
  },
  {
    id: 'mike.hudson@user.test',
    name: 'Mike Hudson',
  },
]

export default class HomeScreen extends Component {

  addChat = () => {

  }

  render() {
    return (
      <View style={styles.container}>
        <ChatsList items={sampleChats} />
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
