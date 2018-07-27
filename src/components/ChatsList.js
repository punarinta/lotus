import React, { PureComponent } from 'react'
import { FlatList } from 'react-native'
import ChatRow from 'components/ChatRow'

export default class ChatsList extends PureComponent {

  static defaultProps = {
    items: [],
  }

  render() {
    return (
      <FlatList
        data={this.props.items}
        renderItem={(item) => <ChatRow {...item.item} />}
        keyExtractor={(item, index) => index + ''}
      />
    )
  }
}

