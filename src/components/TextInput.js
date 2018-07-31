import React, { Component } from 'react'
import { View, StyleSheet, TextInput as RNTextInput, Platform, Text } from 'react-native'
import Theme from 'config/theme'
import { SysSvc } from 'services/sys'
import I18n from 'i18n'

export default class TextInput extends Component {

  static defaultProps = {
    title: null,
    style: {},
    containerStyle: {},
    onBlur: () => null,
  }

  isEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

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

      if (type === 'email' && !this.isEmail(text.trim())) {
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

    const { type, onBlur, style, title, containerStyle, ...otherProps } = this.props

    if (type === 'email') {
      extraProps.autoCapitalize = 'none'
    } else if (type === 'password' || type === 'text') {
      extraProps.keyboardType = 'default'
    } else {
      extraProps.keyboardType = type ? type : 'default'
    }

    const zhOpa = false // $.me && $.me.language === 'zh' && Platform.OS === 'ios'

    return (
      <View style={[styles.container, containerStyle]}>
        {
          this.props.title !== null && <Text style={styles.title}>{ title.toUpperCase() }</Text>
        }
        <RNTextInput
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
            onBlur()
          }}
          selectionColor={Theme.gray}
          underlineColorAndroid="transparent"
          value={this.state.text}
          style={[styles.input, style, !this.state.ok && styles.required]}
          {...extraProps}
          {...otherProps}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  required: {
    borderColor: Theme.required,
  },
  input: {
    borderColor: Theme.black,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3,
    height: 36,
    fontSize: 16,
    paddingTop: 0,
    paddingBottom: 2,
    fontStyle: 'normal',
    fontFamily: Theme.monoFont,
  },
  title: {
    color: Theme.darkGray,
    fontSize: 10,
    textTransform: 'uppercase',
    fontFamily: Theme.thinFont,
  },
})
