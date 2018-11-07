const testUtils = require('../testUtils.js');

test('should add tag', async () => {
    var chart = await client.charts.create();
    await client.charts.addTag(chart.key, 'tag1');

    var retrievedChart = await client.charts.retrieve(chart.key);

    expect(retrievedChart.key).toBe(chart.key);
    expect(retrievedChart.tags).toEqual(['tag1']);
});

test('should be able to add a tag with special characters', async () => {
    var chart = await client.charts.create();

    await client.charts.addTag(chart.key, 'tag1/:"-<>');
    var retrievedChart = await client.charts.retrieve(chart.key);

    expect(retrievedChart.tags).toEqual(['tag1/:"-<>']);
});
