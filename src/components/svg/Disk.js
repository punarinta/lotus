import React from 'react'
import Svg, { Path } from 'react-native-svg'

export default props => (
  <Svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" style={props.style}>
    <Path d="M0 0h24v24H0z" fill="none"/>
    <Path fill={props.color || "#000"} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
  </Svg>
)
