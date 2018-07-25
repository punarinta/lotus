import cfg from 'config/app'
import { store } from 'core'

const RTC_EXCHANGE = 'RTC_EXCHANGE'

class FcmSvc {

  static async send(to, message, title = null, data = null) {

    let json = {
      content_available: true,
      to: '/topics/topic-' + to,
      priority: 'high',
      collapse_key: 'lotus',
    }

    if (message !== null) {
      json.notification = {
        title: title,
        body: message,
        sound: 'default',

        // Android only
        android_channel_id: 'lotus',
      }
    }

    if (data !== null) {
      json.data = {
        payload: data,
      }
    }

    const fetchConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=' + cfg.fcm.key,
      },
      method: 'POST',
      body: JSON.stringify(json)
    }

    const request = await fetch('https://fcm.googleapis.com/fcm/send', fetchConfig)

    if (!request.ok) {
      console.log('ERROR (req.ok != true)', request.status, await request.text(), data )
      return null
    } else {
      console.log('OK', await request.json())
    }
  }

  static async sendRtc(to, data) {
    data.sessionId = $.sessionId
    await FcmSvc.send(to, null, null, data)
  }

  /**
   * Receive a data-only message
   *
   * @param message
   * @returns {Promise<void>}
   */
  static async receive(message) {

    console.log('Message received')

    // data-only messages on foreground
    let json = {sessionId: $.sessionId}
    try {
      json = JSON.parse(message._data.payload)
    } catch (e) {
      console.log('ERR', message._data)
    }

    if (json.sessionId === $.sessionId) {
      // console.log('OWN MESSAGE')
      return
    }

    switch (json.cmd) {
      case 'call':
        $.navigator.navigate('Video', { sdp: json.sdp })
        break

      case 'acceptCall':
        store.emit(RTC_EXCHANGE, json)
        break

      case 'rtc-exchange':
        store.emit(RTC_EXCHANGE, json)
        break

      default:
        console.log('FcmSvc.receive(): ', message._data)
    }
  }
}

export { FcmSvc, RTC_EXCHANGE }
