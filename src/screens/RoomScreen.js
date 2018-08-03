import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc'
import Theme from 'config/theme'
import { PubSub } from 'services/pubsub'
import Messenger from 'components/Messenger'
import AVModal from 'modals/AVModal'
import { ProfileSvc } from 'services/profile'
import { MessageSvc } from 'services/message'
import I18n from 'i18n'
import { sha256 } from 'js-sha256'
import HomeSvg from 'components/svg/Home'

const webRTCConfig = {iceCandidatePoolSize: 16, 'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

export default class RoomScreen extends Component {

  pubsub = null

  constructor(props) {
    super(props)

    this.state = {
      isAVOn: false,
      remoteStreams: {},
      connStates: {},
    }
  }

  get navParams() {
    return this.props.navigation.state && this.props.navigation.state.params ? this.props.navigation.state.params : {}
  }

  get roomId() {
    const
      hash1 = sha256($.accounts[0].id).substring(0, 32),
      hash2 = sha256(this.navParams.peer).substring(0, 32),
      bool = $.accounts[0].id > this.navParams.peer

    return bool ? hash1 + hash2 : hash2 + hash1
  }

  async initPubSub() {
    if (!this.navParams.peer || !$.accounts[0] || !$.accounts[0].id) {
      return false
    }

    this.pubsub = new PubSub(false, '46.101.117.47/', this.roomId, { onSuggestedReopening: (code) => {
      console.log('WARNING: onSuggestedReopening was triggered with error code ' + code)
      this.initPubSub()
    }})

    if (!await this.pubsub.init()) {
      console.log('PubSub server connection failure')
      return false
    }

    this.pubsub.on('join', ([peerId, userId]) => {
      this.createPC(peerId, true, userId)
    })

    this.pubsub.on('exchange', this.exchange)
    return true
  }

  async componentDidMount() {

    this.peers = {}
    if (!this.pubsub) {
      if (!await this.initPubSub()) {
        return false
      }
    }

    // tell everyone in the chat that you join with ID $.sessionId
    this.pubsub.emit(null, 'join', [$.sessionId, $.accounts[0].id])
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

  setPeerState(peerId, newState) {
    const { connStates } = this.state
    connStates[peerId] = newState
    this.setState({connStates})
  }

  createPC(peerId, isOffer, userId = null) {
    const pc = new RTCPeerConnection(webRTCConfig)

    ProfileSvc.update(userId, {peerId, lastSeen: (new Date).getTime()})

    let candidates = []
    let candyWatch = null
    this.setPeerState(peerId, 'connecting')
    pc.iWillRetry = isOffer
    pc.dataChannels = []

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // TODO: control TCP skipping in options
      //  if (event.candidate.candidate.includes(' udp ')) {
          candidates.push(event.candidate)

          if (candyWatch) clearTimeout(candyWatch)
          candyWatch = setTimeout(() => {
            console.log(`Sending ${candidates.length} candidates...`)
            this.pubsub.emit(null, 'exchange', {candidates})
            candidates = []
          }, 500)
      //  }
      }
    }

    pc.onnegotiationneeded = () => {
      console.log('SIGNAL negotiationneeded')
      if (isOffer) this.createOffer(peerId)
    }

    pc.oniceconnectionstatechange = () => {

      if (pc.iceConnectionState === this.state.connStates[peerId]) {
        return
      }

      console.log('SIGNAL oniceconnectionstatechange', pc.iceConnectionState, peerId)
      if (['failed', 'closed', 'disconnected'].includes(pc.iceConnectionState)) {
        pc.dataChannels.forEach(ch => ch.close())
      }
      if (pc.iceConnectionState === 'connected') {
        if (this.peers[peerId].watchdog) {
          clearTimeout(this.peers[peerId].watchdog)
        }
        const peerUser = ProfileSvc.findByPeerId(peerId)
        this.dataSend(1, peerId, JSON.stringify({cmd: 'syncReq', lastSeen: peerUser ? peerUser.lastSeen : null}))
      }
      if (pc.iceConnectionState === 'checking') {
        if (pc.iWillRetry) {
          if (pc.watchdog) {
            clearTimeout(pc.watchdog)
          }
          pc.watchdog = setTimeout(pc.watchdogFunction, 10000, true)
        }
      }

      if (pc.iceConnectionState === 'disconnected') {
        const peerUser = ProfileSvc.findByPeerId(peerId)
        if (peerUser) {
          ProfileSvc.update(peerUser.id, {lastSeen: (new Date).getTime()})
        }
        this.setPeerState(peerId, 'offline')
      } else {
        this.setPeerState(peerId, pc.iceConnectionState === 'completed' ? 'connected' : pc.iceConnectionState)
      }
    }

    pc.onaddstream = event => {
      console.log('SIGNAL addstream')
      const {remoteStreams, isAVOn} = this.state
      if (!isAVOn) {
        // TODO: inform me about an incoming and if I accept, open AV modal and add a stream
      } else {
        remoteStreams[peerId] = event.stream
        this.setState({remoteStreams})
      }
    }

    pc.onremovestream = event => {
      const {remoteStreams} = this.state
      for (const i in remoteStreams) {
        if (remoteStreams[i] === event.stream) {
          delete remoteStreams[i]
          this.setState({remoteStreams})
          break
        }
      }
    }

    pc.watchdogFunction = (dontCompare = false) => {
      console.log('Watchdog fired for state ' + this.state.connStates[peerId])
      if ((['failed', 'closed', 'connecting'].includes(this.state.connStates[peerId]) || dontCompare)) {
        pc.close()
        delete this.peers[peerId]
        this.setPeerState(peerId, null)
        console.log('Retrying for peer ' + peerId)
        this.createPC(peerId, true)
      }
    }

    ['text', 'aux'].forEach((chName, id) => {
      const ch = pc.createDataChannel(chName, {negotiated: true, id})
      ch.onmessage = (event) => this.onDataRead(id, peerId, event.data)
      pc.dataChannels[id] = ch
    })

    this.peers[peerId] = pc

    console.log(`Peer ${peerId} created`)

    return pc
  }

  dataSend = (chId, peerId, data) => {

    for (const i in this.peers) {
      if (peerId === null || i === peerId) {
        console.log('DATA SENT', chId, peerId, data)
        this.peers[i].dataChannels[chId].send(data)
      }
    }
  }

  onDataRead(chId, peerId, data) {

    console.log('DATA READ', chId, peerId, data)

    // hardcode data channel subscribers
    if (this.refs.msg) this.refs.msg.takeData(chId, peerId, data)

    if (chId === 1) {
      const json = JSON.parse(data)
      switch (json.cmd) {
        case 'syncReq':
          // send a short profile only -- {id, name}
          // TODO: if json.lastSeen < $.accounts[0].lastUpd => send full profile
        //  this.dataSend(1, peerId, JSON.stringify({cmd: 'syncResp', info: $.accounts[0]}))
          const msgsToSync = MessageSvc.getFromTs(this.roomId, null, json.lastSeen)
          console.log('msgsToSync', json.lastSeen, msgsToSync)
          for (const m of msgsToSync) {
            this.dataSend(0, peerId, m.body)
          }
          break

        case 'syncResp':
          // this is a short profile -- {id, name}
          json.info.lastSeen = (new Date).getTime()
          ProfileSvc.update(json.info.id, json.info)
          break

        default:
      }
    }
  }

  async createOffer(peerId) {
    const pc = this.peers[peerId]
    try {
      await pc.setLocalDescription(await pc.createOffer())
      this.pubsub.emit(peerId, 'exchange', {sdp: pc.localDescription, userId: $.accounts[0].id})
    } catch (err) {
      console.log('ACHTUNG 1', err)
    }
  }

  exchange = async (data) => {
    // https://www.w3.org/TR/webrtc/#simple-peer-to-peer-example
    // console.log('EVENT exchange', data)
    const peerId = data.rtcFrom
    const pc = this.peers[peerId] ? this.peers[peerId] : this.createPC(peerId, false, data.userId)

    try {
      if (data.sdp) {

        if (data.sdp.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          await pc.setLocalDescription(await pc.createAnswer())
          this.pubsub.emit(peerId, 'exchange', {sdp: pc.localDescription})
        } else if (data.sdp.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        } else {
          console.log('Unsupported SDP type. Your code may differ here.')
        }
      }

      if (data.candidates) {
        console.log('Adding candidates...')

      //  if (!this.peers[peerId].watchdog && pc.iWillRetry) {
      //    this.peers[peerId].watchdog = setTimeout(this.peers[peerId].watchdogFunction, 7500)
      //  }

        for (const c of data.candidates) {
          await pc.addIceCandidate(new RTCIceCandidate(c))
        }
      }
    } catch (err) {
      console.log('ACHTUNG 2', err)

      if (!this.peers[peerId].watchdog && pc.iWillRetry) {
        this.peers[peerId].watchdog = setTimeout(this.peers[peerId].watchdogFunction, 500)
      }
    }
  }

  leaveChat = () => {
    if (this.pubsub) this.pubsub.close()
    if (this.state.isAVOn && this.refs.av) this.refs.av.close()
    for (const i in this.peers) {
      if (this.peers[i].watchdog) clearTimeout(this.peers[i].watchdog)
      this.peers[i].close()
    }
  }

  render() {
    const { remoteStreams, isAVOn, connStates } = this.state
    const peerUser = ProfileSvc.get(this.navParams.peer)

    return (
      <View style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => this.props.navigation.goBack()}
          >
            <HomeSvg/>
          </TouchableOpacity>
          <View>
            <Text style={styles.nameText}>
              { peerUser ? peerUser.name : this.navParams.peer }
            </Text>
            <Text style={styles.statusText}>
              { connStates[peerUser.peerId] || 'unknown' }
            </Text>
          </View>

        </View>
        <Messenger
          ref="msg"
          roomId={this.roomId}
          onNewData={this.dataSend}
        />
        {
          isAVOn && <AVModal
            ref="av"
            remoteStreams={remoteStreams}
            onStreamChange={this.onStreamChange}
          />
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nameText: {
    fontSize: 12,
    color: Theme.black,
    fontFamily: Theme.thinFont,
  },
  statusText: {
    fontSize: 10,
    color: Theme.gray,
    fontFamily: Theme.thinFont,
  },
  navBar: {
    height: 48,
    flexDirection: 'row',
    backgroundColor: Theme.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.gray,
    alignItems: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
