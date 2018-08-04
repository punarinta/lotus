import React, { Component } from 'react'
import { View, StyleSheet, Modal, Text, TouchableOpacity, Dimensions, Platform } from 'react-native'
import Button from 'components/Button'
import VisualSelect from 'components/vid/Select'

import Theme from 'config/theme'
import I18n from 'i18n'

export default class AddRoom extends Component {

  static defaultProps = {
    onSelect: () => null,
  }

  state = {
    value: 0,
    modalVisible: false,
  }

  open = () => {
    this.setState({
      modalVisible: true,
    })
  }

  close(ret = false) {
    this.setState({modalVisible: false})
    if (ret) this.props.onSelect(this.state.value)
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
          <View style={styles.container}>
            <VisualSelect onChange={(value) => this.setState({value})} />
            <Button
              caption={I18n.t('buttons.ok')}
              onPress={() => this.close(true)}
              style={{marginTop: 16}}
            />
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
