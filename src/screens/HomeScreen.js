import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import ChatsList from 'components/ChatsList'
import Theme from 'config/theme'
import GroupAddSvg from 'components/svg/GroupAdd'
import { ProfileSvc } from 'services/profile'
import { SysSvc } from 'services/sys'
import store from 'core/store'
import AddRoomModal from 'modals/AddRoom'

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

  addRoom = (id) => {
    console.log('Room ID', id)
  }

  updateRooms = () => {
    this.setState({updateRooms: Math.random()})
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
          onPress={() => this.refs.addRoom.open()}
        >
          <GroupAddSvg color={Theme.black}/>
        </TouchableOpacity>
        <AddRoomModal
          ref="addRoom"
          onSelect={this.addRoom}
        />
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
