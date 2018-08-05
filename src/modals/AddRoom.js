import React, { Component } from 'react'
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions, StatusBar, Platform } from 'react-native'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import VisualSelect from 'components/vid/Select'

import Theme from 'config/theme'
import I18n from 'i18n'

export default class AddRoom extends Component {

  static defaultProps = {
    onDone: () => null,
  }

  state = {
    value: 0,
    name: '',
    modalVisible: false,
  }

  open = () => {
    this.setState({
      name: '',
      value: 0,
      modalVisible: true,
    })
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#808080')
    }
  }

  close(ret = false) {
    this.setState({modalVisible: false})
    if (ret) {
      this.props.onDone(this.state.value, this.state.name.length ? this.state.name : I18n.tx('anon', {vars:[Math.round((1000 + Math.random() * 8999))]}))
    }
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Theme.white)
    }
  }

  render() {
    return (
      <Modal
        transparent
        hardwareAccelerated
        style={{backgroundColor: 'transparent'}}
        visible={this.state.modalVisible}
        onRequestClose={() => this.close()}
      >
        <TouchableOpacity
          style={styles.bg}
          activeOpacity={1}
          onPress={() => this.close()}
        >
          <View style={styles.container} onStartShouldSetResponder={() => true}>
            <View style={{height: 64, width: width * 0.8 - 20}}>
              <TextInput title="Name" onChange={(name) => this.setState({name})}/>
            </View>
            <VisualSelect onChange={(value) => this.setState({value})} />
            <View style={{marginTop: 16, flexDirection: 'row'}}>
              <Button
                caption={I18n.t('buttons.cancel')}
                onPress={() => this.close()}
                style={{marginRight: 16}}
              />
              <Button
                active={!!this.state.name.length}
                caption={I18n.t('buttons.ok')}
                onPress={() => this.close(true)}
              />
            </View>
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
    backgroundColor: Theme.white,
    padding: Theme.isTablet ? 24 : 16,
    borderRadius: 8,
    alignItems: 'center',
  },
})
