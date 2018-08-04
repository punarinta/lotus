import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native'
import ChatsList from 'components/ChatsList'
import Theme from 'config/theme'
import PersonAddSvg from 'components/svg/PersonAdd'
import GroupAddSvg from 'components/svg/GroupAdd'
import AddSvg from 'components/svg/Add'
import { ProfileSvc } from 'services/profile'
import { SysSvc } from 'services/sys'
import store from 'core/store'
import AddRoomModal from 'modals/AddRoom'

export default class HomeScreen extends Component {

  state = {
    addShown: false,
    updateRooms: null,
  }

  constructor(props) {
    super(props)
    store.bind(['ROOMS_UPDATED'], this.updateRooms)

    this.animAddValue = new Animated.Value(0)
    this.animAddAngle = this.animAddValue.interpolate({inputRange: [0, 1], outputRange: ['0deg', '45deg']})
    this.animAddPosition = this.animAddValue.interpolate({inputRange: [0, 1], outputRange: [0, -112]})
    this.animAdd2Position = this.animAddValue.interpolate({inputRange: [0, 1], outputRange: [0, -56]})
  }

  componentWillUnmount() {
    store.unbind(['ROOMS_UPDATED'], this.updateRooms)
  }

  addToggle = () => {
    const addShown = !this.state.addShown
    Animated.timing(this.animAddValue, {toValue: addShown * 1, duration: 350, useNativeDriver: true}).start()
    this.setState({addShown})
  }

  addRoom = (id) => {
    console.log('Room ID', id)
    if (!$.phonebook[id]) {
      $.phonebook[id] = { name: 'New one' }
      // store.sync()
      this.updateRooms()
    }
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

        <Animated.View style={[styles.action, {zIndex: 0, transform: [{translateX: this.animAddPosition}], opacity: this.animAddValue }]}>
          <TouchableOpacity
            style={styles.addChat}
            activeOpacity={0.8}
            onPress={() => this.refs.addRoom.open()}
          >
            <PersonAddSvg color={Theme.black}/>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.action, {zIndex: 0, transform: [{translateX: this.animAdd2Position}], opacity: this.animAddValue }]}>
          <TouchableOpacity
            style={styles.addChat}
            activeOpacity={0.8}
            onPress={() => null}
          >
            <GroupAddSvg color={Theme.black}/>
          </TouchableOpacity>
        </Animated.View>

        <View style={[styles.action, {zIndex: 1}]}>
          <TouchableOpacity
            style={styles.addChat}
            activeOpacity={0.8}
            onPress={this.addToggle}
          >
            <Animated.View style={{transform: [{rotate: this.animAddAngle}] }}>
              <AddSvg color={Theme.black}/>
            </Animated.View>
          </TouchableOpacity>
        </View>


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
  action: {
    position: 'absolute',
    right: 18,
    bottom: 18,
  },
  addChat: {
    backgroundColor: Theme.white,
    width: 48,
    height: 48,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 5, // android
  },
})
