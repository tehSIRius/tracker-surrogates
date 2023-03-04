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

// eslint-disable-next-line unicorn/prefer-module
const surrogatesDirectory = path.join(path.dirname(__dirname), "surrogates");
const surrogates = fs.readdirSync(surrogatesDirectory).map((surrogate) => {
    const filepath = path.resolve(surrogatesDirectory, surrogate);

    const surrogateFileName = surrogate.split(".")[0];
    const domain = Object.keys(mapping).find((domainKey) =>
        mapping[domainKey].find(
            (surrogateRule) =>
                surrogateRule.surrogate.split(".")[0] === surrogateFileName
        )
    );

    if (!domain) {
        throw new Error(`🛑 Domain for surrogate missing - ${surrogate}.`);
    }

    return `${domain}/${surrogateFileName}.js application/javascript\n${buildFile(
        filepath
    )}`;
});

const introduction = `# This file contains "surrogates". Surrogates are small scripts that our apps and extensions serve in place of trackers that cause site breakage when blocked.
# Learn more: https://github.com/duckduckgo/tracker-surrogates`;

// eslint-disable-next-line unicorn/prefer-module
const buildsDirectory = path.join(path.dirname(__dirname), "builds");
if (!fs.existsSync(buildsDirectory)) {
    fs.mkdirSync(buildsDirectory);
}

const output = [introduction, ...surrogates].join("\n");
fs.writeFileSync(path.join(buildsDirectory, "surrogates-next.txt"), output);

const hash = crypto.createHash("md5").update(output).digest("hex");
console.log(`MD5 hash:`, hash);
