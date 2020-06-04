const ForSaleConfig = require('./ForSaleConfig.js')

class Event {
    /**
     * @param {object} event
     */
    constructor (event) {
        this.id = event.id
        this.key = event.key
        this.bookWholeTables = event.bookWholeTables
        this.supportsBestAvailable = event.supportsBestAvailable
        this.forSaleConfig = event.forSaleConfig ? new ForSaleConfig(event.forSaleConfig.forSale, event.forSaleConfig.objects, event.forSaleConfig.categories) : null
        this.tableBookingModes = event.tableBookingModes
        this.chartKey = event.chartKey
        this.createdOn = event.createdOn ? new Date(event.createdOn) : null
        this.updatedOn = event.updatedOn ? new Date(event.updatedOn) : null
        this.channels = event.channels
    }
}

module.exports = Event
