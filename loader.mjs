import * as path from 'path';
import fs from 'fs';
import rushLib from "@microsoft/rush-lib";
import {resolve as exportResolver} from "resolve.exports";

let rushProjects;

function extractRushProjects() {
    if (!rushProjects && process.env.localProjectDir) {
        const rushConfig = rushLib.RushConfiguration.loadFromDefaultLocation({startingFolder: process.env.localProjectDir.replace("file://", "")});
        rushProjects = rushConfig.projects.map(p => {
            const packageJson = JSON.parse(fs.readFileSync(path.join(p.projectFolder, "package.json")));
            return ({
                pkg: p.packageName,
                relativeFolder: p.projectRelativeFolder,
                packageJson
            });
        });
    }
    return rushProjects;
}

export function resolve(specifier, context, defaultResolve) {
    extractRushProjects();
    let resolvedUrl = specifier;
    const fileProject = rushProjects?.find(p => specifier.includes(p.pkg));
    if (fileProject) {
        let resolvedPath = exportResolver(fileProject.packageJson, specifier);
        resolvedUrl = path.join(process.env.projectCacheDir, fileProject.relativeFolder, resolvedPath);
        return defaultResolve( resolvedUrl.replace(".ts", ".js"), context, defaultResolve);
    }
    return defaultResolve(resolvedUrl, context, defaultResolve);
}

export function load(url, context, defaultLoad) {
    if (url.startsWith(process.env.localProjectDir) && url.endsWith('.ts')) {
        url = process.env.projectCacheDir + '/' + url.substring(process.env.localProjectDir.length, url.length - 2) + 'js';
    }

    return defaultLoad(url, context, defaultLoad);
}