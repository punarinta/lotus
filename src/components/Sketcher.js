import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native'
import CloseSvg from 'svg/Close'
import FingerDraw from 'components/FingerDraw'
import Theme from 'config/theme'

export default class Sketcher extends Component {

  static defaultProps = {
    onClose: () => null,
    onNewData: () => null,
  }

  state = {
    width: Theme.width,
    height: Theme.height,
  }

  takeData(chId, peerId, data) {
    if (typeof data === 'string') data = JSON.parse(data)
    if (data.add) {
      if (this.refs.draw) this.refs.draw.addPath(data.add)
      $.currentSketch.push(data.add)
    }
  }

  reset() {
    $.currentSketch = []
    this.setState({random: Math.random()})
  }

  componentDidMount() {
    this.props.onNewData(1, null, {cmd: 'clearSketch'})
    Keyboard.dismiss()
  }

  onPathAdded = (path) => {
    $.currentSketch.push(path)
    this.props.onNewData(2, null, {add: path})
  }

  close = () => {
    $.currentSketch = []
    this.props.onClose()
  }

  render() {
    const { width, height } = this.state

    return (
      <View style={[styles.container, this.props.style]}>
        <TouchableOpacity
          style={styles.close}
          onPress={this.close}
        >
          <CloseSvg />
        </TouchableOpacity>

        <FingerDraw
          initWith={$.currentSketch}
          width={width}
          height={height}
          ref="draw"
          onPathAdded={this.onPathAdded}
        />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.white,
    borderWidth: Theme.hairlineWidth,
    borderColor: Theme.black,
    width: Theme.width,
    height: Theme.height,
  },
  close: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
})
