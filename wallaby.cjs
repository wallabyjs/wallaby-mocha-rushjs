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
				runner: "--experimental-specifier-resolution=node"
			},
			"DOTENV_CONFIG_PATH": ".env"
		},

		workers: { restart: true },
		debug: true,
		reportConsoleErrorAsError: true,
		setup: async (wallaby) => {
			const fs = require("fs");
			const json5 = require("json5");
			const chai = require("chai");
			const path = require("path");
			const rushJson = json5.parse(fs.readFileSync(`${wallaby.localProjectDir}/rush.json`, "utf-8"));
			const projectPaths = rushJson.projects.map(p => path.join(wallaby.localProjectDir, p.projectFolder))

			const symlinkProjectModules = () => {
				console.log("Sym linking rush modules");
				rushJson.projects.map(project => {
					const [packageCategory, packageName] = project.packageName.split("/");
					const categoryDir = `./node_modules/${packageCategory}`;
					if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir);
					if (!fs.existsSync(`${categoryDir}/${packageName}`)) {
						console.log("Sym linking", project.packageName);
						const sourcePath = `${wallaby.localProjectDir}/${project.projectFolder}`;
						const targetPath = `${categoryDir}/${packageName}`;
						fs.symlinkSync(sourcePath, targetPath);
					}
				});
			};

			const setupChai = async () => {
				chai.should();
				await Promise.all(projectPaths.map(async (path) => {
					const libStoreSetup = await import(`${path}/test/helpers/globalSetup.js`);
					libStoreSetup.mochaGlobalSetup?.();
				}));
			};

			const tsConfigPaths = require("tsconfig-paths");
			tsConfigPaths.register({
				baseUrl: ".",
				paths: {
					"$src/*": [ './libs/domain/src/*', './libs/store/src/*' ]
				}
			});
			symlinkProjectModules();
			await setupChai();
			process.env.INITIALIZED = true;
		}
	};
};