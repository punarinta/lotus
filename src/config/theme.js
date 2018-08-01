import React from 'react'
import { Platform, Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

const isTablet = Math.min(width, height) >= 480

const theme = {
  navigatorHeight: isTablet ? 64 : 48,
  topBarHeight: Platform.OS === 'ios' ? 0 : 24,
  globalMarginTop: Platform.OS === 'ios' ? 20 : 0,

  black: '#000',
  white: '#fff',
  lightGray: '#e9e9e9',
  gray: '#8a8989',
  darkGray: '#5c5a5a',

  thinFont: Platform.select({android: 'sans-serif-light'}),
  condensedFont: Platform.select({android: 'sans-serif-condensed'}),
  monoFont: Platform.select({android: 'monospace', ios: 'Courier New'}),

  debug: {
    borderWidth: 1,
    borderColor: 'red',
  },

  isTablet,
  width,
  height,
}

export default theme
