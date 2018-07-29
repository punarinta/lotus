import React, { Component } from 'react'
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, Text } from 'react-native'
import Theme from 'config/theme'
import MessageRow from './MessageRow'

// Messenger should take care of asyncstorage data I/O
export default class Messenger extends Component {

  static defaultProps = {
    onNewData: () => null,
  }

  state = {
    messages: [{body: 'M1'},{body: 'M2'},],
    toPost: '',
    msgsRenderState: null,
  }

  addMessage = (message) => {
    const { messages } = this.state
    messages.push({body: message})
    this.setState({messages, msgsRenderState: Math.random()})
  }

  takeData(chId, peerId, data) {
    if (chId === 0) {
      console.log('Push message', data)
      // text message incoming
      this.addMessage(data)
    }
  }

  render() {
    const { messages, toPost, msgsRenderState } = this.state

    return (
      <View style={styles.container}>
        <FlatList
          style={styles.msgs}
          data={messages}
          renderItem={(item) => <MessageRow {...item.item}/>}
          extraData={msgsRenderState}
        />

        <TextInput
          ref="postbox"
          onChangeText={(toPost) => {
            this.setState({toPost})
          }}
          value={toPost}
          style={styles.postbox}
        />
        <TouchableOpacity
          onPress={() => {
            this.addMessage(toPost)
            this.props.onNewData(0, null, toPost)
            this.setState({toPost: ''})
            if (this.refs.postbox) this.refs.postbox.clear()
          }}
        >
          <Text>SEND</Text>
          <Text>SEND</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.white,
  },
  msgs: {
    flex: 1,
  },
  postbox: {
    backgroundColor: '#fff',
    height: 48,
  },
})
