import React, { Component } from 'react'
import { View, StyleSheet, Modal, Text, TouchableOpacity, Dimensions, NetInfo, Platform } from 'react-native'
import Theme from 'config/theme'
import I18n from 'i18n'
import Button from 'components/Button'
import WiFiSvg from 'components/svg/WiFi'

export default class InterwebzNotice extends Component {

  watchdog = null

  state = {
    modalVisible: false,
  }

  open = () => {
    this.setState({modalVisible: true})
  }

  close = () => {
    this.setState({modalVisible: false})
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  retry = () => {
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        this.close()
      }
    })
  }

  handlerFunction = (isConnected) => {
    if (!isConnected && this.watchdog !== 'dead') {
      this.open()
    }
  }

  // ref: https://facebook.github.io/react-native/docs/netinfo.html

  componentDidMount() {

    this.watchdog = setTimeout(() => this.watchdog = 'dead', 5000)

    setTimeout(() => {
      if (Platform.OS === 'ios') {
        NetInfo.isConnected.fetch().then().done(() => NetInfo.isConnected.addEventListener('change', this.handlerFunction) )
      } else {
        NetInfo.isConnected.fetch().then(isConnected => {
          if (!isConnected && this.watchdog !== 'dead') {
            this.open()
          }
        })
      }
    }, 250)
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      NetInfo.isConnected.removeEventListener('change', this.handlerFunction)
    }
  }

  render() {

    return (
      <Modal
        transparent
        hardwareAccelerated
        style={{backgroundColor: 'transparent'}}
        visible={this.state.modalVisible}
        onRequestClose={this.close}
      >
        <TouchableOpacity
          style={styles.bg}
          activeOpacity={1}
          onPress={null}
        >
          <View style={styles.container}>
            <WiFiSvg color={Theme.activeGreen} size={Theme.isTablet ? 128 : 64} />
            <Text style={styles.message}>{ I18n.t('mbox.noInterwebz') }</Text>
            <Button caption="Retry" onPress={this.retry}/>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }
}

const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  bg: {
    backgroundColor: 'rgba(0,0,0,.5)',
    padding: Theme.isTablet ? width * 0.1 : 8,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: Theme.isTablet ? 24 : 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  message: {
    fontSize: Theme.uiFontSize,
    marginVertical: 16,
    textAlign: 'center',
  }
})
