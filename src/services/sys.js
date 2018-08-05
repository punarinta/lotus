import { store } from 'core'
import I18n from 'i18n'
import { RTCPeerConnection } from 'react-native-webrtc'
import vid from 'components/vid'

const base = 1008
const MBOX_OPEN = 'MBOX_OPEN'

class SysSvc {

  static padStart(string, targetLength, padString) {
    targetLength = targetLength >> 0
    padString = String((typeof padString !== 'undefined' ? padString : ' '))
    if (string.length > targetLength) {
      return String(string)
    }
    else {
      targetLength = targetLength - string.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length)
      }
      return padString.slice(0, targetLength) + String(string)
    }
  }

  static isEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

  /**
   * @param head
   * @param text
   * @param buttons
   * @param config
   */
  static alert(head, text, buttons = null, config = null) {
    store.emit(MBOX_OPEN, {
      head: head ? head : I18n.t('mbox.self'),
      text,
      buttons,
      config
    })
  }

  /**
   * Stringify anything
   *
   * @param obj
   */
  static stringify(obj) {
    let seen = []
    JSON.stringify(obj, function(key, val) {
      if (val != null && typeof val === "object") {
        if (seen.indexOf(val) >= 0) {
          return val
        }
        seen.push(val)
      }
      return val
    })
  }

  /**
   * Converts an integer to a visual elements set
   *
   * @param int
   * @returns {{symbol: string, color: number, shape: number}[]}
   */
  static intToVisual(int) {
    if (int < vid.delta) {
      console.error('intToVisual error: int < delta')
      return null
    }
    if (int > 10**12 - 2 + vid.delta) {
      console.error('intToVisual error: int > 10^12 - 2 + delta')
      return null
    }
    let elements = []
    let string = (int - vid.delta + 1) + ''
    string = SysSvc.padStart(string, 12, '0').split('').reverse().join('')
    int = string - 0

    do elements.push(int % base)
    while (int = Math.floor(int / base))

    return elements.map(el => {
      return {
        symbol: vid.symbols[el % 36],
        color: Math.floor(el / 36) % 7,
        shape: Math.floor(el / 36 / 7) % 4,
      }
    })
  }

  /**
   * Converts a visual elements set into an integer
   *
   * @param elements
   * @returns {number}
   */
  static visualToInt(elements) {
    let int = 0, multi = 1

    elements = elements.map(el => {
      return vid.symbols.indexOf(el.symbol) + el.color * 36 + el.shape * 36 * 7
    })

    for (let el of elements) {
      int += el * multi
      multi *= base
    }

    const string = SysSvc.padStart(int + '', 12, '0').split('').reverse().join('')

    return (string - 0) + vid.delta - 1
  }

  /**
   * Pings a STUN server
   *
   * @param server
   * @param timeout
   * @returns {Promise<any>}
   */
  static pingStun(server, timeout = 3000) {
    const
      candies = [],
      ts1 = (new Date).getTime(),
      pc = new RTCPeerConnection({iceServers:[{'urls': 'stun:' + server}]})

    return Promise.race([
      new Promise(async (resolve) => {
        pc.onicecandidate = (event) => {
          candies.push(event.candidate)
        }
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') {
            const ts2 = (new Date).getTime()
            pc.close()
            resolve([0, ts2 - ts1, candies.length])
          }
        }
        const desc = await pc.createOffer({offerToReceiveAudio: 1})
        pc.setLocalDescription(desc)
      }),
      new Promise((resolve) =>
        setTimeout(() => {
          pc.close()
          resolve([1, timeout, candies.length])
        }, timeout)
      )
    ])
  }
}

export { SysSvc, MBOX_OPEN }
