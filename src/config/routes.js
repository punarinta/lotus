import SplashScreen from 'screens/SplashScreen'
import StartScreen from 'screens/StartScreen'
import PinScreen from 'screens/PinScreen'
import HomeScreen from 'screens/HomeScreen'
import RoomScreen from 'screens/RoomScreen'

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
  Start: { screen: StartScreen, navigationOptions },
  Pin: { screen: PinScreen, navigationOptions },
  Home: { screen: HomeScreen, navigationOptions },
  Room: { screen: RoomScreen, navigationOptions },
}
