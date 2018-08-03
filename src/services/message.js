import { AsyncStorage } from 'react-native'
import { store } from 'core'
import I18n from 'i18n'

class MessageSvc {

  /**
   * Inits a room
   *
   * @param roomId
   * @returns {Promise<void>}
   */
  static async initRoom(roomId) {
    const raw = await AsyncStorage.getItem('room:' + roomId)
    $.rooms[roomId] = raw === null ? {m:[]} : JSON.parse(raw)
  }

  /**
   * Gets a list of messages after specified timestamp (FIFO)
   *
   * @param roomId
   * @param userId
   * @param ts
   * @returns {Array}
   */
  static getFromTs(roomId, userId, ts) {
    const msgs = []
    if (!$.rooms[roomId] || !$.rooms[roomId].m) return msgs

    for (const m of $.rooms[roomId].m.slice().reverse()) {
      if (m.ts > ts && m.userId === userId) {
        msgs.unshift(m.body)
      } else {
        break
      }
    }

    return msgs
  }
}

export { MessageSvc }
