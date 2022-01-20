import Root from "../src/index"

describe("Root", () => {
    it("should pass valid operations", () => {
        Root().should.be.contains("from libs/domain/index"); //?
    });
})