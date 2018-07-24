import React, { Component } from 'react'
import { View, StyleSheet, Modal, Text, TouchableOpacity, Dimensions } from 'react-native'
import { store, listen } from 'core'
import { MBOX_OPEN } from 'services/sys'
import Theme from 'config/theme'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import I18n from 'i18n'

export default class MessageBox extends Component {

  state = {
    modalVisible: false,
    head: '',
    text: '',
    buttons: null,
    cancelable: true,
    prompt: false,
    promptInput: '',
  }

  open = ({head, text, buttons, config}) => {
    this.setState({
      modalVisible: true,
      prompt: config ? (config.prompt || false) : false,
      cancelable: config ? (!!config.cancelable) : true,
      head, text, buttons
    })
  }

  close = () => {
    this.setState({modalVisible: false})
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  componentDidMount() {
    store.bind([MBOX_OPEN], (payload) => {
      this.open(payload)
    })
  }

  render() {

    let buttons = this.state.buttons || [{
      text: I18n.t('buttons.ok'),
      onPress: null,
    }]

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
          activeOpacity={this.state.cancelable ? 0.8 : 1}
          onPress={this.state.cancelable ? this.close : null}
        >
          <View style={styles.container}>
            <Text style={styles.header}>{ this.state.head }</Text>
            <Text style={styles.text}>{ this.state.text }</Text>
            {
              this.state.prompt !== false &&
              <TextInput
                containerStyle={styles.textInput}
                onChange={(promptInput) => this.setState({promptInput})}
              />
            }
            <View style={[styles.buttons, buttons.length < 3 && styles.horizontalButtons]}>
              {
                buttons.map((el, i) => {
                  if (el.style === 'separator') {
                    return <View
                      key={i}
                      style={buttons.length < 3 ? styles.horizontalSeparator : styles.verticalSeparator}
                    />
                  }
                  return <Button
                    key={i}
                    style={buttons.length < 3 ? styles.horizontalButton : styles.verticalButton}
                    caption={el.text}
                    onPress={() => {
                      if (el.onPress) el.onPress(this.state.prompt ? this.state.promptInput : 0)
                      this.close()
                    }}
                    aux={el.aux}
                  />
                })
              }
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
    backgroundColor: '#fff',
    padding: Theme.isTablet ? 24 : 16,
    borderRadius: 8,
  },
  header: {
    fontWeight: '600',
    color: '#000',
    fontSize: Theme.uiFontSize,
    marginBottom: Theme.isTablet ? 16 : 8,
  },
  text: {
    color: '#000',
    fontSize: Theme.uiFontSize,
  },
  buttons: {
    marginTop: Theme.isTablet ? 32 : 16,
  },
  horizontalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  horizontalButton: {
    marginHorizontal: 8,
  },
  verticalButton: {
    marginVertical: 8,
  },
  textInput: {
    marginTop: 16,
  },
  horizontalSeparator: {
    marginLeft: Theme.isTablet ? 32 : 16,
  },
  verticalSeparator: {
    marginTop: Theme.isTablet ? 32 : 16,
  },
})
