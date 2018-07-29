import React from 'react'
import Svg, { Path } from 'react-native-svg'

export default props => (
  <Svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" style={props.style}>
    <Path fill={props.color || "#000"} d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    <Path d="M0 0h24v24H0z" fill="none"/>
  </Svg>
)
