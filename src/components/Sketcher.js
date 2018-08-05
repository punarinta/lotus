import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
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
    }
  }

  onPathAdded = (path) => {
    this.props.onNewData(2, null, {add: path})
  }

  render() {
    const { width, height } = this.state

    return (
      <View style={[styles.container, this.props.style]}>
        <TouchableOpacity
          style={styles.close}
          onPress={this.props.onClose}
        >
          <CloseSvg />
        </TouchableOpacity>

        <FingerDraw
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
