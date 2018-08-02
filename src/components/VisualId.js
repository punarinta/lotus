import React, { Component } from 'react'
import { Text, StyleSheet, View, Clipboard } from 'react-native'
import { SysSvc } from 'services/sys'
import BubbleSvg from './svg/Bubble'
import DiskSvg from './svg/Disk'
import CloudSvg from './svg/Cloud'
import HeartSvg from './svg/Heart'
import Theme from 'config/theme'

const colors = ['blue', 'lime', 'red', 'gold', 'magenta', 'black', 'silver']
const invColors = ['white', 'black', 'white', 'black', 'black', 'white', 'black']
const colorNames = ['blue', 'green', 'red', 'yellow', 'purple', 'black', 'gray']
const shapeNames = ['box', 'circle', 'cloud', 'heart']

Svg = props => {
  switch (props.shape) {
    case 0: return <BubbleSvg {...props}/>
    case 1: return <DiskSvg {...props}/>
    case 2: return <CloudSvg {...props} size={props.size*0.9}/>
    case 3: return <HeartSvg {...props}/>
  }
}

export default class VisualId extends Component {

  getText() {
    const text = []
    const elements = SysSvc.intToVisual(this.props.id)

    for (const el of elements) {
      text.push(el.symbol + ' in a ' + colorNames[el.color] + ' ' + shapeNames[el.shape])
    }

    return text.join(', ')
  }

  async copy() {
    await Clipboard.setString(this.getText())
  }

  render() {
    const elements = SysSvc.intToVisual(this.props.id)

    return (
      <View style={styles.container}>
        {
          elements.map((el, i) => {
            return (
              <View style={styles.item} key={i}>
                <Svg shape={el.shape} color={colors[el.color]} size={38} style={styles.shape}/>
                <Text style={[styles.symbol, {color: invColors[el.color]}]}>{ el.symbol }</Text>
              </View>
            )
          })
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  item: {
    width: 36,
    height: 48,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  symbol: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shape: {
    position: 'absolute',
  },
})
