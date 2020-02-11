const testUtils = require('../testUtils.js')
const ObjectStatus = require('../../src/Events/ObjectStatus.js')
const ObjectProperties = require('../../src/Events/ObjectProperties.js')

test('should release objects', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    const objectStatus = new ObjectStatus()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)
    await client.events.book(event.key, ['A-1', 'A-2'])

    const releaseRes = await client.events.release(event.key, ['A-1', 'A-2'])

    const status1 = await client.events.retrieveObjectStatus(event.key, 'A-1')
    const status2 = await client.events.retrieveObjectStatus(event.key, 'A-2')
    expect(status1.status).toBe(objectStatus.FREE)
    expect(status2.status).toBe(objectStatus.FREE)
    expect(Object.keys(releaseRes.objects)).toEqual(['A-1', 'A-2'])
})

test('should release objects with hold tokens', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    const objectStatus = new ObjectStatus()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)
    const holdToken = await client.holdTokens.create()
    await client.events.hold(event.key, 'A-1', holdToken.holdToken)

    await client.events.release(event.key, 'A-1', holdToken.holdToken)

    const objStatus = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(objStatus.status).toBe(objectStatus.FREE)
    expect(objStatus.holdToken).toBeFalsy()
})

test('should release objects with order id', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    const objectStatus = new ObjectStatus()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)
    await client.events.book(event.key, 'A-1')

    await client.events.release(event.key, 'A-1', null, 'order1')

    const objStatus = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(objStatus.status).toBe(objectStatus.FREE)
    expect(objStatus.orderId).toBe('order1')
})

test('should keep extra data', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)
    await client.events.book(event.key, [new ObjectProperties('A-1').setExtraData({ foo: 'bar' })])

    await client.events.release(event.key, ['A-1'], null, null, true)

    const status = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(status.extraData).toEqual({ foo: 'bar' })
})
