const testUtils = require('../testUtils.js')

test('listAll subaccounts when there are more than 10 subaccounts', async () => {
    const { client, user } = await testUtils.createTestUserAndClient()
    const subaccounts = await testUtils.createArray(15, () => client.subaccounts.create())

    const retrievedSubaccountIds = []
    for await (const subaccount of client.subaccounts.listAll()) {
        retrievedSubaccountIds.push(subaccount.id)
    }

    const subaccountIDs = subaccounts.map(s => s.id).concat(user.mainWorkspace.primaryUser.id)
    expect(retrievedSubaccountIds.sort()).toEqual(subaccountIDs.sort())
})
