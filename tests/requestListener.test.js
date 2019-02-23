const testUtils = require('./testUtils.js')

test('listens to successful requests', async () => {
  let client = testUtils.createClient(user.secretKey)
  let requestStartedDeferred = testUtils.deferred();
  let requestEndedDeferred = testUtils.deferred();

  client.setRequestListener(() => ({
    onRequestStarted: () => requestStartedDeferred.resolve(),
    onRequestEnded: () => requestEndedDeferred.resolve()
  }))

  await client.charts.create()
  await Promise.all([requestStartedDeferred.promise, requestEndedDeferred.promise])
})

test('listens to unsuccessful requests', async () => {
  let client = testUtils.createClient(user.secretKey)
  let requestStartedDeferred = testUtils.deferred();
  let requestEndedDeferred = testUtils.deferred();

  client.setRequestListener(() => ({
    onRequestStarted: () => requestStartedDeferred.resolve(),
    onRequestEnded: () => requestEndedDeferred.resolve()
  }))

  try {
    await client.events.create()
  } catch (e) {
    await Promise.all([requestStartedDeferred.promise, requestEndedDeferred.promise])
  }
})