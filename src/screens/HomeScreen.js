import React, { Component } from 'react'
import { View, Text, Button } from 'react-native'

export default class HomeScreen extends Component {

  render() {
    return (
      <View>
        <Text>Hello</Text>
        <Button
          title="Chat 1"
          onPress={() => $.navigator.navigate('Chat', {peer: 1})}
        />
        <Button
          title="Chat 2"
          onPress={() => $.navigator.navigate('Chat', {peer: 2})}
        />
      </View>
    )
  }
}
