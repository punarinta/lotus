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

  /**
   * Creates a nice timestamp
   *
   * @param ts
   * @returns {string}
   */
  static readableTs(ts) {

    if (!ts) {
      return I18n.t('never')
    }

    const
      td = new Date,
      nums = num => num > 9 ? num : '0' + num

    let lastSeen = new Date(ts)
    if (td.getDate() === lastSeen.getDate() && td.getMonth() === lastSeen.getMonth() && td.getFullYear() === lastSeen.getFullYear()) {
      return nums(lastSeen.getHours()) + ':' + nums(lastSeen.getMinutes())
    } else {
      return I18n.t('monthsShort')[lastSeen.getHours()] + ' ' + nums(lastSeen.getDate())
    }
  }
}

export { MessageSvc }
