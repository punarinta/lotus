import { AsyncStorage } from 'react-native'
import { store } from 'core'
import I18n from 'i18n'

class MessageSvc {

  /**
   * @param roomId
   * @returns {Promise<void>}
   */
  static async initRoom(roomId) {
    const raw = await AsyncStorage.getItem('room:' + roomId)
    $.rooms[roomId] = raw === null ? {m:[]} : JSON.parse(raw)
  }

}

export { MessageSvc }
