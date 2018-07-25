import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'core/store'
import Loader from 'components/Loader'
import { NavigationActions, StackActions } from 'react-navigation'
import I18n from 'i18n'
import { SysSvc } from 'services/sys'
import { FcmSvc } from 'services/fcm'
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
      sessionId: Math.random(),
    }, $)

    I18n.init('en_US')

    const channel = new firebase.notifications.Android.Channel('lotus', 'Lotus Channel', firebase.notifications.Android.Importance.Max).setDescription('Lotus Channel')
    firebase.notifications().android.createChannel(channel)

    this.messageListener = firebase.messaging().onMessage(FcmSvc.receive)

    this.notificationListener = firebase.notifications().onNotification((notification) => {
      // notification in a foreground, data possible
      console.log('firebase.notifications().onNotification', notification)
      SysSvc.alert(0, 'firebase.notifications().onNotification: ' + SysSvc.stringify(notification))
    })
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      // bg mode: full, message, data -- crash!!!
      console.log('firebase.notifications().onNotificationOpened', notificationOpen)
      SysSvc.alert(0, 'firebase.notifications().onNotificationOpened: ' + SysSvc.stringify(notificationOpen))
    })

    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification) => {
      // ???
      console.log('firebase.notifications().onNotificationDisplayed', notification)
      SysSvc.alert(0, 'firebase.notifications().onNotificationDisplayed: ' + SysSvc.stringify(notification))
    })

    const notificationOpen = await firebase.notifications().getInitialNotification()
    if (notificationOpen) {
      const action = notificationOpen.action
      const notification = notificationOpen.notification
      console.log('firebase.notifications().getInitialNotification', action, notification)
      SysSvc.alert(0, 'firebase.notifications().getInitialNotification: ' + action + ', ' +  SysSvc.stringify(notification))
    }

    firebase.messaging().subscribeToTopic('topic-vladimir.g.osipov-at-gmail.com')

    this.setState({hydrated: true})
  }

  /*componentWillUnmount() {
    console.log('SplashScreen unmount')
    this.messageListener()
    this.notificationOpenedListener()
    this.notificationDisplayedListener()
    this.notificationListener()
  }*/

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.hydrated && !prevState.hydrated) {
      this.resetNavigationTo('Home')
    } else {
      console.log("this.resetNavigationTo('Home') failed")
    }
  }

  render() {
    return (
      <Loader />
    )
  }
}
