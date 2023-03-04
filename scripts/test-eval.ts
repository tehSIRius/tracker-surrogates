/**
 * Runs all surrogates inside of a (fake) browser environment to check for obvious runtime issues.
 */
import fs from "node:fs";
import path from "node:path";
import { exit } from "node:process";

import jsdom from "jsdom";

import { buildFile } from "./build";

// eslint-disable-next-line unicorn/prefer-module
const surrogatesDirectory = path.join(__dirname, "../surrogates");

const allSurrogates = fs.readdirSync(surrogatesDirectory).map((filename) => {
    const filepath = path.resolve(surrogatesDirectory, filename);
    const stat = fs.statSync(filepath);

    if (!stat.isFile()) {
        return Promise.resolve();
    }

    const surrogateText = buildFile(filepath);
    const virtualConsole = new jsdom.VirtualConsole();

    let resolve: (value?: unknown) => void;
    let reject: (reason: string) => void;
    const promise = new Promise((resolveCallback, rejectCallback) => {
        resolve = resolveCallback;
        reject = rejectCallback;
    });

    virtualConsole.on("jsdomError", (error) => {
        reject(`🛑 ${filename} fails with error "${JSON.stringify(error)}"`);
    });

    const dom = new jsdom.JSDOM(
        `<body><script>${surrogateText}</script></body>`,
        { runScripts: "dangerously", virtualConsole }
    );
    dom.window.addEventListener("DOMContentLoaded", () => resolve());

    return promise;
});

// eslint-disable-next-line unicorn/prefer-top-level-await
Promise.all(allSurrogates).catch((error) => {
    console.log(error);
    exit(1);
});
