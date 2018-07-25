import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, MediaStreamTrack, getUserMedia } from 'react-native-webrtc'
import InCallManager from 'react-native-incall-manager'
import { NavigationActions, StackActions } from 'react-navigation'
import Theme from 'config/theme'
import I18n from 'i18n'
import { FcmSvc, RTC_EXCHANGE } from 'services/fcm'
import { store } from 'core'

const webRTCConfig = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

const pc = new RTCPeerConnection(webRTCConfig)
let sendChannel = null

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

  get navParams() {
    return this.props.navigation.state && this.props.navigation.state.params ? this.props.navigation.state.params : {}
  }

  async componentDidMount() {

    if (Platform.OS === 'ios' && InCallManager.recordPermission !== 'granted') {
      InCallManager.requestRecordPermission()
        .then((requestedRecordPermissionResult) => console.log('InCallManager.requestRecordPermission() requestedRecordPermissionResult: ', requestedRecordPermissionResult))
        .catch((err) =>  console.log('InCallManager.requestRecordPermission() catch: ', err))
    }

    /*this.getLocalStream(stream => {
      this.setState({stream})
    })*/

    pc.onicecandidate = async (event) => {
      console.log('SIGNAL icecandidate')
      if (event.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(event.candidate))
      }
    }

    pc.onnegotiationneeded = () => {
      console.log('SIGNAL negotiationneeded')
    }

    pc.onaddstream = (event) => {
      console.log('SIGNAL addstream')
    }

    pc.ondatachannel = (event) => {
      console.log('SIGNAL datachannel')
      let receiveChannel = event.channel
      receiveChannel.onmessage = (event) => {
        console.log('>> ' + event.data)
      }
    }

    sendChannel = pc.createDataChannel('sendDataChannel')

    if (this.navParams.sdp) {
      console.log('Foreign sdp received')

      await pc.setRemoteDescription(new RTCSessionDescription(this.navParams.sdp))
      if (pc.remoteDescription.type === 'offer') {
        if (pc.signalingState !== 'stable') {
          const desc = await pc.createAnswer()
          await pc.setLocalDescription(desc)

          // exchange SDP with a peer
          FcmSvc.sendRtc('vladimir.g.osipov-at-gmail.com', {cmd: 'acceptCall', sdp: pc.localDescription})

        /*  if (this.state.stream) {
            pc.addStream(this.state.stream)
          } else {
            console.log('Local stream was not attached')
          }*/
          sendChannel.send('Hi!')
        }
      }
    } else {
      const desc = await pc.createOffer()
      await pc.setLocalDescription(desc)

      console.log('SDP', pc.localDescription)

      // send my SDP to the peer
      FcmSvc.sendRtc('vladimir.g.osipov-at-gmail.com', {cmd: 'call', sdp: pc.localDescription})
    }

    store.bind([RTC_EXCHANGE], this.exchangeListener)
  }

  componentWillUnmount() {
    store.unbind([RTC_EXCHANGE], this.exchangeListener)
    this.leaveChat(false)
  }

  exchangeListener = async (data) => {
    console.log('Accepting remote SDP')
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))

    /*if (this.state.stream) {
      pc.addStream(this.state.stream)
    } else {
      console.log('Local stream was not attached')
    }*/
    sendChannel.send('Hi!')
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

    if (this.state.stream) {
      this.state.stream.release()
    }

    pc.close()

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
