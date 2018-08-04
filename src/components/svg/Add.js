import React from 'react'
import Svg, { Path } from 'react-native-svg'

export default props => (
  <Svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" style={props.style}>
    <Path fill={props.color || "#000"} d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    <Path d="M0 0h24v24H0z" fill="none"/>
  </Svg>
)
