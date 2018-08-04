import React from 'react'
import { View } from 'react-native'
import BubbleSvg from 'svg/Bubble'
import DiskSvg from 'svg/Disk'
import CloudSvg from 'svg/Cloud'
import HeartSvg from 'svg/Heart'

const colors = ['blue', 'lime', 'red', 'gold', 'magenta', 'black', 'silver']

export default {
// TODO: update before release
  delta: 1533194414684,

// TODO: toss before release
  symbols: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#','1','2','3','4','5','6','7','8','9'],

  colors,
  invColors: ['white', 'black', 'white', 'black', 'black', 'white', 'black'],
  colorNames: ['blue', 'green', 'red', 'yellow', 'purple', 'black', 'gray'],
  shapeNames: ['box', 'circle', 'cloud', 'heart'],

  Svg: props => {
    switch (props.shape) {
      case 0: return <BubbleSvg {...props}/>
      case 1: return <DiskSvg {...props}/>
      case 2: return <CloudSvg {...props} size={props.size * 0.9}/>
      case 3: return <HeartSvg {...props}/>
    }
    return null
  },

  Color: props => {
    return <View style={[props.style, { backgroundColor: colors[props.color] }]}/>
  }
}
