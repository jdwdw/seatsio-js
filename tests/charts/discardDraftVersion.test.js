const testUtils = require('../testUtils.js');

test('should discard draft version of the chart', async () => {
    var chart = await client.charts.create('oldName');
    await client.events.create(chart.key);
    await client.charts.update(chart.key, 'newName');

    await client.charts.discardDraftVersion(chart.key);
    var retrievedChart = await client.charts.retrieve(chart.key);

    expect(retrievedChart.status).toEqual('PUBLISHED');
    expect(retrievedChart.name).toEqual('oldName');
});
