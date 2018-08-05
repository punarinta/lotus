import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { NavigationActions, StackActions } from 'react-navigation'
import { StatusBar, Platform } from 'react-native'
import firebase from 'react-native-firebase'
import InCallManager from 'react-native-incall-manager'
import store from 'core/store'
import Loader from 'components/Loader'
import { SysSvc } from 'services/sys'
import { FcmSvc } from 'services/fcm'
import Theme from 'config/theme'

export default class SplashScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
  }

  state = {
    hydrated: false,
  }

  constructor(props) {
    super(props)
    StatusBar.setBarStyle('dark-content')
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Theme.white)
    }
  }

  resetNavigationTo(routeName) {
    return this.props.navigation.dispatch(StackActions.reset
    ({
      index: 0,
      actions: [NavigationActions.navigate({ routeName })]
    }))
  }

  async componentDidMount() {

    if (!await firebase.messaging().hasPermission()) {
      try {
        await firebase.messaging().requestPermission()
      } catch (error) {
        console.log('ERR', error)
      }
    }

    await store.init({persist:['phonebook', 'accounts']})

    // set default values
    window.$ = Object.assign({
      navigator: this.props.navigation,
      resetNavigationTo: this.resetNavigationTo,
      sessionId: (Math.random() + '').replace('0.', ''),
      phonebook: {},
      rooms: {},
      accounts: [],
      currentSketch: [],
    }, $)

    // TODO: remove before release
    $.accounts = [
      Platform.OS === 'ios' ?
        { id: '1533205457000', name: 'iOS phone' }
        :
        { id: '1533205457001', name: 'Android phone' }
    ]

    $.phonebook = {
      '1533205457010': { name: 'Phillip Horton' },
      '1533205457011': { name: 'Ronald Pierce' },
      '1533205457012': { name: 'Mike Hudson' },
    }

    if (Platform.OS === 'ios') {
      $.phonebook['1533205457001'] = { name: 'Android phone' }
    } else {
      $.phonebook['1533205457000'] = { name: 'iOS phone' }
    }
    // TODO: end remove

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

  componentDidUpdate(prevProps, prevState) {
    if (this.state.hydrated && !prevState.hydrated) {
      if ($.accounts.length) {
        this.resetNavigationTo('Home')
      } else {
        this.resetNavigationTo('Start')
      }
    } else {
      console.log("SplashScreen init failed")
    }
  }

  render() {
    return <Loader />
  }
}
