import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import CloseSvg from 'svg/Close'
import FingerDraw from 'components/FingerDraw'
import Theme from 'config/theme'

export default class Sketcher extends Component {

  static defaultProps = {
    onClose: () => null,
  }

  state = {
    width: Theme.width,
    height: Theme.height,
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

        <FingerDraw width={width} height={height} />

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
