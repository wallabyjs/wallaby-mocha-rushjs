export function resolve(specifier, context, defaultResolve) {
    return defaultResolve(specifier, context, defaultResolve);
}

export function load(url, context, defaultLoad) {
    if (url.startsWith(process.env.localProjectDir) && url.endsWith('.ts')) {
        url = process.env.projectCacheDir + '/' + url.substring(process.env.localProjectDir.length, url.length - 2) + 'js';
    }

    return defaultLoad(url, context, defaultLoad);
}