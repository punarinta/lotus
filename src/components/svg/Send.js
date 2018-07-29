import React from 'react'
import Svg, { Path } from 'react-native-svg'

export default props => (
  <Svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" style={props.style}>
    <Path fill={props.color || "#000"} d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    <Path d="M0 0h24v24H0z" fill="none"/>
  </Svg>
)
