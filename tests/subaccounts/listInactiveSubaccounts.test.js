const testUtils = require('../testUtils.js');

test('should list all inactive subaccounts', async () => {
    var subaccount1 = await client.subaccounts.create('I have a name.');
    var subaccount2 = await client.subaccounts.create();
    var subaccount3 = await client.subaccounts.create();
    await client.subaccounts.deactivate(subaccount1.id);
    await client.subaccounts.deactivate(subaccount2.id);
    var inactiveSubaccounts = client.subaccounts.inactive;

    var inactiveSubaccountIds = [];
    for await(let subaccountPage of inactiveSubaccounts) {
        for (let subaccount of subaccountPage) {
            inactiveSubaccountIds.push(subaccount.id);
        }
    }

    expect(inactiveSubaccountIds).toContain(subaccount1.id);
    expect(inactiveSubaccountIds).toContain(subaccount2.id);
    expect(inactiveSubaccountIds).not.toContain(subaccount3.id);

});
