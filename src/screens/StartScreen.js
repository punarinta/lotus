import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, Text, Animated, Keyboard } from 'react-native'
import { NavigationActions, StackActions } from 'react-navigation'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import Theme from 'config/theme'
import LogoSvg from 'components/svg/Logo'
import store from 'core/store'

export default class StartScreen extends Component {

  watchdog = null
  sizeValue = new Animated.Value(1)
  sizeValue2 = new Animated.Value(width * 0.5)

  state = {
    ok: false,
    name: '',
    email: '',
  }

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

  start = () => {
    const { email, name } = this.state
    $.accounts = [{ email, name }]
    store.sync()
    this.props.navigation.dispatch(StackActions.reset({index: 0, actions: [NavigationActions.navigate({routeName: 'Home'})]}))
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
            onChange={(email, ok) => this.setState({email, ok})}
          />
          <TextInput
            ref="name"
            title="name"
            onFocus={this.fieldFocused}
            onBlur={this.fieldBlurred}
            containerStyle={{width: width * 0.7}}
            onChange={(name, ok) => this.setState({name})}
          />
          <Button
            style={{marginTop: 32, width: width * 0.3}}
            caption="Start"
            active={this.state.ok}
            onPress={this.start}
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
    alignItems: 'center'
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
