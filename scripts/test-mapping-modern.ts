import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { type SurrogateRule } from "./test-mapping";
import untypedMapping from "../mapping.json";

// The retyping here is not the cleanest but it is the easiest way to get it working.
const mapping: Record<string, SurrogateRule[]> = untypedMapping;

describe("Mapping", () => {
    // eslint-disable-next-line unicorn/prefer-module
    const surrogatesDirectory = path.join(__dirname, "../surrogates");
    const knownSurrogates = fs
        .readdirSync(surrogatesDirectory)
        .map((filename) => {
            const filepath = path.resolve(surrogatesDirectory, filename);
            const stat = fs.statSync(filepath);

            if (stat.isFile()) {
                return filename.split("/").at(-1)?.split(".").at(0);
            }
        })
        .filter(Boolean)
        .sort() as string[];

    const rules = Object.entries(mapping).flatMap(([domain, rules]) =>
        rules.map((rule) => ({ domain, rule }))
    );

    const detected = new Set();

    beforeAll(() => {
        detected.clear();
    });

    afterAll(() => {
        expect([...detected].sort()).toStrictEqual(knownSurrogates);
    });

    test.each(rules)(
        "Surrogate Should Exist for Domain and Rule %o",
        ({ domain, rule: { regexRule, surrogate } }) => {
            const filename = surrogate.split(".").at(0) ?? "";
            expect(knownSurrogates).includes(filename);

            const re = new RegExp(regexRule.split("\\/")[0]);
            expect(re.test(domain)).toBeTruthy();

            detected.add(filename);
        }
    );
});
