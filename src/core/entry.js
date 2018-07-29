import React, { Component } from 'react'
import { StackNavigator } from 'react-navigation'
import { Animated, Easing } from 'react-native'
import RoutesConfig from 'config/routes'
import MessageBox from 'modals/MessageBox'
import Theme from 'config/theme'

const AppNavigator = StackNavigator(RoutesConfig, {
  mode: 'modal',
  transitionConfig: () => ({
    transitionSpec: {
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.poly(1)),
      timing: Animated.timing,
    },
    screenInterpolator: sceneProps => {
      const { layout, position, scene } = sceneProps
      const { index } = scene

      const width = layout.initWidth
      const translateX = position.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [width, 0, 0],
      })

      return { transform: [{ translateX }] }
    },
  }),
  cardStyle: {
    backgroundColor: Theme.white,
  },
})

export default class ApplicationEntry extends Component {

  componentDidMount() {

    const spamMessages = [
      'Setting a timer for a long period of time'
    ]

    console.warn = function() {
      for (const spam of spamMessages) {
        if (arguments[0].indexOf('Setting a timer for a long period of time') !== -1) {
          return
        }
      }
      console.log(...arguments)
    }
  }

  render() {
    return [
      <MessageBox key="mbox"/>,
      <AppNavigator key="nav" onNavigationStateChange={null} />
    ]
  }
}
