const testUtils = require('../testUtils.js');

test('should retrieve draft version of a chart', async () => {
    var chart = await client.charts.create();
    await client.events.create(chart.key);
    await client.charts.update(chart.key, 'New name');
    var retrievedChart = await client.charts.retrieveDraftVersion(chart.key);
    expect(retrievedChart.name).toBe('New name');
});
