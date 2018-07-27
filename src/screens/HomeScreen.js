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
          title="Video 1"
          onPress={() => $.navigator.navigate('Video', {peer: 1})}
        />
        <Button
          title="Video 2"
          onPress={() => $.navigator.navigate('Video', {peer: 2})}
        />
      </View>
    )
  }
}
