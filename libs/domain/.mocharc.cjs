module.exports = {
	"node-option": [
		"experimental-specifier-resolution=node",
		"loader=esbuild-node-loader"
	],
	"require": ["./test/helpers/globalSetup.js", "chai/register-should"]
};