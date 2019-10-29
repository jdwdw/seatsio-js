const testUtils = require('../testUtils.js')
const ObjectStatus = require('../../src/Events/ObjectStatus.js')

test('should retrieve object status', async () => {
    let chartKey = testUtils.getChartKey()
    let ObjStatus = new ObjectStatus()
    await testUtils.createTestChart(chartKey, user.secretKey)
    let event = await client.events.create(chartKey)

    let retrievedObj = await client.events.retrieveObjectStatus(event.key, 'A-1')

    expect(retrievedObj.status).toEqual(ObjStatus.FREE)
    expect(retrievedObj.ticketType).toBeFalsy()
    expect(retrievedObj.extraData).toBeFalsy()
    expect(retrievedObj.forSale).toBe(true)
})
