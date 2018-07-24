import cfg from 'config/app'

class FcmSvc {

  static async send(to, message, title = '', data = null) {

    const fetchConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=' + cfg.fcm.key,
      },
      method: 'POST',
      body: JSON.stringify({
        data: {
          payload: data,
        },
        content_available: true,
        to: '/topics/topic-' + to,
        priority: 'high',
        collapse_key: 'lotus',
        notification: {
          'title': title,
          'body': message,
          'sound': 'default',
        }
      })
    }

    const request = await fetch('https://fcm.googleapis.com/fcm/send', fetchConfig)

    if (!request.ok) {
      console.log('ERROR (req.ok != true)', request.status, await request.text(), data )
      return null
    } else {
      console.log('OK', await request.json())
    }
  }
}

export { FcmSvc }
