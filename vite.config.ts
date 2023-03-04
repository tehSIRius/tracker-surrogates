import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: [
            "scripts/test-eval-modern.ts",
            "scripts/test-mapping-modern.ts"
        ],
        environment: "jsdom",
        typecheck: {
            checker: "tsc"
        },
        watch: false
    }
});
