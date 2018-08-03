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
    if (!ts) return $.rooms[roomId].m
    if (!$.rooms[roomId] || !$.rooms[roomId].m) return msgs

    // console.log('A2', $.rooms, $.rooms[roomId].m.slice().reverse())

    for (const m of $.rooms[roomId].m.slice().reverse()) {
      if (m.ts > ts && m.userId === userId) {
        msgs.unshift(m)
      } else {
        break
      }
    }

    return msgs
  }
}

export { MessageSvc }
