import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native'
import Theme from 'config/theme'

export default class Loader extends Component {

  static propTypes = {
    isFetching: PropTypes.bool,
  }

  static defaultProps = {
    isFetching: true,
  }

  render() {
    const { isFetching } = this.props

    return (
      <View style={styles.container}>
        {
          isFetching ?
            <ActivityIndicator
              animating={true}
              size="large"
              style={styles.loader}
              color={Theme.black}
            /> : null
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    height: 64,
    width: 64,
    backgroundColor: Theme.white,
    borderColor: Theme.black,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 32,
    ...Platform.select({ios: {
      paddingTop: 4,
      paddingLeft: 3,
    }})
  }
})
