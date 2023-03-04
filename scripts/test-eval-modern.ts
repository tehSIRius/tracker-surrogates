import fs from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, test } from "vitest";

import { buildFile } from "./build";

describe("Surrogates", () => {
    // eslint-disable-next-line unicorn/prefer-module
    const surrogatesDirectory = path.join(__dirname, "../surrogates");

    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test.each(fs.readdirSync(surrogatesDirectory))(
        "Surrogate %s Should Execute",
        (surrogateFile) => {
            const filepath = path.resolve(surrogatesDirectory, surrogateFile);
            const stat = fs.statSync(filepath);

            expect(stat.isFile()).toBeTruthy();

            const script = document.createElement("script");
            script.textContent = buildFile(filepath);

            expect(() => {
                document.body.append(script);
            }).not.toThrow();
        }
    );
});
