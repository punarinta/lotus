import React, { Component } from 'react'
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import Theme from 'config/theme'
import MessageRow from './MessageRow'
import SendSvg from './svg/Send'

// Messenger should take care of asyncstorage data I/O
export default class Messenger extends Component {

  toPost = ''

  static defaultProps = {
    onNewData: () => null,
  }

  state = {
    messages: [{body: 'My message', userId:null},{body: 'His message', userId:'usr'}],
    msgsRenderState: null,
    clearPostbox: false,
  }

  addMessage = (message, userId = null) => {
    const { messages } = this.state
    messages.push({
      body: message,
      userId,
    })
    this.setState({messages, msgsRenderState: Math.random()})
  }

  takeData(chId, peerId, data) {
    if (chId === 0) {
      console.log('Push message', data)
      // text message incoming
      this.addMessage(data, peerId)
    }
  }

  post = () => {
    const msg = this.toPost

    if (msg.length) {
      this.addMessage(msg)
      this.props.onNewData(0, null, msg)
      this.toPost = ''
      this.setState({clearPostbox: true})
      this.refs.msgs.scrollToEnd()
    }
  }

  render() {
    const { messages, clearPostbox, msgsRenderState } = this.state

    let more = {}
    if (clearPostbox) {
      this.setState({clearPostbox: false})
      more.value = ''
    }

    console.log('render', more.value)

    return (
      <KeyboardAvoidingView
        style={styles.container}
        {...Platform.select({'ios': {behavior:'padding', keyboardVerticalOffset:20}})}
      >
        <FlatList
          ref="msgs"
          style={styles.msgs}
          data={messages}
          renderItem={(item) => <MessageRow {...item.item}/>}
          extraData={msgsRenderState}
          keyExtractor={(item, index) => index + ''}
        />

        <View style={styles.bottomBar}>
          <TextInput
            onSubmitEditing={this.post}
            blurOnSubmit={false}
            onChangeText={ post => this.toPost = post}
            style={styles.postbox}
            selectionColor={Theme.black}
            {...more}
          />
          <View style={styles.postButtons}>
            <TouchableOpacity onPress={this.post}>
              <SendSvg color={Theme.black}/>
            </TouchableOpacity>
          </View>
        </View>
       </KeyboardAvoidingView>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.gray,
  },
  bottomBar: {
    flexDirection: 'row',
  },
  postbox: {
    backgroundColor: Theme.white,
    height: 48,
    flex: 1,
  },
  postButtons: {
    backgroundColor: Theme.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
})
