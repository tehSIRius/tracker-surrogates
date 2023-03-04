import fs from "node:fs";

import { buildSync, type BuildOptions } from "esbuild";

/**
 * Build a source file into a JS script.
 *
 * @param filePath Path to the file to be build
 * @param options Additional options for esbuild
 *
 * @returns Built JS script content
 */
export function buildFile(
    filePath: string,
    options?: Omit<BuildOptions, "stdin" | "inject" | "write" | "outdir">
): string {
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
        return "";
    }

    const content = buildSync({
        ...options,
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
