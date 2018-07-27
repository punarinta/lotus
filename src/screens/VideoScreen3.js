import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, MediaStreamTrack, getUserMedia } from 'react-native-webrtc'
import InCallManager from 'react-native-incall-manager'
import { NavigationActions, StackActions } from 'react-navigation'
import Theme from 'config/theme'
import I18n from 'i18n'
import { PubSub } from 'services/pubsub'

const webRTCConfig = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]}

const MY_ID = 'vladimir.g.osipov-at-gmail.com'

export default class VideoScreen extends Component {

  socket = null

  constructor(props) {
    super(props)

    this.state = {
      remoteStreams: {},
      stream: null,
      muted: false,
      isFront: true,
      inDaChat: false,
      connState: '?',
    }
  }

  get navParams() {
    return this.props.navigation.state && this.props.navigation.state.params ? this.props.navigation.state.params : {}
  }

  initSocket = () => {
    this.socket = new PubSub(false, '46.101.117.47', '/', 'ch-1337')// + this.navParams.peer)

    this.socket.on('join', (remoteId) => {
      // someone tells yo (or everyone) that he joins
      // create a PC with him, send him an offer
      this.createPC(remoteId, true)
    })

    this.socket.on('exchange', (data) => {
      this.exchange(data)
      // .then(() => console.log('socket.on: EXCHANGE'))
        .catch(err => console.log('ERR', err))
    })

    this.socket.on('leave-room', (id) => {
      if (id !== this.socket.id) {
        this.setState(prevState => {
          const newStreams = prevState.remoteStreams

          if (this.peers[id]) {
            this.peers[id].close()
            delete this.peers[id]
          }

          delete newStreams[id]
          return {
            ...prevState,
            remoteStreams: newStreams,
          }
        })

        console.log(`User ${id} left the room`)
        this.leaveChat(true)
      }
    })
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

  //  this.getLocalStream(stream => {
  //    this.setState({stream})

      if (!this.socket) {
        this.initSocket()
      }

      // tell everyone in da chat that:
      // 1) you join
      // 2) your ID is $.sessionId
      this.socket.emit(null, 'join', $.sessionId)

  // })
  }

  componentWillUnmount() {
    this.leaveChat(false)
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

  createPC = async (forId, isOffer) => {
    const pc = new RTCPeerConnection(webRTCConfig)
    let candidates = []
    let candyWatch = null

    pc.onicecandidate = (event) => {
      console.log('SIGNAL icecandidate')

      if (event.candidate) {

      /*  if (candyWatch) clearTimeout(candyWatch)
        candyWatch = setTimeout(() => {
          console.log('Sending all candidates...')
          this.socket.emit(null, 'exchange', {candidates})
          candidates = []
        }, 1000)

        if (event.candidate.candidate.includes(' udp ')) {
          candidates.push(event.candidate)
        }*/

        this.socket.emit(null, 'exchange', {candidate: event.candidate})
      }
    }

    pc.onnegotiationneeded = () => {
      console.log('SIGNAL negotiationneeded')
      if (isOffer) {
        this.createOffer(forId).then(() => console.log('Offer created'))
      }
    }

    pc.oniceconnectionstatechange = () => {
      this.setState({connState: pc.iceConnectionState})
      console.log('SIGNAL oniceconnectionstatechange', pc.iceConnectionState)
    }

    pc.onaddstream = event => {
      console.log('SIGNAL addstream')
      let remoteStreams = this.state.remoteStreams
      remoteStreams[forId] = event.stream
      this.setState({ remoteStreams, inDaChat: true })
    }

    this.peers[forId] = pc

    if (this.state.stream) {
      pc.addStream(this.state.stream)
    } else {
      console.log('Local stream was not attached')
    }

    console.log('PC created with ' + forId)

    if (isOffer) {
      await this.createOffer(forId)
    }

    return pc
  }

  createOffer = async (forId) => {
    const pc = this.peers[forId]
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    console.log('Sending from createOffer()')
    this.socket.emit(forId, 'exchange', {sdp: pc.localDescription})
  }

  exchange = async (data) => {
    console.log('EVENT exchange', data)
    const fromId = data.rtcFrom
    let pc = {}

    if (this.peers[fromId]) {
      pc = this.peers[fromId]
    } else {
      pc = this.createPC(fromId, false)
    }

    if (data.sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      if (pc.remoteDescription.type === 'offer') {
        if (pc.signalingState !== 'stable') {
          const desc = await pc.createAnswer()
          await pc.setLocalDescription(desc)
          this.socket.emit(fromId, 'exchange', { sdp: pc.localDescription })
        }
      }
    }
    else {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    }

    return

    if (data.sdp) {
      if (data.sdp.type === 'offer' /*&& pc.signalingState !== 'have-local-offer'*/) {
        console.log('setRemoteDescription for offer')
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        this.socket.emit(fromId, 'exchange', {sdp: pc.localDescription})
      } else {
        console.log('ACHTUNG! have-local-offer')
      }
      if (data.sdp.type === 'answer') {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      }
    }
    else {
      /*for (const c of data.candidates) {
        console.log('Adding candidates...')
        await pc.addIceCandidate(new RTCIceCandidate(c))
      }*/
      pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    }
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
      this.socket.close()
    }
    // TODO: notify peers that you're out
    for (const i in this.peers) {
      this.peers[i].close()
    }
    if (stream) {
      stream.release()
    }
  //  InCallManager.setForceSpeakerphoneOn(false)
  //  InCallManager.stop()

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

    const { stream, remoteStreams } = this.state

    return (
      <View style={styles.container}>
        {
          remoteStreams ? this.mapHash(remoteStreams, (remote, index) => {
            return remote ? <RTCView objectFit="cover" key={index} streamURL={remote.toURL()} style={styles.remoteView}/> : null
          }) : null
        }
        {
          !this.state.inDaChat &&
          <View style={styles.overlay}>
            <View style={{backgroundColor: 'rgba(255,255,255,.5)', padding: 16, borderRadius: 16}}>
              <Text style={styles.statusText}>
                { I18n.t('video.connecting') }
              </Text>
              <Text style={styles.statusText}>
                { this.state.connState }
              </Text>
            </View>
          </View>
        }
        <View style={styles.selfViewWrapper}>
          {
            stream ? <RTCView streamURL={stream.toURL()} style={styles.selfView} /> : null
          }
        </View>
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
  selfViewWrapper: {
    position: 'absolute',
    width: width / 5 + 4,
    height: 4 * width / 15 + 4,
    left: 0.8 * width - 4,
    bottom: 0,
    zIndex: 100,
    backgroundColor: '#000',
    borderColor: Theme.activeGreen,
    borderWidth: 2,
  },
  selfView: {
    width: width / 5,
    height: 4 * width / 15,
    zIndex: 101,
  },
  remoteView: {
    width,
    height: height,
    position: 'absolute',
    backgroundColor: '#000',
  },
  statusText: {
    fontSize: Theme.uiFontSize,
    textAlign: 'center',
    margin: 10,
  },
  listViewContainer: {
    height: 150,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
})
