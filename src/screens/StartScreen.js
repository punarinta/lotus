import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, Text, Animated, Easing } from 'react-native'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import Theme from 'config/theme'
import LogoSvg from 'components/svg/Logo'

export default class StartScreen extends Component {

  sizeValue = new Animated.Value(1)
  sizeValue2 = new Animated.Value(width * 0.5)

  fieldFocus = () => {
    Animated.timing(this.sizeValue, { toValue: 0, duration: 600, easing: Easing.linear }).start()
    Animated.timing(this.sizeValue2, { toValue: 0, duration: 500, easing: Easing.bounce }).start()
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
            Qrequired
            type="email"
            title="email"
            containerStyle={width * 0.7}
            onFocus={this.fieldFocus}
          />
          <TextInput
            title="name"
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
