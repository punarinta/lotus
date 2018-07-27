import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity } from 'react-native'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, MediaStreamTrack, getUserMedia } from 'react-native-webrtc'
import InCallManager from 'react-native-incall-manager'
import { NavigationActions, StackActions } from 'react-navigation'
import Theme from 'config/theme'
import I18n from 'i18n'
import { PubSub } from 'services/pubsub'
import EndCallSvg from 'components/svg/EndCall'

const webRTCConfig = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]}

const MY_ID = 'vladimir.g.osipov-at-gmail.com'

export default class ChatScreen extends Component {

  socket = null

  constructor(props) {
    super(props)

    this.state = {
      remoteStreams: {},
      stream: null,
      muted: false,
      isFront: true,
      inDaChat: false,
      connState: '-',
    }
  }

  get navParams() {
    return this.props.navigation.state && this.props.navigation.state.params ? this.props.navigation.state.params : {}
  }

  initSocket = () => {
    this.socket = new PubSub(false, '46.101.117.47', '/', 'ch-1337')// + this.navParams.peer)

    this.socket.on('join', (remoteId) => {
      this.createPC(remoteId, true)
    })

    this.socket.on('exchange', this.exchange)
  }

  async componentDidMount() {

    this.peers = {}
    $.sessionId = Math.random()

    if (Platform.OS === 'ios' && InCallManager.recordPermission !== 'granted') {
      InCallManager.requestRecordPermission()
        .then((requestedRecordPermissionResult) => {
          console.log('InCallManager.requestRecordPermission() requestedRecordPermissionResult: ', requestedRecordPermissionResult)
        })
        .catch((err) => {
          console.log('InCallManager.requestRecordPermission() catch: ', err)
        })
    }

    this.getLocalStream(stream => {
      this.setState({stream})

      if (!this.socket) {
        this.initSocket()
      }

      // tell everyone in da chat that:
      // 1) you join
      // 2) your ID is $.sessionId
      this.socket.emit(null, 'join', $.sessionId)
   })
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

  addStreams = () => {
    if (this.state.stream) {
      for (const i in this.peers) {
        this.peers[i].addStream(this.state.stream)
      }
    } else {
      console.log('Local stream was not attached')
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
          this.socket.emit(null, 'exchange', {candidates})
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
      console.log('SIGNAL oniceconnectionstatechange', pc.iceConnectionState)
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
      let remoteStreams = this.state.remoteStreams
      remoteStreams[peerId] = event.stream
      this.setState({ remoteStreams, inDaChat: true })
    }

    if (this.state.stream) {
      //pc.addStream(this.state.stream)
    } else {
      console.log('Local stream was not attached')
    }

    const channel = pc.createDataChannel('chat', {negotiated: true, id: 0})
    channel.onopen = (event) =>{
      channel.send('Hi you!')
    }
    channel.onmessage = (event) => {
      console.log(event.data)
    }

    this.peers[peerId] = pc

    console.log('PC created with ' + peerId)

    return pc
  }

  createOffer = async (peerId) => {
    const pc = this.peers[peerId]
    const offer = await pc.createOffer()
    pc.setLocalDescription(offer)
    this.socket.emit(peerId, 'exchange', {sdp: offer})
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
        this.socket.emit(peerId, 'exchange', {sdp: answer})
      }
    }

    if (data.candidates) {
      console.log('Adding candidates...')

      if (!this.peers[peerId].watchdog) {
        this.peers[peerId].watchdog = setTimeout(() => {
          console.log('Watchdog fired for state ' + this.state.connState)
          if (['failed','closed','disconnected','?'].includes(this.state.connState) && pc.iWillRetry) {
            this.peers[peerId].close()
            delete this.peers[peerId]
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

  leaveChat = (goHome = false) => {
    const { stream } = this.state
    if (this.socket) {
      this.socket.close()
    }
    for (const i in this.peers) {
      if (this.peers[i].watchdog) {
        clearTimeout(this.peers[i].watchdog)
      }
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
    const svgSize = Theme.isTablet ? 48 : 24
    const { stream, remoteStreams } = this.state

    return (
      <View style={styles.container}>
        {
          remoteStreams ? this.mapHash(remoteStreams, (remote, index) => {
            return remote ? <RTCView objectFit="cover" key={index} streamURL={remote.toURL()} style={styles.remoteView}/> : null
          }) : null
        }
        {
          this.state.inDaChat !== 'erwer' &&
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
        <View style={styles.controlButtons}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={this.leaveChat}
            style={[styles.controlButton, {backgroundColor: 'rgba(255,0,0,.7)'}]}
          >
            <EndCallSvg color="#fff" size={svgSize}/>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={this.addStreams}
            style={[styles.controlButton, {backgroundColor: 'rgba(255,0,0,.7)'}]}
          >
            <EndCallSvg color="#fff" size={svgSize}/>
          </TouchableOpacity>
        </View>
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
  controlButtons: {
    zIndex: 11,
    position: 'absolute',
    left: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.3)',
  },
  controlButton: {
    width: Theme.isTablet ? 96 : 48,
    height: Theme.isTablet ? 96 : 48,
    marginHorizontal: Theme.isTablet ? 16 : 8,
    marginVertical: 8,
    borderRadius: Theme.isTablet ? 48 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
