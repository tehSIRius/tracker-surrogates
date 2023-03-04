import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import { buildFile } from "./build";
import untypedMapping from "../mapping.json";

interface SurrogateRule {
    regexRule: string;
    surrogate: string;
}
// The retyping here is not the cleanest but it is the easiest way to get it working.
const mapping: Record<string, SurrogateRule[]> = untypedMapping;

/**
 * Parse a surrogate into an entry.
 *
 * @param surrogate Surrogate to built
 *
 * @returns Key of the surrogate and the surrogate content
 */
function surrogateToEntry(
    surrogatesDirectory: string,
    surrogate: string
): [string, string] {
    const filepath = path.resolve(surrogatesDirectory, surrogate);

    const filename = surrogate.split(".")[0];
    const domain = Object.keys(mapping).find((key) =>
        mapping[key].find((rule) => rule.surrogate.split(".")[0] === filename)
    );

    if (!domain) {
        throw new Error(`🛑 Domain for surrogate missing - ${surrogate}.`);
    }

    return [`${domain}/${surrogate}`, buildFile(filepath, { minify: true })];
}

// eslint-disable-next-line unicorn/prefer-module
const surrogatesDirectory = path.join(path.dirname(__dirname), "surrogates");
const sourceFiles = fs.readdirSync(surrogatesDirectory);

// eslint-disable-next-line unicorn/prefer-module
const buildsDirectory = path.join(path.dirname(__dirname), "builds");
if (!fs.existsSync(buildsDirectory)) {
    fs.mkdirSync(buildsDirectory);
}

const output = JSON.stringify(
    Object.fromEntries(
        sourceFiles.map((surrogate) =>
            surrogateToEntry(surrogatesDirectory, surrogate)
        )
    )
);
fs.writeFileSync(path.join(buildsDirectory, "surrogates-next.json"), output);

const hash = crypto.createHash("md5").update(output).digest("hex");
console.log(`MD5 hash: ${hash}`);
