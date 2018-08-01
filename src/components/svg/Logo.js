import React from 'react'
import Svg, { Path } from 'react-native-svg'

export default props => (
  <Svg width={props.size || 48} height={props.size || 48} viewBox="0 0 158.22 158.22" style={props.style}>
    <Path fill={props.color || "#000"} d="M79.27 106.02c.48.03.98.1 1.45.13 1.14.1 2.28.16 3.42.21 2.11.08 4.26.06 6.37-.1 3.73-.27 7.47-.93 11.04-2.07 3.1-.98 6.08-2.27 8.89-3.91a43.81 43.81 0 0 0 12.17-10.64 46.66 46.66 0 0 0 5.95-9.76c.42-.93.8-1.85 1.14-2.8.08-.22.13-.43.21-.64-38.97-4.74-50.7 28.94-50.7 28.94C73.9 93.9 67.29 86.86 60.28 82.52 44.7 72.9 28.31 76.9 28.31 76.9l.53 1.32a49.57 49.57 0 0 0 4.76 8.47 51.45 51.45 0 0 0 4.53 5.63 46.95 46.95 0 0 0 6.13 5.56 42.12 42.12 0 0 0 7.94 4.7 44.17 44.17 0 0 0 9.87 3.13c3.94.74 7.97.95 11.96.74.95-.05 1.9-.13 2.86-.21.69-.08 1.37-.24 2.09-.24.05 0 .18 0 .29.03z"/>
    <Path fill={props.color || "#000"} d="M49.74 55.46s-1.32 11.59 1.77 22.2c0 0 18.31 4.86 27.65 26.22 0 0 8.1-19.74 27.55-26.07 0 0 3.22-8.91 1.61-22.6 0 0-25.61 8.93-29 35.57-.02-.03-1.8-24.9-29.58-35.32z"/>
    <Path fill={props.color || "#000"} d="M79.08 47.33s8.55 11.65 9.87 20.54c0 0-8.54 9-9.65 19.2 0 0-1.62-11.19-10.09-19.2 0 0 5.22-16.43 9.87-20.54z"/>
    {
      props.withBorder && <Path fill={props.color || "#000"} d="M140.23 8.47a9.52 9.52 0 0 1 9.52 9.52v122.24a9.52 9.52 0 0 1-9.52 9.52H17.99a9.52 9.52 0 0 1-9.52-9.52V17.99a9.52 9.52 0 0 1 9.52-9.52h122.24m0-8.47H17.99C8.04 0 0 8.04 0 18v122.23c0 9.95 8.04 18 18 18h122.23c9.95 0 18-8.05 18-18V17.99a18 18 0 0 0-18-17.99z"/>
    }
  </Svg>
)