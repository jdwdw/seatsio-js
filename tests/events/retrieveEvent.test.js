const testUtils = require('../testUtils.js');

test('should retrieve event', async () => {
    var chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    var event = await client.events.create(chartKey);
    var retrievedEvent = await client.events.retrieve(event.key);
    expect(retrievedEvent.key).toBe(event.key);
    expect(retrievedEvent.id).toBe(event.id);
    expect(retrievedEvent.chartKey).toBe(chartKey);
    expect(retrievedEvent.bookWholeTables).toBe(false);
    expect(retrievedEvent.supportsBestAvailable).toBe(true);
    expect(retrievedEvent.createdOn).toBe(event.createdOn);
    expect(retrievedEvent.forSaleConfig).toBeUndefined();
    expect(retrievedEvent.updatedOn).toBeUndefined();
});
