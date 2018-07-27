class PubSub {

  ok = false
  ws = null
  listeners = {}

  constructor(secure, server, path, channelId) {
    this.server = server
    this.path = path
    this.channelId = channelId
    this.secure = secure

    const ws = new WebSocket((secure ? 'wss://' : 'ws://') + server + path + '/sub/' + channelId)

    ws.onopen = () => {
      this.ok = true
    }

    ws.onmessage = (e) => {
      console.log('Incoming msg:', e.data)

      try {
        const json = JSON.parse(e.data)

        if (!Array.isArray(json) || json.length !== 4) {
          return
        }

        if (json[1] === null) {
          // broadcasting
          if (json[2] === $.sessionId) {
            return
          }
        } else {
          if (json[1] === $.sessionId) {
            return
          }
        }

        if (this.listeners[json[0]]) {
          this.listeners[json[0]](json[1])
        }
      } catch (e) {
        // console.log('WS message error', e)
      }
    }

    ws.onerror = (e) => {
      console.log('WS error', e.message)
    }

    ws.onclose = (e) => {
      console.log('Socket closed', e.code, e.reason)
      this.ok = false
    }

    this.ws = ws
  }

  on(event, callback) {
    this.listeners[event] = callback
  }

  async emit(to, event, payload) {

    const json = [to, $.sessionId, event, payload]

    const cfg = {
      headers: {
        'Accept': 'text/json'
      },
      method: 'POST',
      body: JSON.stringify(json)
    }

    const request = await fetch((this.secure ? 'https' : 'http') + '://' + this.server + this.path + '/pub/' + this.channelId, cfg)

    if (!request.ok) {
      console.log('ERROR (req.ok != true)', request.status, await request.text(), data )
    } else {
      // console.log('OK', await request.json())
    }
  }

  close() {
    if (this.ws) {
      this.ws.close()
    }
    this.ws = null
    this.ok = false
    this.listeners = {}
  }
}

export { PubSub }
