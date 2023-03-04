/**
 * Tests mapping.json file for missing surrogate files, invalid match rules and checks for unused surrogates.
 */
import fs from "node:fs";
import path from "node:path";
import { exit } from "node:process";

import untypedMapping from "../mapping.json";

interface SurrogateRule {
    regexRule: string;
    surrogate: string;
}
export type { SurrogateRule };
// The retyping here is not the cleanest but it is the easiest way to get it working.
const mapping: Record<string, SurrogateRule[]> = untypedMapping;

// eslint-disable-next-line unicorn/prefer-module
const surrogatesDirectory = path.join(path.dirname(__dirname), "surrogates");
const knownSurrogates = fs
    .readdirSync(surrogatesDirectory)
    .map((filename) => {
        const filepath = path.resolve(surrogatesDirectory, filename);
        const stat = fs.statSync(filepath);

        if (stat.isFile()) {
            return filename.split("/").at(-1)?.split(".").at(0);
        }
    })
    .filter(Boolean) as string[];

const seen = new Set();
for (const [domain, rules] of Object.entries(mapping)) {
    for (const { regexRule, surrogate } of rules) {
        const filename = surrogate.split(".").at(0) ?? "";
        if (!knownSurrogates.includes(filename)) {
            console.error(
                `🛑 Mapping file contains unknown surrogate - ${surrogate}`
            );
            exit(1);
        }

        // build RE based upon domain portion of regex
        const re = new RegExp(regexRule.split("\\/")[0]);
        if (!re.test(domain)) {
            console.error(
                `🛑 RegExp rule doesn't match domain - "${regexRule}" doesn't match "${domain}"`
            );
            exit(1);
        }

        seen.add(filename);
    }
}

for (const name of knownSurrogates) {
    if (!seen.has(name)) {
        console.error(
            `🛑 One of the surrogates is not mentioned in the mapping file - ${name}`
        );
        exit(1);
    }
}
