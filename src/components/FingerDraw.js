import React, { Component } from 'react'
import { View, PanResponder } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import Theme from 'config/theme'

export default class FingerDraw extends Component {

  ptdata = []
  evCounter = 0
  pathsToReturn = []

  static defaultProps = {
    onPathAdded: () => null,
    initWith: [],
  }

  constructor(props) {
    super(props)
    this.state = { paths: [] }
    this.stringKey = 0
    this.strokeWidth = Theme.isTablet ? 3 : 1
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gs) => this.onFingerDown(evt, gs),
      onPanResponderMove: (evt, gs) => this.onFingerMove(evt, gs),
      onPanResponderRelease: (evt, gs) => this.onFingerUp(evt, gs),
    })
  }

  componentDidMount() {
    const paths = []
    this.pathsToReturn = this.props.initWith
    for (const p of this.pathsToReturn) {
      paths.push(this.preRenderString(string))
    }
    this.setState({paths})
  }

  componentWillReceiveProps() {
    const paths = []
    this.pathsToReturn = this.props.initWith
    for (const p of this.pathsToReturn) {
      paths.push(this.preRenderString(string))
    }
    this.setState({paths})
  }

  getData() {
    return this.pathsToReturn
  }

  addPath(string) {
    const paths = this.state.paths

    paths.unshift(this.preRenderString(string))
    this.pathsToReturn.push(string)
    this.setState({paths})
  }

  onFingerDown(ev) {

    this.evCounter = 0
    this.ptdata = [{x: ev.nativeEvent.locationX, y: ev.nativeEvent.locationY }]

    // push one dummy to the end
    const paths = this.state.paths
    paths.push(null)
    this.setState({paths})

    this.constraints = [ev.nativeEvent.locationX - ev.nativeEvent.pageX,  ev.nativeEvent.locationY - ev.nativeEvent.pageY]
  }

  onFingerMove(ev) {
    if (ev.nativeEvent.touches.length > 1) {
      return false
    }

    // the very first one must pass
    if ((this.evCounter++) % 2) {
      return false
    }

    if (ev.nativeEvent.locationX - ev.nativeEvent.pageX !== this.constraints[0] || ev.nativeEvent.locationY - ev.nativeEvent.pageY !== this.constraints[1]) {
      return false
    }

    this.ptdata.push({ x: ev.nativeEvent.locationX, y: ev.nativeEvent.locationY })

    const paths = this.state.paths

    let string = 'M'

    for (const pt of this.ptdata) {
      string += pt.x + ' ' + pt.y + 'L'
    }

    string = string.slice(0, -1)
    paths[paths.length - 1] = this.preRenderString(string)
    this.setState({paths})
  }

  onFingerUp() {
    const paths = this.state.paths
    const ptData = simplify(this.ptdata)
    let string = 'M'

    for (const pt of ptData) {
      string += Math.round(pt.x) + ' ' + Math.round(pt.y) + 'L'
    }

    string = string.slice(0, -1)
    paths[paths.length - 1] = this.preRenderString(string)
    this.pathsToReturn.push(string)
    this.setState({paths})
    this.props.onPathAdded(string)
  }

  preRenderString(string) {
    return <Path key={++this.stringKey} d={string} fill="none" stroke="#000" strokeWidth={this.strokeWidth} />
  }

  render() {
    const { width, height } = this.props

    return (
      <View
        style={[{width, height}, this.props.style]}
        renderToHardwareTextureAndroid={true}
        {...this.panResponder.panHandlers}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          { this.state.paths }
        </Svg>
      </View>
    )
  }
}

// to suit your point format, run search/replace for '.x' and '.y'
// for 3D version, see 3d branch (configurability would draw significant performance overhead)

// square distance between 2 points
function getSqDist(p1, p2) {
  const dx = p1.x - p2.x, dy = p1.y - p2.y
  return dx * dx + dy * dy
}

// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {

  let x = p1.x,
    y = p1.y,
    dx = p2.x - x,
    dy = p2.y - y

  if (dx !== 0 || dy !== 0) {

    const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy)

    if (t > 1) {
      x = p2.x
      y = p2.y

    } else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }

  dx = p.x - x
  dy = p.y - y

  return dx * dx + dy * dy
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points, sqTolerance) {

  let prevPoint = points[0],
    newPoints = [prevPoint],
    point

  for (let i = 1, len = points.length; i < len; i++) {
    point = points[i]

    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point)
      prevPoint = point
    }
  }

  if (prevPoint !== point) newPoints.push(point)

  return newPoints
}

// simplification using optimized Douglas-Peucker algorithm with recursion elimination
function simplifyDouglasPeucker(points, sqTolerance) {

  let len = points.length,
    MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
    markers = new MarkerArray(len),
    first = 0,
    last = len - 1,
    stack = [],
    newPoints = [],
    i, maxSqDist, sqDist, index

  markers[first] = markers[last] = 1

  while (last) {

    maxSqDist = 0

    for (i = first + 1; i < last; i++) {
      sqDist = getSqSegDist(points[i], points[first], points[last])

      if (sqDist > maxSqDist) {
        index = i
        maxSqDist = sqDist
      }
    }

    if (maxSqDist > sqTolerance) {
      markers[index] = 1
      stack.push(first, index, index, last)
    }

    last = stack.pop()
    first = stack.pop()
  }

  for (i = 0; i < len; i++) {
    if (markers[i]) newPoints.push(points[i])
  }

  return newPoints
}

// both algorithms combined for awesome performance
function simplify(points, tolerance, highestQuality) {

  if (points.length <= 1) return points

  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1

  points = highestQuality ? points : simplifyRadialDist(points, sqTolerance)
  points = simplifyDouglasPeucker(points, sqTolerance)

  return points
}
