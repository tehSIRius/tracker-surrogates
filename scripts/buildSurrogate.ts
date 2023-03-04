import fs from "node:fs";

import { buildSync } from "esbuild";

export function buildFile(filePath: string): string {
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
        return "";
    }

    const content = buildSync({
        stdin: { contents: "" },
        inject: [filePath],
        write: false,
        outdir: "out"
    });

    if (content.errors.length > 0) {
        throw new Error(
            `🛑 Could not compile file ${filePath} - ${content.errors
                .map((value) => JSON.stringify(value))
                .join("\n")}`
        );
    }

    return content.outputFiles[0].text;
}
