import React, { Component } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import ChatsList from 'components/ChatsList'

const sampleChats = [
  {
    id: 'john.doe@mail.test',
    name: 'John Doe',
  },
  {
    id: 'guy511@britain.test',
    name: 'Guido Fawkes',
  },
]

export default class HomeScreen extends Component {

  render() {
    return (
      <View style={styles.container}>
        <ChatsList items={sampleChats} />

        {
          /*
            <Text>Hello</Text>
            <Button
              title="Chat 1"
              onPress={() => $.navigator.navigate('Chat', {peer: 1})}
            />
            <Button
              title="Chat 2"
              onPress={() => $.navigator.navigate('Chat', {peer: 2})}
            />
           */
        }

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
