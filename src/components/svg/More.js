import React from 'react'
import Svg, { Path } from 'react-native-svg'

export default props => (
  <Svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" style={props.style}>
    <Path d="M0 0h24v24H0z" fill="none"/>
    <Path fill={props.color || "#000"} d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </Svg>
)
