import React, { Component } from 'react'
import { View, StyleSheet, TextInput, FlatList } from 'react-native'
import Theme from 'config/theme'
import MessageRow from './MessageRow'

// Messenger should take care of asyncstorage data I/O
export default class Messenger extends Component {

  static defaultProps = {
    onNewData: () => null,
  }

  state = {
    messages: [{body: 'Hi!'}],
    toPost: '',
  }

  takeData(chId, peerId, data) {
    const { messages } = this.state
    if (chId === 0) {
      // text message incoming
      messages.push({body: data})
      this.setState({messages})
    }
  }

  render() {
    const { messages, toPost } = this.state

    return (
      <View style={styles.container}>
        <FlatList
          style={styles.msgs}
          data={messages}
          renderItem={(item) => <MessageRow {...item.item}/>}
          keyExtractor={(item, index) => index + ''}
        />

        <TextInput
          ref="postbox"
          onChangeText={(toPost) => {
            this.setState({toPost})
          }}
          onSubmitEditing={() => {
            messages.push({body: toPost})
            this.props.onNewData(0, null, toPost)
            this.setState({messages, toPost: ''})
            if (this.refs.postbox) this.refs.postbox.clear()
          }}
          style={styles.postbox}
        />
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
