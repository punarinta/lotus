import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import ChatsList from 'components/ChatsList'
import Theme from 'config/theme'
import GroupAddSvg from 'components/svg/GroupAdd'
import { ProfileSvc } from 'services/profile'
import { SysSvc } from 'services/sys'
import store from 'core/store'

export default class HomeScreen extends Component {

  state = {
    updateRooms: null,
  }

  constructor(props) {
    super(props)
    store.bind(['ROOMS_UPDATED'], this.updateRooms)
  }

  componentWillUnmount() {
    store.unbind(['ROOMS_UPDATED'], this.updateRooms)
  }

  addChat = () => {

  }

  updateRooms = () => {
    this.setState({updateRooms: Math.random()})
  }

  async componentDidMount() {
    console.log('Ping', await SysSvc.pingStun('stun.l.google.com:19302'))
  }

  render() {
    return (
      <View style={styles.container}>
        <ChatsList
          items={ProfileSvc.all({sortBy: 'lastSeen'})}
          updateRooms={this.state.updateRooms}
        />
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
