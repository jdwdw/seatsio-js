const testUtils = require('../testUtils.js')
const ObjectStatus = require('../../src/Events/ObjectStatus.js')
const ObjectProperties = require('../../src/Events/ObjectProperties.js')

test('should change object status', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)

    const result = await client.events.changeObjectStatus(event.key, 'A-1', 'lolzor')

    expect(result.objects).toEqual({
        'A-1': {
            categoryKey: '9',
            categoryLabel: 'Cat1',
            forSale: true,
            label: 'A-1',
            labels: { own: { label: '1', type: 'seat' }, parent: { label: 'A', type: 'row' } },
            objectType: 'seat',
            status: 'lolzor',
            isAccessible: false,
            hasRestrictedView: false,
            isCompanionSeat: false
        }
    })
})

test('should change object status for table seat', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChartWithTables(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)

    const result = await client.events.changeObjectStatus(event.key, 'T1-1', 'lolzor')

    expect(Object.keys(result.objects)).toEqual(['T1-1'])
})

test('should change object status for table', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChartWithTables(chartKey, user.secretKey)
    const event = await client.events.create(chartKey, null, true)

    const result = await client.events.changeObjectStatus(event.key, 'T1', 'lolzor')

    expect(Object.keys(result.objects)).toEqual(['T1'])
})

test('should change object status with GA', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)

    const result = await client.events.changeObjectStatus(event.key, '34', 'lolzor')

    expect(Object.keys(result.objects)).toEqual(['34'])
})

test('should change object status with GA and quantity', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)

    const result = await client.events.changeObjectStatus(event.key, {
        objectId: 'GA1',
        quantity: 100
    }, 'myCustomStatus')

    const retrievedStatus = await client.events.retrieveObjectStatus(event.key, 'GA1')
    expect(Object.keys(result.objects)).toEqual(['GA1'])
    expect(retrievedStatus.quantity).toBe(100)
    expect(retrievedStatus.status).toBe('myCustomStatus')
})

test('should change object status with objectId as string', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)

    await client.events.changeObjectStatus(event.key, 'A-1', 'lolzor')

    const objStatus = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(objStatus.status).toBe('lolzor')
})

test('should change object status with objectId inside class', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)

    await client.events.changeObjectStatus(event.key, new ObjectProperties('A-1'), 'lolzor')

    const objStatus = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(objStatus.status).toBe('lolzor')
})

test('should change object status with hold token', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    const objectStatus = new ObjectStatus()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)
    const holdToken = await client.holdTokens.create()

    await client.events.changeObjectStatus(event.key, 'A-1', objectStatus.HELD, holdToken.holdToken)

    const objStatus = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(objStatus.status).toBe(objectStatus.HELD)
    expect(objStatus.holdToken).toBe(holdToken.holdToken)
})

test('should change object status with OrderId', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)

    await client.events.changeObjectStatus(event.key, 'A-1', 'lolzor', null, 'order1')

    const objStatus = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(objStatus.orderId).toBe('order1')
})

test('should respect keepExtraData=true', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)
    await client.events.updateExtraData(event.key, 'A-1', { foo: 'bar' })

    await client.events.changeObjectStatus(event.key, ['A-1'], 'someStatus', null, null, true)

    const status = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(status.extraData).toEqual({ foo: 'bar' })
})

test('should respect keepExtraData=false', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)
    await client.events.updateExtraData(event.key, 'A-1', { foo: 'bar' })

    await client.events.changeObjectStatus(event.key, ['A-1'], 'someStatus', null, null, false)

    const status = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(status.extraData).toBeFalsy()
})

test('should respect no keepExtraData', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const chartKey = testUtils.getChartKey()
    await testUtils.createTestChart(chartKey, user.secretKey)
    const event = await client.events.create(chartKey)
    await client.events.updateExtraData(event.key, 'A-1', { foo: 'bar' })

    await client.events.changeObjectStatus(event.key, ['A-1'], 'someStatus', null, null, false)

    const status = await client.events.retrieveObjectStatus(event.key, 'A-1')
    expect(status.extraData).toBeFalsy()
})
