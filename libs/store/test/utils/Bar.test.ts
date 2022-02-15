import {Bar} from "@libs/store/utils/Bar";

describe("Bar", () => {
	it("should pass valid operations", () => {
		Bar().should.be.equal("Hello Foo from Bar");
	});

});
