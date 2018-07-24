import { AppRegistry, NativeModules, Platform } from 'react-native'
import ApplicationEntry from 'core/entry'
import { name as appName } from './app.json'
import I18n from 'i18n'

I18n.init(Platform.OS === 'ios' ? NativeModules.SettingsManager.settings.AppleLocale : NativeModules.I18nManager.localeIdentifier)

if (__DEV__) {
  // used to disable native console spam that makes debugging more difficult
  console.ignoredYellowBox = [
    'Setting a timer for a long period of time'
  ]

// that's because of that unblockable timer warning
  console.disableYellowBox = true
}

AppRegistry.registerComponent(appName, () => ApplicationEntry)
