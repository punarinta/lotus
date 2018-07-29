import React, { Component } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc'
import { NavigationActions, StackActions } from 'react-navigation'
import Theme from 'config/theme'
import { PubSub } from 'services/pubsub'
import Messenger from 'components/Messenger'
import AVModal from 'modals/AVModal'
import { ProfileSvc } from 'services/profile'
import I18n from 'i18n'

const webRTCConfig = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]}

export default class RoomScreen extends Component {

  pubsub = null

  constructor(props) {
    super(props)

    this.state = {
      isAVOn: false,
      connState: '-',
      remoteStreams: {},
    }
  }

  get navParams() {
    return this.props.navigation.state && this.props.navigation.state.params ? this.props.navigation.state.params : {}
  }

  initPubSub = async () => {
    if (!this.navParams.peer) {
      return false
    }

    // TODO: support more than one peer -> change chat ID
    this.pubsub = new PubSub(false, '46.101.117.47', '/lotus', 'ch-' + this.navParams.peer.replace('@', '-at-'))

    if (! await this.pubsub.init()) {
      console.log('PubSub server connection failure')
      return false
    }

    this.pubsub.on('join', (remoteId) => {
      this.createPC(remoteId, true)
    })

    this.pubsub.on('exchange', this.exchange)
    return true
  }

  async componentDidMount() {

    this.peers = {}
    if (!this.pubsub) {
      if (! await this.initPubSub()) {
        return false
      }
    }

    // tell everyone in the chat that you join with ID $.sessionId
    this.pubsub.emit(null, 'join', $.sessionId)
  }

  componentWillUnmount() {
    this.leaveChat()
  }

  onStreamChange = (state, stream = null, callback = () => null) => {
    if (state === 'off') {
      for (const i in this.peers) this.peers[i].removeStream(stream)
      callback()
    }
    if (stream) {
      for (const i in this.peers) this.peers[i].addStream(stream)
      callback()
    }
  }

  createPC = (peerId, isOffer) => {
    const pc = new RTCPeerConnection(webRTCConfig)

    let candidates = []
    let candyWatch = null
    this.setState({connState: '?'})
    pc.iWillRetry = isOffer

    pc.onicecandidate = (event) => {
      console.log('SIGNAL icecandidate')

      if (event.candidate) {

        if (candyWatch) clearTimeout(candyWatch)
        candyWatch = setTimeout(() => {
          console.log('Sending all candidates...')
          this.pubsub.emit(null, 'exchange', {candidates})
          candidates = []
        }, 750)

        if (event.candidate.candidate.includes(' udp ')) {
          candidates.push(event.candidate)
        }
      }
    }

    pc.onnegotiationneeded = () => {
      console.log('SIGNAL negotiationneeded')
      if (isOffer) {
        this.createOffer(peerId).then(() => console.log('Offer created'))
      }
    }

    pc.oniceconnectionstatechange = () => {
      this.setState({connState: pc.iceConnectionState})
      console.log('SIGNAL oniceconnectionstatechange', pc.iceConnectionState , peerId)
      if (['failed','closed','disconnected'].includes(pc.iceConnectionState)) {
      }
      if (pc.iceConnectionState === 'connected') {
        if (this.peers[peerId].watchdog) {
          clearTimeout(this.peers[peerId].watchdog)
        }
      }
    }

    pc.onaddstream = event => {
      console.log('SIGNAL addstream')
      const { remoteStreams, isAVOn } = this.state
      if (!isAVOn) {
        // TODO: inform me about an incoming and if I accept, open AV modal and add a stream
      } else {
        remoteStreams[peerId] = event.stream
        this.setState({ remoteStreams })
      }
    }

    pc.onremovestream = event => {
      const { remoteStreams } = this.state
      for (const i in remoteStreams) {
        if (remoteStreams[i] === event.stream) {
          // delete remoteStreams[i]
          remoteStreams.splice(i, 1)
          this.setState({ remoteStreams })
          break
        }
      }
    }

    ['text', 'aux'].forEach((chName, i) => {
      const ch = pc.createDataChannel(chName, { negotiated: true, id: i })
      ch.onmessage = (event) => this.onDataRead(i, peerId, event.data)
      if (!pc.dataChannels) pc.dataChannels = []
      pc.dataChannels[i] = ch
    })

    this.peers[peerId] = pc

    console.log('PC created with ' + peerId)

    return pc
  }

  dataSend = (chId, peerId, data) => {

    for (const i in this.peers) {
      if (peerId === null || i === peerId) {
        console.log('DATA SENT', chId, peerId, data)
        this.peers[i].dataChannels[chId].send(data)
        break
      }
    }
  }

  onDataRead = (chId, peerId, data) => {

    console.log('DATA READ', chId, peerId, data)

    // hardcode data channel subscribers
    if (this.refs.msg) this.refs.msg.takeData(chId, peerId, data)
    // if (this.refs.skt) this.refs.skt.takeData(chId, peerId, data)
    if (chId === 1) {
      const json = JSON.parse(data)
      switch (json.cmd) {
        case 'whoAreYou':
          this.dataSend(1, peerId, JSON.stringify({cmd: 'iAm', info: {name: 'Session ' + $.sessionId}}))
          break

        case 'iAm':
          ProfileSvc.update(json.info.id, json.info)
          break

        default:
          console.log('Unknown command in AUX channel: ' + json.cmd)
      }
    }
  }

  createOffer = async (peerId) => {
    const pc = this.peers[peerId]
    const offer = await pc.createOffer()
    pc.setLocalDescription(offer)
    this.pubsub.emit(peerId, 'exchange', {sdp: offer})
  }

  exchange = async (data) => {
    console.log('EVENT exchange', data)
    const peerId = data.rtcFrom
    const pc = this.peers[peerId] ? this.peers[peerId] : this.createPC(peerId, false)

    if (data.sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      if (data.sdp.type === 'offer') {
        const answer = await pc.createAnswer()
        pc.setLocalDescription(answer)
        this.pubsub.emit(peerId, 'exchange', {sdp: answer})
      }
    }

    if (data.candidates) {
      console.log('Adding candidates...')

      if (!this.peers[peerId].watchdog) {
        this.peers[peerId].watchdog = setTimeout(() => {
          console.log('Watchdog fired for state ' + this.state.connState)
          if (['failed', 'closed', 'disconnected', '?'].includes(this.state.connState) && pc.iWillRetry) {
            this.peers[peerId].dataChannels.forEach(ch => ch.close())
            this.peers[peerId].close()
          //  delete this.peers[peerId]
            this.peers.splice(peerId, 1)
            console.log('Retrying for peer ' + peerId)
            this.createPC(peerId, true)
          }
        }, 5000)
      }

      for (const c of data.candidates) {
        pc.addIceCandidate(new RTCIceCandidate(c))
      }
    }
  }

  leaveChat = () => {
    if (this.state.isAVOn && this.refs.av) {
      this.refs.av.close()
    }
    if (this.pubsub) {
      this.pubsub.close()
    }
    for (const i in this.peers) {
      if (this.peers[i].watchdog) {
        clearTimeout(this.peers[i].watchdog)
      }
      this.peers[i].close()
    }

    this.props.navigation.dispatch(StackActions.reset
    ({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Home'})]
    }))
  }

  render() {
    const { remoteStreams, isAVOn } = this.state

    return (<View style={styles.container}>
      <TouchableOpacity
        style={{height: 64, backgroundColor: 'yellow'}}
        onPress={() => this.props.navigation.goBack()}
      >
        <Text>{ this.state.connState }</Text>
      </TouchableOpacity>
      <Messenger
        ref="msg"
        onNewData={this.dataSend}
      />
      {
        isAVOn && <AVModal
          ref="av"
          remoteStreams={remoteStreams}
          onStreamChange={this.onStreamChange}
        />
      }
    </View>)
  }
}

const { height } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusText: {
    fontSize: Theme.uiFontSize,
    textAlign: 'center',
    margin: 10,
  },
})
