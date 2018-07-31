class PubSub {

  ws = null
  ok = false
  listeners = {}

  constructor(secure, serverPath, channelId, extra = {}) {
    this.serverPath = serverPath
    this.channelId = channelId
    this.secure = secure
    this.extra = extra
  }

  async init() {

    return new Promise((resolve) => {
      const ws = new WebSocket((this.secure ? 'wss://' : 'ws://') + this.serverPath + 'lotus/sub/' + this.channelId)

      ws.onopen = () => {
        this.ok = true
        resolve(true)
      }

      ws.onmessage = (e) => {
        //console.log('Incoming msg:', e.data)

        try {
          let json = JSON.parse(e.data)

          if (!Array.isArray(json) || json.length !== 4) {
            //console.log('Wrong format')
            return
          }

          if (json[1] === $.sessionId) {
            //console.log('Message from myself')
            return
          }

          if (json[0] !== null && json[0] !== $.sessionId) {
            //console.log('Message to someone else')
            return
          }

          if (this.listeners[json[2]]) {
            // enhance with 'from' info
            json[3].rtcFrom = json[1]
            this.listeners[json[2]](json[3])
          }
        } catch (e) {
          // console.log('WS message error', e)
        }
      }

      ws.onerror = (e) => {
        console.log('Socket error', e.message)
      }

      ws.onclose = (e) => {
        console.log('Socket closed', e.code, e.reason)
        if (!this.ok) {
          resolve(false)
        } else {
          if ([1009].includes(e.code)) {
            if (this.extra.onSuggestedReopening) {
              this.extra.onSuggestedReopening(e.code)
            }
          }
        }
        this.ok = false
      }

      this.ws = ws
    })
  }

  on(event, callback) {
    this.listeners[event] = callback
  }

  async emit(to, event, payload, wait = false) {

    const json = [to, $.sessionId, event, payload]

    let cfg = {
      headers: {
        'Accept': 'text/json'
      },
      method: 'POST',
      body: JSON.stringify(json)
    }

    if (wait) {
      const request = await fetch((this.secure ? 'https' : 'http') + '://' + this.serverPath + 'lotus/pub/' + this.channelId, cfg)

      if (!request.ok) {
        console.log('ERROR (req.ok != true)', request.status, await request.text(), data )
      }
    } else {
      // TODO: add when supported by RN
      // const controller = new AbortController()
      // cfg.signal = controller.signal
      fetch((this.secure ? 'https' : 'http') + '://' + this.serverPath + 'lotus/pub/' + this.channelId, cfg)
      // controller.abort()
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
