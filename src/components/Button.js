import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import Theme from 'config/theme'

const Button = (props) => {

  const active = props.hasOwnProperty('active') ? props.active : true
  const aux = props.hasOwnProperty('aux') ? props.aux : false
  const size = props.size || 'regular'
  let timer = null

  if (active) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (props.hasOwnProperty('onPress') && (props.allowMultipleTaps || !timer)) {
            timer = setTimeout(() => timer = null, 1000)
            props.onPress()
          }
        }}
        activeOpacity={aux ? 0.5 : 0.8}
        style={[styles.container, aux ? styles.containerAux : null, props.style]}
      >
        <Text style={[styles.caption, aux ? styles.captionAux : null]}>
          {props.caption}
        </Text>
      </TouchableOpacity>
    )
  } else {
    return (
      <View style={[styles.container, aux ? styles.containerInactiveAux : styles.containerInactive, props.style]}>
        <Text style={[styles.caption, aux ? styles.captionInactiveAux : null]}>
          {props.caption}
        </Text>
      </View>
    )
  }
}

export default Button

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.activeGreen,
    height: Theme.uiHeight,
    minHeight: Theme.uiHeight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 2,
  },
  containerAux: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Theme.activeBlack,
  },
  containerInactive: {
    backgroundColor: Theme.inactiveGreen,
  },
  containerInactiveAux: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Theme.inactiveBlack,
  },
  caption: {
    color: '#fff',
    fontSize: Theme.uiFontSize16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  captionInactiveAux: {
    color: Theme.inactiveBlack,
  },
  captionAux: {
    color: Theme.activeBlack,
  },
})