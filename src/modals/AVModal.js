import React, { Component } from 'react'
import {View, StyleSheet, Modal, Text, TouchableOpacity, Dimensions, Platform} from 'react-native'
import { RTCView, MediaStreamTrack, getUserMedia } from 'react-native-webrtc'
import InCallManager from 'react-native-incall-manager'
import Theme from 'config/theme'
import I18n from 'i18n'

export default class AVModal extends Component {

  static defaultProps = {
    remoteStreams: {},
    onStreamChange: (a, b, c) => null
  }

  state = {
    muted: false,
    isFront: true,
    stream: null,
  }

  componentDidMount() {
    if (Platform.OS === 'ios' && InCallManager.recordPermission !== 'granted') {
      InCallManager.requestRecordPermission()
        .then((result) => console.log('InCallManager.requestRecordPermission() result: ', result))
        .catch((err) => console.log('InCallManager.requestRecordPermission() catch: ', err))
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

  init = () => {
    // InCallManager.start({media: 'audio', ringback: '_DTMF_'})
    // InCallManager.setForceSpeakerphoneOn(true)
    this.getLocalStream(stream => {
      this.setState({stream})
      this.props.onStreamChange('full', stream, () => {
        // InCallManager.stopRingback()
      })
    })
  }

  /**
    Used to force the modal to close
   */
  close() {
    this.onClose()
  }

  onHardwareBack = () => {
    this.onClose()
  }

  onClose = () => {
    this.props.onStreamChange('off')
    if (this.state.stream) {
      this.state.stream.release()
    }

    //  InCallManager.setForceSpeakerphoneOn(false)
    //  InCallManager.stop()
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

  render() {

    const { remoteStreams } = this.props
    const { stream } = this.state

    return (
      <Modal
        transparent
        hardwareAccelerated
        style={styles.container}
        visible={true}
        onRequestClose={this.onHardwareBack}
      >
        {
          remoteStreams ? this.mapHash(remoteStreams, (remote, index) => {
            return remote ? <RTCView objectFit="cover" key={index} streamURL={remote.toURL()} style={styles.remoteView} /> : null
          }) : null
        }
        <View>
          <Text>Hello, world!</Text>
        </View>

        <View style={styles.selfViewWrapper}>
          {
            stream ? <RTCView streamURL={stream.toURL()} style={styles.selfView} /> : null
          }
        </View>
      </Modal>
    )
  }
}

const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,.5)',
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
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
