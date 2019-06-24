class HoldToken {
    /**
   * @param {object} holdToken
   */
    constructor (holdToken) {
        this.holdToken = holdToken.holdToken
        this.expiresAt = new Date(holdToken.expiresAt)
        this.expiresInSeconds = holdToken.expiresInSeconds
    }
}

module.exports = HoldToken
