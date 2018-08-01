import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, Text, Animated, Keyboard } from 'react-native'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import Theme from 'config/theme'
import LogoSvg from 'components/svg/Logo'

export default class StartScreen extends Component {

  watchdog = null
  sizeValue = new Animated.Value(1)
  sizeValue2 = new Animated.Value(width * 0.5)

  fieldFocused = () => {
    Animated.timing(this.sizeValue, { toValue: 0, duration: 350 }).start()
    Animated.timing(this.sizeValue2, { toValue: 0, duration: 350 }).start()
    if (this.watchdog) clearTimeout(this.watchdog)
  }

  fieldBlurred = () => {
    if (this.watchdog) clearTimeout(this.watchdog)
    this.watchdog = setTimeout(() => {
      Keyboard.dismiss()
      Animated.timing(this.sizeValue, { toValue: 1, duration: 350 }).start()
      Animated.timing(this.sizeValue2, { toValue: width * 0.5, duration: 350 }).start()
      this.watchdog = null
    }, 100)
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controls}>
          <Animated.View style={[styles.logo, {transform: [{scale: this.sizeValue}], height: this.sizeValue2}]}>
            <View style={styles.logoBorder}>
              <LogoSvg size={width * 0.3}/>
            </View>
          </Animated.View>
          <TextInput
            required
            type="email"
            title="email"
            containerStyle={{width: width * 0.7, marginBottom: 8}}
            returnKeyType="next"
            onFocus={this.fieldFocused}
            onBlur={this.fieldBlurred}
            onSubmitEditing={() => this.refs.name.focus()}
            blurOnSubmit={false}
          />
          <TextInput
            ref="name"
            title="name"
            onFocus={this.fieldFocused}
            onBlur={this.fieldBlurred}
          />
        </View>
        <View style={styles.gap}/>
        <Text style={styles.bottomMessage}>Lotus does not have any servers.</Text>
      </View>
    )
  }
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: width * 0.15,
    paddingTop: width * 0.1,
  },
  logo: {
    alignItems: 'center',
  },
  logoBorder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme.black,
    borderRadius: 8,
    marginVertical: width * 0.1,
  },
  gap: {
    flex: 1,
  },
  bottomMessage: {
    fontSize: 10,
    color: Theme.black,
    marginBottom: 8,
    paddingHorizontal: 10,
    fontFamily: Theme.thinFont,
  },
})
