import React, { Component } from 'react'
import { View, Text, Button } from 'react-native'
import { FcmSvc } from 'services/fcm'

export default class HomeScreen extends Component {
  render() {
    return (
      <View>
        <Text>Hello</Text>
        <Button
          title="Video"
          onPress={() => $.navigator.navigate('Video')}
        />

        <Button
          title="FCM test"
          onPress={() => {
            FcmSvc.send('vladimir.g.osipov-at-gmail.com', 'Hello self!')
          }}
        />
      </View>
    )
  }
}
