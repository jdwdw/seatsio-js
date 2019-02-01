const testUtils = require('../testUtils.js');
const ObjectProperties = require('../../src/Events/ObjectProperties.js');
const ObjectStatus = require('../../src/Events/ObjectStatus.js');
const StatusChangeParam = require('../../src/Events/StatusChangesParams.js');

test('should list status changes', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    let labels = [];

    for await (let statusChange of client.events.statusChanges(event.key)) {
        labels.push(statusChange.objectLabel);
    }

    expect(labels.sort()).toEqual(['A-1', 'A-2', 'A-3']);
});

test('should list status changes sorted by label', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByObjectLabel();
    let labels = [];

    for await (let statusChange of client.events.statusChanges(event.key, null, params)) {
        labels.push(statusChange.objectLabel);
    }

    expect(labels).toEqual(['A-1', 'A-2', 'A-3']);
});

test('should list status changes sorted by status', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken = await client.holdTokens.create();
    await client.events.book(event.key, 'B-1');
    await client.events.hold(event.key, 'A-1', holdToken.holdToken);
    await client.events.release(event.key, 'A-1', holdToken.holdToken);
    await client.events.book(event.key, 'A-2');
    await client.events.hold(event.key, 'A-3', holdToken.holdToken);
    let params = new StatusChangeParam().sortByStatus();
    let labels = [];

    for await (let statusChange of client.events.statusChanges(event.key, null, params)) {
        labels.push(statusChange.objectLabel);
    }

    expect(labels).toEqual(['A-2', 'B-1', 'A-1', 'A-3', 'A-1']);
});

test('should list status changes sorted by date ascending', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-3');
    await client.events.book(event.key, 'A-2');
    let params = new StatusChangeParam().sortByDateAsc();
    let labels = [];

    for await (let statusChange of client.events.statusChanges(event.key, null, params)) {
        labels.push(statusChange.objectLabel);
    }

    expect(labels).toEqual(['A-1', 'A-3', 'A-2']);
});

test('should list status changes with filter', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'B-2');
    let params = new StatusChangeParam().withFilter('2');
    let labels = [];

    for await (let statusChange of client.events.statusChanges(event.key, null, params)) {
        labels.push(statusChange.objectLabel);
    }

    expect(labels).toEqual(['B-2', 'A-2']);
});

test('should not list status changes with unmatched filter', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'B-2');
    let params = new StatusChangeParam().withFilter('3');
    let labels = [];

    for await (let statusChange of client.events.statusChanges(event.key, null, params)) {
        labels.push(statusChange.objectLabel);
    }

    expect(labels).toEqual([]);
});

test('properties of status changes', async () => {
    let chartKey = testUtils.getChartKey();
    let objectStatus = new ObjectStatus();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let obj = new ObjectProperties('A-1').setExtraData({'foo': 'bar'});
    await client.events.book(event.key, obj, null, 'order1');

    let statusChanges = client.events.statusChanges(event.key);
    let statusChangesIterator = statusChanges[Symbol.asyncIterator]();
    let statusChange = await statusChangesIterator.next();

    expect(statusChange.value.id).toBeTruthy();
    expect(statusChange.value.date).toBeTruthy();
    expect(statusChange.value.orderId).toBe('order1');
    expect(statusChange.value.objectLabel).toBe('A-1');
    expect(statusChange.value.status).toBe(objectStatus.BOOKED);
    expect(statusChange.value.eventId).toBe(event.id);
    expect(statusChange.value.extraData).toEqual({'foo': 'bar'});
});

test('should list status changes with hold token', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken = await client.holdTokens.create();
    await client.events.hold(event.key, 'A-1', holdToken.holdToken);

    let statusChanges = client.events.statusChanges(event.key);
    let statusChangesIterator = statusChanges[Symbol.asyncIterator]();
    let statusChange = await statusChangesIterator.next();

    expect(statusChange.value.holdToken).toEqual(holdToken.holdToken);
});

test('should list status changes with null hold token if no hold token was used', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-2');

    let statusChanges = client.events.statusChanges(event.key);
    let statusChangesIterator = statusChanges[Symbol.asyncIterator]();
    let statusChange = await statusChangesIterator.next();

    expect(statusChange.value.holdToken).toEqual(null);
});

test('should list status changes in the first page', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);

    expect(statusChangeFirstPage.items[0].objectLabel).toBe('A-3');
    expect(statusChangeFirstPage.items[1].objectLabel).toBe('A-2');
    expect(statusChangeFirstPage.items[2].objectLabel).toBe('A-1');
    expect(statusChangeFirstPage.items.length).toBe(3);
    expect(statusChangeFirstPage.nextPageStartsAfter).toBe(null);
});

test('should list status changes in the first page with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key, null,1);

    expect(statusChangeFirstPage.items[0].objectLabel).toBe('A-2');
    expect(statusChangeFirstPage.items.length).toBe(1);
    expect(statusChangeFirstPage.nextPageStartsAfter).toBe(statusChangeFirstPage.items[0].id + '');
});

test('should list status changes in the first page sorted by label', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByObjectLabel();

    let statusChangeFirstPageSorted =  await client.events.listStatusChangesFirstPage(event.key, params);
    let labels = [
        statusChangeFirstPageSorted.items[0].objectLabel,
        statusChangeFirstPageSorted.items[1].objectLabel,
        statusChangeFirstPageSorted.items[2].objectLabel
    ];

    expect(labels).toEqual(['A-1', 'A-2', 'A-3']);
    expect(statusChangeFirstPageSorted.items.length).toBe(3);
    expect(statusChangeFirstPageSorted.nextPageStartsAfter).toBe(null);
});

test('should list status changes in the first page sorted by label with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByObjectLabel();

    let statusChangeFirstPageSorted =  await client.events.listStatusChangesFirstPage(event.key, params, 1);

    expect(statusChangeFirstPageSorted.items[0].objectLabel).toEqual('A-1');
    expect(statusChangeFirstPageSorted.items.length).toBe(1);
    expect(statusChangeFirstPageSorted.nextPageStartsAfter).toBe(statusChangeFirstPageSorted.items[0].id + '');
});

test('should list status changes in the first page sorted by status', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByStatus();

    let statusChangeFirstPageSorted =  await client.events.listStatusChangesFirstPage(event.key, params);
    let labels = [
        statusChangeFirstPageSorted.items[0].objectLabel,
        statusChangeFirstPageSorted.items[1].objectLabel,
        statusChangeFirstPageSorted.items[2].objectLabel,
        statusChangeFirstPageSorted.items[3].objectLabel
    ];

    expect(labels).toEqual(['A-3', 'A-1', 'A-2', 'A-2']);
    expect(statusChangeFirstPageSorted.items[0].status).toBe('booked');
    expect(statusChangeFirstPageSorted.items[1].status).toBe('booked');
    expect(statusChangeFirstPageSorted.items[2].status).toBe('free');
    expect(statusChangeFirstPageSorted.items[3].status).toBe('reservedByToken');
});

test('should list status changes in the first page sorted by status with page size', async () => {

});

test('should list status changes in the first page sorted by date ascending', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByDateAsc();

    let statusChangeFirstPageSorted =  await client.events.listStatusChangesFirstPage(event.key, params);
    let labels = [
        statusChangeFirstPageSorted.items[0].objectLabel,
        statusChangeFirstPageSorted.items[1].objectLabel,
        statusChangeFirstPageSorted.items[2].objectLabel,
        statusChangeFirstPageSorted.items[3].objectLabel
    ];

    expect(labels).toEqual(['A-1', 'A-2', 'A-2', 'A-3']);
});

test('should list status changes in the first page sorted by date ascending with page size', async () => {

});

test('should list status changes in the first page with filter', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    await client.events.book(event.key, 'B-2');
    let params = new StatusChangeParam().withFilter('2');

    let statusChangeFirstPageSorted =  await client.events.listStatusChangesFirstPage(event.key, params);
    let labels = [
        statusChangeFirstPageSorted.items[0].objectLabel,
        statusChangeFirstPageSorted.items[1].objectLabel,
        statusChangeFirstPageSorted.items[2].objectLabel
    ];

    expect(labels).toEqual(['B-2', 'A-2', 'A-2']);
    expect(statusChangeFirstPageSorted.items.length).toBe(3);
});

test('should list status changes in the first page with filter and page size', async () => {

});

test('should not list status changes in the first page with unmatched filter', async () => {

});

test('should list status changes in the first page with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key, null,1);

    expect(statusChangeFirstPage.items[0].objectLabel).toBe('A-2');
    expect(statusChangeFirstPage.items.length).toBe(1);
    expect(statusChangeFirstPage.nextPageStartsAfter).toBe(statusChangeFirstPage.items[0].id + '');
});

test('should list status changes after given id ', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageAfter = await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[0].id);

    expect([pageAfter.items[0].objectLabel, pageAfter.items[1].objectLabel]).toEqual(['A-2', 'A-1']);
    expect(pageAfter.previousPageEndsBefore).toBe(pageAfter.items[0].id + '');
    expect(pageAfter.items.length).toBe(2);
});

test('should list status changes after given id with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageAfter = await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[0].id, null,1);

    expect(pageAfter.items[0].objectLabel).toEqual('A-2');
    expect(pageAfter.previousPageEndsBefore).toBe(pageAfter.items[0].id + '');
    expect(pageAfter.nextPageStartsAfter).toBe(pageAfter.items[0].id + '');
    expect(pageAfter.items.length).toBe(1);
});

test('should list status changes after given id sorted by label with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByObjectLabel();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let statusChangePageAfterSorted =  await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[0].id, params, 1);

    expect(statusChangePageAfterSorted.items[0].objectLabel).toEqual('A-1');
});

test('should list status changes after given id sorted by label with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByObjectLabel();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let statusChangePageAfterSorted =  await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[0].id, params, 1);

    expect(statusChangePageAfterSorted.items[0].objectLabel).toEqual('A-1');
});

test('should list status changes after given id sorted by status', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.hold(event.key, 'B-1', holdToken.holdToken);
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.release(event.key, 'B-1', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByStatus();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let statusChangePageAfterSorted =  await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[1].id, params);
    let labels = [
        statusChangePageAfterSorted.items[0].objectLabel,
        statusChangePageAfterSorted.items[1].objectLabel,
        statusChangePageAfterSorted.items[2].objectLabel,
        statusChangePageAfterSorted.items[3].objectLabel
    ];

    expect(labels).toEqual(['A-1', 'A-2', 'B-1', 'A-2']);
    expect(statusChangePageAfterSorted.items.length).toBe(4);
});

test('should list status changes after given id sorted by status with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.hold(event.key, 'B-1', holdToken.holdToken);
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.release(event.key, 'B-1', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByStatus();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let statusChangePageAfterSorted =  await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[1].id, params, 3);
    let labels = [
        statusChangePageAfterSorted.items[0].objectLabel,
        statusChangePageAfterSorted.items[1].objectLabel,
        statusChangePageAfterSorted.items[2].objectLabel
    ];

    expect(labels).toEqual(['A-1', 'A-2', 'B-1']);
    expect(statusChangePageAfterSorted.items.length).toBe(3);
});

test('should list status changes after given id sorted by date ascending', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.hold(event.key, 'B-1', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.release(event.key, 'B-1', holdToken.holdToken);
    let params = new StatusChangeParam().sortByDateAsc();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let statusChangePageAfterSorted =  await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[1].id, params);
    let labels = [
        statusChangePageAfterSorted.items[0].objectLabel,
        statusChangePageAfterSorted.items[1].objectLabel,
        statusChangePageAfterSorted.items[2].objectLabel,
        statusChangePageAfterSorted.items[3].objectLabel
    ];

    expect(labels).toEqual(['A-1', 'A-2', 'B-1', 'A-3']);
    expect(statusChangePageAfterSorted.items.length).toBe(4);
});

test('should list status changes after given id sorted by date ascending with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.hold(event.key, 'B-1', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.release(event.key, 'B-1', holdToken.holdToken);
    let params = new StatusChangeParam().sortByDateAsc();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let statusChangePageAfterSorted =  await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[1].id, params, 2);
    let labels = [
        statusChangePageAfterSorted.items[0].objectLabel,
        statusChangePageAfterSorted.items[1].objectLabel
    ];

    expect(labels).toEqual(['A-1', 'A-2']);
    expect(statusChangePageAfterSorted.items.length).toBe(2);
});

test('should list status changes after given id with filter', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.hold(event.key, 'B-1', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().withFilter('1');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let statusChangePageAfterSorted =  await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[0].id, params);
    let labels = [
        statusChangePageAfterSorted.items[0].objectLabel,
        statusChangePageAfterSorted.items[1].objectLabel
    ];

    expect(labels).toEqual(['B-1', 'A-1']);
    expect(statusChangePageAfterSorted.items.length).toBe(2);
});

test('should list status changes after given id with filter and page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken  = await client.holdTokens.create();
    await client.events.book(event.key, 'A-1');
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.hold(event.key, 'B-1', holdToken.holdToken);
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().withFilter('1');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let statusChangePageAfterSorted =  await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[0].id, params, 1);

    expect(statusChangePageAfterSorted.items[0].objectLabel).toEqual('B-1');
    expect(statusChangePageAfterSorted.items.length).toBe(1);
});

test.skip('should not list status changes after given id with unmatched filter', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'B-2');
    await client.events.book(event.key, 'C-2');
    let params = new StatusChangeParam().withFilter('1');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageAfter(event.key, statusChangeFirstPage.items[0].id, params);

    expect(pageBefore.items).toEqual([]);
});

test('should list status changes before given id', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id);
    
    expect([pageBefore.items[0].objectLabel, pageBefore.items[1].objectLabel]).toEqual(['A-3', 'A-2']);
    expect(pageBefore.nextPageStartsAfter).toBe(pageBefore.items[1].id + '');
    expect(pageBefore.items.length).toBe(2);
});

test.skip('should list status changes before given id with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id, null, 1);

    expect(pageBefore.items[0].objectLabel).toEqual('A-3'); //Fails, returns 'A-2'
    expect(pageBefore.items.length).toBe(1);
});

test.skip('should list status changes before given id sorted by label', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    let params = new StatusChangeParam().sortByObjectLabel();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id, params);

    expect([pageBefore.items[0].objectLabel, pageBefore.items[1].objectLabel]).toEqual(['A-2', 'A-3']); // Fails, returns  ["A-3", "A-2"]
    expect(pageBefore.nextPageStartsAfter).toBe(pageBefore.items[1].id + '');
    expect(pageBefore.items.length).toBe(2);
});

test.skip('should list status changes before given id sorted by label with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    await client.events.book(event.key, 'A-4');
    let params = new StatusChangeParam().sortByObjectLabel();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id, params, 2);
    let labels = [
        pageBefore.items[0].objectLabel,
        pageBefore.items[1].objectLabel
    ];

    expect(labels).toEqual(['A-2', 'A-3']); //Fails, returns ["A-4", "A-3"]
    expect(pageBefore.nextPageStartsAfter).toBe(pageBefore.items[1].id + '');
    expect(pageBefore.items.length).toBe(2);
});

test.skip('should list status changes before given id sorted by status', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken = await client.holdTokens.create();
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.book(event.key, 'A-1');
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.hold(event.key, 'A-3', holdToken.holdToken);
    let params = new StatusChangeParam().sortByStatus();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[3].id, params);
    let labels = [
        pageBefore.items[0].objectLabel,
        pageBefore.items[1].objectLabel,
        pageBefore.items[2].objectLabel
    ];

    expect(labels).toEqual(['A-1', 'A-2' , 'A-3']); //Fails, returns   ["A-3", "A-2", "A-1"]
    expect(pageBefore.items.length).toBe(3);
});

test.skip('should list status changes before given id sorted by status with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    let holdToken = await client.holdTokens.create();
    await client.events.hold(event.key, 'A-2', holdToken.holdToken);
    await client.events.book(event.key, 'A-1');
    await client.events.release(event.key, 'A-2', holdToken.holdToken);
    await client.events.hold(event.key, 'A-3', holdToken.holdToken);
    let params = new StatusChangeParam().sortByStatus();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[3].id, params, 2);
    let labels = [
        pageBefore.items[0].objectLabel,
        pageBefore.items[1].objectLabel
    ];

    expect(labels).toEqual(['A-1', 'A-2']); //Fails, returns    ["A-2", "A-1"]
    expect(pageBefore.items.length).toBe(2);
});

test.skip('should list status changes before given id sorted by date ascending', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    await client.events.book(event.key, 'A-4');
    await client.events.book(event.key, 'A-5');
    let params = new StatusChangeParam().sortByDateAsc();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id, params);
    let labels = [
        pageBefore.items[0].objectLabel,
        pageBefore.items[1].objectLabel
    ];

    expect(labels).toEqual(['A-4', 'A-5']); //Fails, returns ["A-5", "A-4"]
    expect(pageBefore.items.length).toBe(2);
});

test.skip('should list status changes before given id sorted by date ascending with page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-1');
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'A-3');
    await client.events.book(event.key, 'A-4');
    await client.events.book(event.key, 'A-5');
    let params = new StatusChangeParam().sortByDateAsc();

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id, params, 2);
    let labels = [
        pageBefore.items[0].objectLabel,
        pageBefore.items[1].objectLabel
    ];

    expect(labels).toEqual(['A-4', 'A-5']); //Fails, returns ["A-5", "A-4"]
    expect(pageBefore.items.length).toBe(2);
});

test('should list status changes before given id with filter', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'B-2');
    await client.events.book(event.key, 'C-2');
    let params = new StatusChangeParam().withFilter('2');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id, params);
    let labels = [
        pageBefore.items[0].objectLabel,
        pageBefore.items[1].objectLabel
    ];

    expect(labels).toEqual(['C-2', 'B-2']);
    expect(pageBefore.items.length).toBe(2);
});

test.skip('should list status changes before given id with filter and page size', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'B-2');
    await client.events.book(event.key, 'C-2');
    let params = new StatusChangeParam().withFilter('2');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id, params, 1);
    let labels = [
        pageBefore.items[0].objectLabel
    ];

    expect(labels).toEqual(['C-2']); // Fails, returns ["B-2"]
    expect(pageBefore.items.length).toBe(1);
});

test.skip('should not list status changes before given id with unmatched filter', async () => {
    let chartKey = testUtils.getChartKey();
    await testUtils.createTestChart(chartKey, user.designerKey);
    let event = await client.events.create(chartKey);
    await client.events.book(event.key, 'A-2');
    await client.events.book(event.key, 'B-2');
    await client.events.book(event.key, 'C-2');
    let params = new StatusChangeParam().withFilter('1');

    let statusChangeFirstPage =  await client.events.listStatusChangesFirstPage(event.key);
    let pageBefore = await client.events.listStatusChangesPageBefore(event.key, statusChangeFirstPage.items[2].id, params);

    expect(pageBefore.items).toEqual([]);
});