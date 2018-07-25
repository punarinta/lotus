import InCallManager from 'react-native-incall-manager'

export default async (message) => {
  console.log('RNFirebaseBackgroundMessage', message)

  /*InCallManager.start({media: 'audio', ringback: '_BUNDLE_'})
  InCallManager.setForceSpeakerphoneOn(true)

  setTimeout(() => {
    InCallManager.stopRingback()
    InCallManager.setForceSpeakerphoneOn(false)
    InCallManager.stop()
  }, 5000)*/

  return Promise.resolve()
}
