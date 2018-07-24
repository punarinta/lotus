import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'core/store'
import Loader from 'components/Loader'
import { NavigationActions, StackActions } from 'react-navigation'
import I18n from 'i18n'
import firebase from 'react-native-firebase'

export default class SplashScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
  }

  state = {
    hydrated: false,
  }

  resetNavigationTo = (routeName) => {
    return this.props.navigation.dispatch(StackActions.reset
    ({
      index: 0,
      actions: [NavigationActions.navigate({ routeName })]
    }))
  }

  async componentWillMount() {

    const enabled = await firebase.messaging().hasPermission()

    if (!enabled) {
      try {
        await firebase.messaging().requestPermission()
      } catch (error) {
        console.log('ERR', error)
      }
    } else {
    }

    await store.init({persist:['']})

    // set default values
    window.$ = Object.assign({
      navigator: this.props.navigation,
      resetNavigationTo: this.resetNavigationTo,
    }, $)

    I18n.init('en_US')

    this.messageListener = firebase.messaging().onMessage((message) => {
      // data-only messages?
      console.log('firebase.messaging().onMessage', message)
    })

    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification) => {
      console.log('firebase.notifications().onNotificationDisplayed', notification)
    })
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      // notification in a foreground
      console.log('firebase.notifications().onNotification', notification)
    })

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      console.log('firebase.notifications().onNotificationOpened', notificationOpen)
    })

    const notificationOpen = await firebase.notifications().getInitialNotification()
    if (notificationOpen) {
      const action = notificationOpen.action
      const notification = notificationOpen.notification
      console.log('firebase.notifications().getInitialNotification', action, notification)
    }

    firebase.messaging().subscribeToTopic('topic-vladimir.g.osipov-at-gmail.com')

    this.setState({hydrated: true})
  }

  componentWillUnmount() {
    this.messageListener()
    this.notificationOpenedListener()
    this.notificationDisplayedListener()
    this.notificationListener()
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.hydrated && !prevState.hydrated) {
      this.resetNavigationTo('Home')
    }
  }

  render() {
    return (
      <Loader />
    )
  }
}
