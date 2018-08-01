import React from 'react'
import { TouchableHighlight, Text, StyleSheet, View } from 'react-native'
import Theme from 'config/theme'

export default props => {

  const active = props.hasOwnProperty('active') ? props.active : true
  const aux = props.hasOwnProperty('aux') ? props.aux : false
  let timer = null

  if (active) {
    return (
      <TouchableHighlight
        underlayColor={Theme.lightGray}
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
          { props.caption }
        </Text>
      </TouchableHighlight>
    )
  } else {
    return (
      <View style={[styles.container, aux ? styles.containerInactiveAux : styles.containerInactive, props.style]}>
        <Text style={[styles.caption, aux ? styles.captionInactiveAux : styles.captionInactive]}>
          { props.caption }
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.white,
    height: 36,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 2,
    borderColor: Theme.black,
    borderWidth: 2,
  },
  containerInactive: {
    backgroundColor: Theme.lightGray,
    borderColor: Theme.lightGray,
  },
  containerAux: {
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Theme.white,
    borderColor: Theme.black,
  },
  containerInactiveAux: {
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Theme.lightGray,
    borderColor: Theme.lightGray,
  },
  caption: {
    color: Theme.black,
    textAlign: 'center',
  },
  captionInactive: {
    color: Theme.gray,
  },
  captionAux: {
    color: Theme.black,
  },
  captionInactiveAux: {
    color: Theme.gray,
  },
})
