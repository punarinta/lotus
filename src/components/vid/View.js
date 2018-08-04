import React, { Component } from 'react'
import { Text, StyleSheet, View, Clipboard } from 'react-native'
import { SysSvc } from 'services/sys'
import vid from './'

const Svg = vid.Svg

export default class LView extends Component {

  getText() {
    const text = []
    const elements = SysSvc.intToVisual(this.props.id)

    for (const el of elements) {
      text.push(el.symbol + ' in a ' + vid.colorNames[el.color] + ' ' + vid.shapeNames[el.shape])
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
                <Svg shape={el.shape} color={vid.colors[el.color]} size={38} style={styles.shape} />
                <Text style={[styles.symbol, {color: vid.invColors[el.color]}]}>{ el.symbol }</Text>
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
  },
  symbol: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shape: {
    position: 'absolute',
  },
})
