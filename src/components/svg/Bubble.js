import React from 'react'
import Svg, { Path } from 'react-native-svg'

export default props => (
  <Svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" style={props.style}>
    <Path d="M0 0h24v24H0z" fill="none"/>
    <Path fill={props.color || "#000"} d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" translateY="2"/>
  </Svg>
)
