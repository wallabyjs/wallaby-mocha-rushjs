import {Foo} from "../../src/utils/Foo";

describe("Foo", () => {
	it("should pass valid operations", () => {
		Foo().should.be.equal("Hello Foo");
	});

});
