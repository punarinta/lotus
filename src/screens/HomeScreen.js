import React, { Component } from 'react'
import { View, Text, Button } from 'react-native'
import { FcmSvc, RTC_EXCHANGE } from 'services/fcm'
import { store } from 'core'

export default class HomeScreen extends Component {

  exchangeListener = (data) => {
    $.navigator.navigate('Video', {callRequest: data})
  }

  componentDidMount() {
    store.bind([RTC_EXCHANGE], this.exchangeListener)
  }

  componentWillUnmount() {
    store.unbind([RTC_EXCHANGE], this.exchangeListener)
  }

  render() {
    return (
      <View>
        <Text>Hello</Text>
        <Button
          title="Video"
          onPress={() => $.navigator.navigate('Video')}
        />

        <Button title="FCM message only" onPress={() => FcmSvc.send('vladimir.g.osipov-at-gmail.com', 'Hello message!', 'Title') } />
        <Button title="FCM data only" onPress={() => FcmSvc.send('vladimir.g.osipov-at-gmail.com', null, null, {aaa:'bbb'}) } />
        <Button title="Full FCM" onPress={() => FcmSvc.send('vladimir.g.osipov-at-gmail.com', 'Hello message!', 'Title', {aaa:'bbb'}) } />
      </View>
    )
  }
}
