process.env.INITIALIZED = false;
module.exports = function(wallaby) {
	return {
		files: [
			{ pattern: "tsconfig.json", instrument: false },
			{ pattern: "package.json", instrument: false },
			"libs/{service,domain,store}/{src,test,types}/**/!(*.+(test|spec)).{js,ts}",
			{ pattern: "!**/node_modules/**", instrument: false },
			{ pattern: ".env", instrument: false }
		],

		tests: [
			"libs/{service,domain,store}/test/**/*.+(test|spec).ts",
			"!**/node_modules/**"
		],

		testFramework: "mocha",
		filesWithNoCoverageCalculated: ["**/node_modules/**", "**/test/**/*.+(test|spec).{js,ts}"],

		env: {
			type: "node",
			params: {
				runner: "--experimental-specifier-resolution=node --loader " + require('path').join(__dirname, 'loader.mjs')
			},
			"DOTENV_CONFIG_PATH": ".env"
		},

		workers: { initial: 1, regular: 1, restart: true },
		debug: true,
		reportConsoleErrorAsError: true,
		setup: async (wallaby) => {
			process.env.projectCacheDir = 'file://' + wallaby.projectCacheDir;
			process.env.localProjectDir = 'file://' + wallaby.localProjectDir;

			const fs = require("fs");
			const path = require("path");

			symlinkNodeModules();
			symlinkProjectModules();
			await setupChai();
			process.env.INITIALIZED = true;

			function symlinkNodeModules() {
				const nodeModulesDir = path.join(wallaby.localProjectDir, "node_modules");
				const commonTempDir = path.join(wallaby.localProjectDir, "common/temp/node_modules");
				if (!fs.existsSync(nodeModulesDir)) {
					console.log(`Sym linking ${nodeModulesDir} with ${commonTempDir}`);
					fs.symlinkSync(commonTempDir, nodeModulesDir);
				}
			}
			function rushJson() {
				const json5 = require("json5");
				return json5.parse(fs.readFileSync(path.join(wallaby.localProjectDir, "rush.json"), "utf-8"));
			}

			function symlinkProjectModules() {
				console.log("Sym linking rush modules");
				rushJson().projects.map(project => {
					const [packageCategory, packageName] = project.packageName.split("/");
					const categoryDir = path.join(wallaby.localProjectDir, "node_modules", packageCategory);
					if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir);
					if (!fs.existsSync(`${categoryDir}/${packageName}`)) {
						console.log("Sym linking", project.packageName);
						const sourcePath = `${wallaby.localProjectDir}/${project.projectFolder}`;
						const targetPath = `${categoryDir}/${packageName}`;
						fs.symlinkSync(sourcePath, targetPath);
					}
				});
			}

			async function setupChai() {
				const chai = require("chai");
				chai.should();
				const projectPaths = rushJson().projects.map(p => path.join(wallaby.localProjectDir, p.projectFolder))
				await Promise.all(projectPaths.map(async (path) => {
					const libStoreSetup = await import(`${path}/test/helpers/globalSetup.js`);
					libStoreSetup.mochaGlobalSetup?.();
				}));
			}
		}
	};
};