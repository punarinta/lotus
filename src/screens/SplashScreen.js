import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'core/store'
import Loader from 'components/Loader'
import { NavigationActions, StackActions } from 'react-navigation'
import { StatusBar, Platform } from 'react-native'
import I18n from 'i18n'
import { SysSvc } from 'services/sys'
import { FcmSvc } from 'services/fcm'
import firebase from 'react-native-firebase'
import InCallManager from 'react-native-incall-manager'
import Theme from 'config/theme'

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

    StatusBar.setBarStyle('dark-content')
    StatusBar.setBackgroundColor(Theme.white)

    const enabled = await firebase.messaging().hasPermission()

    if (!enabled) {
      try {
        await firebase.messaging().requestPermission()
      } catch (error) {
        console.log('ERR', error)
      }
    } else {
    }

    await store.init({persist:['phonebook', 'emails', 'accounts']})

    // set default values
    window.$ = Object.assign({
      navigator: this.props.navigation,
      resetNavigationTo: this.resetNavigationTo,
      sessionId: Math.random(),
      phonebook: {},
      accounts: [],
    }, $)

    // TODO: remove before release
    $.accounts = [
      Platform.OS === 'ios' ?
        { email: 'ios@lotus.test', name: 'iOS phone' }
        :
        { email: 'android@lotus.test', name: 'Android phone' }
    ]

    $.phonebook = {
      'john.doe@mail.test': {name: 'John Doe'},
      'ronald.pierce@user.test': {name: 'Ronald Pierce'},
      'mike.hudson@user.test': {name: 'Mike Hudson'},
    }

    if (Platform.OS === 'ios') {
      $.phonebook['android@lotus.test'] = {name: 'Android phone'}
    } else {
      $.phonebook['ios@lotus.test'] = {name: 'iOS phone'}
    }
    // TODO: end remove

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

    // TODO: remove this later
    InCallManager.setKeepScreenOn(true)

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
