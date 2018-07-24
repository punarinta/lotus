import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, ActivityIndicator, Platform } from 'react-native'
import Theme from 'config/theme'

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: [{
    height: 64,
    width: 64,
    backgroundColor: '#fff',
    borderRadius: 32,
  }, Platform.OS === 'ios' ? {
    paddingTop: 4,
    paddingLeft: 3,
  } : {}]
}

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
              color={Theme.activeGreen}
            /> : null
        }
      </View>
    )
  }
}
