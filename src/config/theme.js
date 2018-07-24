import React from 'react'
import { Platform, Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

const isTablet = Math.min(width, height) >= 480

const theme = {
  navigatorHeight: isTablet ? 64 : 48,
  topBarHeight: Platform.OS === 'ios' ? 0 : 24,
  globalMarginTop: Platform.OS === 'ios' ? 20 : 0,
  activeGreen: '#73b937',
  inactiveGreen: '#c7e3af',
  activeBlack: '#000',
  inactiveBlack: '#999',
  activeGray: '#a7a7a7',
  inactiveGray: '#e0e0e0',
  required: 'red',
  debug: {
    borderWidth: 1,
    borderColor: 'red',
  },
  isTablet,

  uiHeight: isTablet ? 64 : 48,
  uiFontSize: isTablet ? 24 : 18,
  uiFontSize32: isTablet ? 32 : 24,
  uiFontSize28: isTablet ? 28 : 20,
  uiFontSize18: isTablet ? 18 : 15,
  uiFontSize16: isTablet ? 16 : 14,

  width,
  height,
}

export default theme
