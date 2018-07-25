import { store } from 'core'
import I18n from 'i18n'

const MBOX_OPEN = 'MBOX_OPEN'

class SysSvc {

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
}

export { SysSvc, MBOX_OPEN }