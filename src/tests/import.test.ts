import { email } from "../index"


beforeAll(async () => {
})

afterAll(async () => {
})


test("import", async () => {
	console.log( email.Actions.SEND )
	expect( email.Actions ).not.toBeNull()
})
