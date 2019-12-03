test('should list workspaces in first page', async () => {
    await client.workspaces.create('')
    const ws2 = await client.workspaces.create('')
    const ws3 = await client.workspaces.create('')

    const page = await client.workspaces.listFirstPage(null, 2)

    expect(page.items.map(workspace => workspace.id)).toEqual([ws3.id, ws2.id])
})

test('should filter workspaces in first page', async () => {
    const ws1 = await client.workspaces.create('foo')
    await client.workspaces.create('bar')
    const ws3 = await client.workspaces.create('foo')

    const page = await client.workspaces.listFirstPage('fo', 2)

    expect(page.items.map(workspace => workspace.id)).toEqual([ws3.id, ws1.id])
})
