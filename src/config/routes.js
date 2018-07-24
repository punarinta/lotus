import SplashScreen from 'screens/SplashScreen'
import HomeScreen from 'screens/HomeScreen'
import VideoScreen from 'screens/VideoScreen'

import Theme from 'config/theme'

const headerStyles = {
  headerStyle: {
    backgroundColor: '#fff',
    height: Theme.navigatorHeight + Theme.globalMarginTop,
  },
  headerTitleStyle: {
    color: Theme.black,
    fontWeight: '300',
    fontSize: 17,
    textAlign: 'center',
  },
  headerTintColor: Theme.black,
}

const navigationOptions = {header: null}

export default {
  Splash: { screen: SplashScreen, navigationOptions },
  Home: { screen: HomeScreen, navigationOptions },
  Video: { screen: VideoScreen, navigationOptions },
}
