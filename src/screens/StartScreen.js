import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, Text, Animated, Keyboard, TouchableOpacity } from 'react-native'
import { NavigationActions, StackActions } from 'react-navigation'
import Button from 'components/Button'
import TextInput from 'components/TextInput'
import VisualId from 'components/VisualId'
import Theme from 'config/theme'
import LogoSvg from 'components/svg/Logo'
import RenewSvg from 'components/svg/Renew'
import store from 'core/store'

export default class StartScreen extends Component {

  watchdog = null
  sizeValue = new Animated.Value(1)
  sizeValue2 = new Animated.Value(width * 0.5)

  state = {
    id: (new Date).getTime(),
    name: 'Anon-' + Math.round((1000 + Math.random() * 8999)) + '',
    nameWasChanged: false,
  }

  fieldFocused = () => {
    if (!this.state.nameWasChanged) {
      this.setState({name:'', nameWasChanged:true})
    }
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

  regenerate = () => {
    this.setState({id: (new Date).getTime()})
  }

  start = () => {
    const { id, name } = this.state
    $.accounts = [{ id, name }]
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
          <View style={{flexDirection: 'row'}}>
            <VisualId id={this.state.id} />
            <TouchableOpacity onPress={this.regenerate} style={{justifyContent: 'center', marginLeft: 8}}>
              <RenewSvg color={Theme.gray}/>
            </TouchableOpacity>
          </View>
          <TextInput
            ref="name"
            title="name"
            value={this.state.name}
            onFocus={this.fieldFocused}
            onBlur={this.fieldBlurred}
            containerStyle={{width: width * 0.7}}
            onChange={(name, ok) => {
              this.setState({name, id: (new Date).getTime()})
            }}
          />
          <Button
            active={this.state.name.length}
            style={{marginTop: 32, width: width * 0.3}}
            caption="Start"
            onPress={this.start}
          />
        </View>
        <View style={styles.gap}/>
        <Text style={styles.bottomMessage}>
          Lotus does not have any servers, so it doesn't need your credentials either. However your may set a name to be shown when you connect to others.
        </Text>
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
    textAlign: 'center',
  },
})
