import { email, RootService } from "../index"


beforeAll(async () => {
})

afterAll(async () => {
})


test("import", async () => {
	console.log(email.Actions.SEND)
	expect(email.Actions).not.toBeNull()

	console.log(RootService)
	expect(RootService).not.toBeNull()

})
