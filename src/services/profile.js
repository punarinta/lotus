import store from 'core/store'
import PropTypes from 'prop-types'

class ProfileSvc {

  static schema = {
    ver: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    lastSync: PropTypes.instanceOf(Date).isRequired,

    emails: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    ava: PropTypes.instanceOf(Uint8Array),
    lastSeen: PropTypes.instanceOf(Date),
  }

  /**
   * Returns a user profile
   *
   * @param id
   * @returns {*|null}
   */
  static get(id) {
    return $.phonebook[id] || null
  }

  /**
   * Explicitly sets a profile for a user
   *
   * @param id
   * @param info
   */
  static set(id, info) {
    $.phonebook[id] = info
    store.sync()
  }

  /**
   * Updates a user profile keeping old records
   *
   * @param id
   * @param info
   * @returns {*}
   */
  static update(id, info) {
    if ($.phonebook[id] && Object.is($.phonebook[id])) {
      $.phonebook[id] = Object.assign($.phonebook[id], info)
    }

    ProfileSvc.set(id, $.phonebook[id])

    return $.phonebook[id]
  }
}

export { ProfileSvc }
