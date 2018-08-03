import React, { Component } from 'react'
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import Theme from 'config/theme'
import MessageRow from './MessageRow'
import SendSvg from './svg/Send'
import { ProfileSvc } from 'services/profile'
import { MessageSvc } from 'services/message'

// Messenger should take care of asyncstorage data I/O
export default class Messenger extends Component {

  static defaultProps = {
    onNewData: () => null,
  }

  state = {
    toPost: '',
    messages: [],
    msgsRenderState: null,
  }

  componentDidMount() {
    MessageSvc.initRoom(this.props.roomId)
  }

  addMessage(message) {
    const { messages } = this.state
    messages.push(message)
    this.setState({messages, msgsRenderState: Math.random()})
    $.rooms[this.props.roomId].m = messages
  }

  takeData(chId, peerId, data) {
    if (chId === 0) {
      console.log('Push message', data, peerId)
      if (typeof data === 'string') data = JSON.parse(data)
      // text message incoming => get userId from peerId
      let user = ProfileSvc.findByPeerId(peerId)
      if (!user) {
        user = ProfileSvc.johnDoe()
      }
      this.addMessage({...data, userId: user.id})
      setTimeout(() => {
        this.refs.msgs.scrollToEnd()
      }, 50)
    }
  }

  post = () => {
    const { toPost } = this.state

    if (toPost.length) {
      const message = {body: toPost, ts: (new Date).getTime()}
      this.addMessage({...message, userId: null})
      this.props.onNewData(0, null, message)
      this.setState({clearPostbox: true, toPost: ''})
      this.refs.msgs.scrollToEnd()
    }
  }

  render() {
    const { messages, msgsRenderState, toPost } = this.state

    return (
      <KeyboardAvoidingView
        style={styles.container}
        {...Platform.select({'ios': {behavior:'padding', keyboardVerticalOffset: 20}})}
      >
        <FlatList
          ref="msgs"
          style={styles.msgs}
          data={messages}
          renderItem={(item) => <MessageRow {...item.item}/>}
          extraData={msgsRenderState}
          keyExtractor={(item, index) => index + ''}
          bounces={false}
        />

        <View style={styles.bottomBar}>
          <TextInput
            onSubmitEditing={this.post}
            blurOnSubmit={false}
            onChangeText={ toPost => this.setState({toPost})}
            style={styles.postbox}
            value={toPost}
            selectionColor={Theme.black}
          />
          <View style={styles.postButtons}>
            <TouchableOpacity onPress={this.post} activeOpacity={toPost.length ? 0.5 : 1}>
              <SendSvg color={toPost.length ? Theme.black : Theme.gray}/>
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
    paddingLeft: Platform.OS === 'ios' ? 8 : 4,
  },
  postButtons: {
    backgroundColor: Theme.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
})
