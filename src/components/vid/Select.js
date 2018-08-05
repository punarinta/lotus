import React, { Component } from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { SysSvc } from 'services/sys'
import vid from './'
import Theme from 'config/theme'

const Svg = vid.Svg, Color = vid.Color

export default class Select extends Component {

  static defaultProps = {
    defaultValue: vid.delta,
    onChange: () => null,
  }

  state = {
    elements: SysSvc.intToVisual(this.props.defaultValue),
    selected: 0,
    detSelected: 'symbol',
  }

  tapOn(selected) {
    this.setState({selected})
  }

  detShow(detSelected) {
    this.setState({detSelected})
  }

  detChanged(newValue) {
    const { elements, selected, detSelected } = this.state
    elements[selected][detSelected] = newValue
    this.setState({elements})
    this.props.onChange(SysSvc.visualToInt(elements))
  }

  renderOptions() {
    const { elements, selected, detSelected } = this.state
    const sortedSymbols = vid.symbols.slice().sort()

    switch (detSelected) {
      case 'symbol':
        // TODO: order alphanumerically to hide the toss
        return sortedSymbols.map((el, i) => {
          return <TouchableOpacity key={i} onPress={() => this.detChanged(el)} style={[styles.option, el === elements[selected][detSelected] && {backgroundColor: Theme.lightGray}]}>
            <Text style={{fontFamily: Theme.monoFont, paddingHorizontal: 4}}>{ el }</Text>
          </TouchableOpacity>
        })

      case 'shape':
        return [0,1,2,3].map((el, i) => {
          return <TouchableOpacity key={i} onPress={() => this.detChanged(el)} style={[styles.option, el === elements[selected][detSelected] && {backgroundColor: Theme.lightGray}]}>
            <Svg shape={el} size={36} color={Theme.gray} />
          </TouchableOpacity>
        })

      case 'color':
        return [0,1,2,3,4,5,6].map((el, i) => {
          return <TouchableOpacity key={i} onPress={() => this.detChanged(el)} style={[styles.option, el === elements[selected][detSelected] && {backgroundColor: Theme.lightGray}]}>
            <Color color={el} style={styles.colorPatch} />
          </TouchableOpacity>
        })
    }
  }

  render() {

    const { elements, selected, detSelected } = this.state

    return (
      <View>
        <View style={styles.container}>
          {
            elements.map((el, i) => {
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.item, selected === i && styles.selItem]}
                  onPress={() => this.tapOn(i)}
                  activeOpacity={1}
                >
                  <Svg shape={el.shape} color={vid.colors[el.color]} size={38} style={styles.shape} />
                  <Text style={[styles.symbol, {color: vid.invColors[el.color]}]}>{ el.symbol }</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
        <View style={styles.details}>
          <TouchableOpacity style={[styles.detail, detSelected === 'symbol' && styles.selDetail]} onPress={() => this.detShow('symbol')}>
            <Text style={{color: Theme.black, fontSize: 18}}>{ elements[selected].symbol }</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.detail, detSelected === 'shape' && styles.selDetail]} onPress={() => this.detShow('shape')}>
            <Svg shape={elements[selected].shape} size={36} color={Theme.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.detail, detSelected === 'color' && styles.selDetail]} onPress={() => this.detShow('color')}>
            <Color color={elements[selected].color} style={styles.colorPatch} />
          </TouchableOpacity>
        </View>
        <View style={styles.options}>
          { this.renderOptions() }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  item: {
    width: 48,
    height: 48,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selItem: {
    backgroundColor: Theme.lightGray,
  },
  symbol: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shape: {
    position: 'absolute',
  },
  details: {
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    height: 48,
  },
  detail: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  selDetail: {
    backgroundColor: Theme.lightGray,
  },
  options: {
    flexDirection: 'row',
    maxWidth: Theme.width * 0.75,
    flexWrap: 'wrap',
    backgroundColor: '#f2f2f2',
    justifyContent: 'space-between'
  },
  option: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  colorPatch: {
    width: 24,
    height: 24,
  },
})
