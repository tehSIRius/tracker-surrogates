/**
 * Runs all surrogates inside of a (fake) browser environment to check for obvious runtime issues.
 */
import fs from 'fs';
import path from 'path';
import jsdom from 'jsdom';
import { exit } from 'process';

const surrogatesDir = path.join(__dirname, '../surrogates');

const allSurrogates = fs.readdirSync(surrogatesDir).map(filename => {
    const filepath = path.resolve(surrogatesDir, filename);
    const stat = fs.statSync(filepath);

    if (!stat.isFile()) {
        return Promise.resolve();
    }

    const surrogateText = fs.readFileSync(filepath, 'utf-8');
    const virtualConsole = new jsdom.VirtualConsole();

    let resolve: (value?: unknown) => void;
    let reject: (reason: string) => void;
    const promise = new Promise((resolveCallback, rejectCallback) => { resolve = resolveCallback; reject = rejectCallback; });

    virtualConsole.on('jsdomError', (e) => {
        reject(`🛑 ${filename} fails with error "${e}"`);
    });

    const dom = new jsdom.JSDOM(`<body><script>${surrogateText}</script></body>`, { runScripts: 'dangerously', virtualConsole });
    dom.window.addEventListener('DOMContentLoaded', () => resolve());

    return promise;
});

Promise.all(allSurrogates)
    .catch(e => {
        console.log(e);
        exit(1);
    });
