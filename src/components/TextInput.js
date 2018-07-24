import React, { Component } from 'react'
import { View, StyleSheet, TextInput as RNTextInput, Platform } from 'react-native'
import Theme from 'config/theme'
import { SysSvc } from 'services/sys'
import I18n from 'i18n'

export default class TextInput extends Component {

  componentWillMount() {
    this.setState({
      text: this.props.defaultValue,
      tempText: this.props.defaultValue,
      ok: typeof this.props.required === 'undefined' || !this.props.required,
    })
  }

  componentDidMount() {
    this.handleOnChange(this.state.text)
  }

  clear() {
    this.refs.input.clear()
    this.setState({text: '', tempText: ''})
  }

  focus() {
    this.refs.input.focus()
  }

  handleOnChange = (text) => {

    if (typeof text === 'undefined' || text === null) {
      return
    }

    let ok = true
    const { type, required } = this.props

    // check required
    if (required) {

      if (!text.length) {
        ok = false
      }

      if (type === 'email' && !SysSvc.isEmail(text.trim())) {
        ok = false
      }

      if (type === 'numeric') {
        const num = parseInt(text, 10)
        if ((typeof this.props.min !== 'undefined' && num < this.props.min || isNaN(num)) || (typeof this.props.max !== 'undefined' && num > this.props.max  || isNaN(num))) {
          ok = false
        }
      }
    }

    this.setState({text, ok})
    if (this.props.onChange) {
      if (this.props.trimOutput) {
        text = text.trim()
      }
      this.props.onChange(text, ok)
    }
  }

  render() {

    let extraProps = {}

    const { type, containerStyle, onBlur, ...otherProps } = this.props

    if (type === 'email') {
      extraProps.autoCapitalize = 'none'
    } else if (type === 'password' || type === 'text') {
      extraProps.keyboardType = 'default'
    } else {
      extraProps.keyboardType = type ? type : 'default'
    }

    const zhOpa = $.me && $.me.language === 'zh' && Platform.OS === 'ios'

    return (
      <View style={[styles.container, !this.state.ok && styles.required, containerStyle]}>
        <RNTextInput
          placeholder={ I18n.t('textInput.placeholder') }
          ref="input"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          spellCheck={false}
          keyboardType={type === 'email' ? 'email-address' : type}
          secureTextEntry={type === 'password'}
          onChangeText={(tempText) => {
            zhOpa ? this.setState({tempText}) : this.handleOnChange(tempText)
          }}
          onBlur={() => {
            zhOpa ? this.handleOnChange(this.state.tempText) : null
            if (onBlur) onBlur()
          }}
          selectionColor={Theme.activeGray}
          underlineColorAndroid="transparent"
          textSize={48}
          value={this.state.text}
          style={{fontSize: Theme.uiFontSize, fontStyle: (this.state.text && this.state.text.length) ? 'normal' : 'italic'}}
          {...extraProps}
          {...otherProps}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    borderColor: Theme.activeGreen,
    borderWidth: 2,
    backgroundColor: '#fff',
    height: Theme.uiHeight,
    borderRadius: 32,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  required: {
    borderColor: Theme.required,
  },
})
