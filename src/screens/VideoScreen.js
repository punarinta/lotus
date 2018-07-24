import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, MediaStreamTrack, getUserMedia } from 'react-native-webrtc'
import InCallManager from 'react-native-incall-manager'
import { NavigationActions, StackActions } from 'react-navigation'
import Theme from 'config/theme'
import I18n from 'i18n'

const webRTCConfig = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

export default class VideoScreen extends Component {

  constructor(props) {
    super(props)

    this.state = {
      remoteStreams: {},
      stream: null,
      muted: false,
      isFront: true,
      inDaChat: false,
    }
  }

  componentWillUnmount() {
    this.leaveChat(false)
  }

  async componentDidMount() {

    this.peers = {}

    if (Platform.OS === 'ios' && InCallManager.recordPermission !== 'granted') {
      InCallManager.requestRecordPermission()
        .then((requestedRecordPermissionResult) => {
          console.log('InCallManager.requestRecordPermission() requestedRecordPermissionResult: ', requestedRecordPermissionResult)
        })
        .catch((err) => {
          console.log('InCallManager.requestRecordPermission() catch: ', err)
        })
    }

    InCallManager.start({media: 'audio', ringback: '_DTMF_'})
    InCallManager.setForceSpeakerphoneOn(true)

  /*  this.getLocalStream(stream => {
      this.setState({stream})
    })*/

    const pc = new RTCPeerConnection(webRTCConfig)

    pc.onicecandidate = (event) => {
      console.log('SIGNAL icecandidate')
      if (event.candidate) {
      //  this.socket.emit('exchange', {'to': socketId, 'candidate': event.candidate })
      }
    }

    pc.onnegotiationneeded = () => {
      console.log('SIGNAL negotiationneeded')
      //if (isOffer) {
      //  this.createOffer(socketId).then(() => console.log('Offer created'))
      //}
    }

    const desc = await pc.createOffer()
    await pc.setLocalDescription(desc)

    console.log('SDP', pc.localDescription)
  }

  /**
   * Gets local media stream
   *
   * @param callback
   * @param camera        -- 'front' / 'back'
   */
  getLocalStream = (callback, camera = 'front') => {

    let videoSourceId

    // on android, you don't have to specify sourceId manually, just use facingMode
    if (Platform.OS === 'ios') {
      MediaStreamTrack.getSources(sourceInfos => {
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i]
          if (sourceInfo.kind === 'video' && sourceInfo.facing === camera) {
            videoSourceId = sourceInfo.id
          }
        }
      })
    }
    getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minWidth: 640, // Provide your own width, height and frame rate here
          minHeight: 360,
          minFrameRate: 30,
        },
        facingMode: camera === 'front' ? 'user' : 'environment',
        optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
      }
    }, stream => {
      // console.log('getUserMedia success', stream)
      callback(stream)
    }, e => console.log('ERR getUserMedia', e))
  }

  createPC = (socketId, isOffer) => {
    const pc = new RTCPeerConnection(webRTCConfig)

    pc.onicecandidate = (event) => {
      //  console.log('SIGNAL icecandidate')
      if (event.candidate) {
        this.socket.emit('exchange', {'to': socketId, 'candidate': event.candidate })
      }
    }

    pc.onnegotiationneeded = () => {
      //  console.log('SIGNAL negotiationneeded')
      if (isOffer) {
        this.createOffer(socketId).then(() => console.log('Offer created'))
      }
    }

    pc.onaddstream = event => {
      //  console.log('SIGNAL addstream')
      let remoteStreams = this.state.remoteStreams
      remoteStreams[socketId] = event.stream
      InCallManager.stopRingback()
      this.setState({ remoteStreams, inDaChat: true })
    }

    if (this.state.stream) {
      pc.addStream(this.state.stream)
    } else {
      console.log('Local stream was not attached')
    }

    this.peers = {
      ...this.peers,
      [socketId]: pc
    }

    return pc
  }

  createOffer = async (socketId) => {
    const pc = this.peers[socketId]
    const desc = await pc.createOffer()
    await pc.setLocalDescription(desc)
    //  console.log('socket.emit in createOffer()')
    // this.socket.emit('exchange', { 'to': socketId, 'sdp': pc.localDescription })
  }

  muteToggle = () => {
    if (this.state.stream.getAudioTracks()[0]) {
      const muted = !this.state.muted
      this.state.stream.getAudioTracks()[0].enabled = !muted
      this.setState({muted})
    }
  }

  switchCam = () => {
    if (this.state.stream.getVideoTracks()[0]) {
      this.state.stream.getVideoTracks()[0]._switchCamera()
      this.setState({isFront: !this.state.isFront})
    }
  }

  leaveChat = (goHome = false) => {
    const { stream } = this.state
    if (this.socket) {
      this.socket.emit('leave-room')
      // regression bug with socket.destroy() on Android, RN 0.55
      if (Platform.OS === 'ios') {
        this.socket.destroy()
        this.socket = null
      }
    }
    for (const i in this.peers) {
      this.peers[i].close()
    }
    if (stream) {
      stream.release()
    }
    InCallManager.setForceSpeakerphoneOn(false)
    InCallManager.stop()
    InCallManager.setKeepScreenOn(true)
    if (goHome) {
      this.props.navigation.dispatch(StackActions.reset
      ({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Home'})]
      }))
    } else {
      this.props.navigation.goBack()
    }
  }

  mapHash = (hash, func) => {
    let array = []
    for (const key in hash) {
      const obj = hash[key]
      array.push(func(obj, key))
    }
    return array
  }

  render() {
    return (
      <View style={styles.container}>

      </View>
    )
  }
}

const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: height - Theme.globalMarginTop - Theme.navigatorHeight,
    backgroundColor: '#000',
    zIndex: 0,
  },
})
