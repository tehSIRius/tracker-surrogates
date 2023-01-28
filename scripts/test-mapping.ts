/**
 * Tests mapping.json file for missing surrogate files, invalid match rules and checks for unused surrogates.
 */
import fs from 'fs';
import path from 'path';
import untypedMapping from '../mapping.json';

interface SurrogateRule {
    regexRule: string
    surrogate: string
}
// The retyping here is not the cleanest but it is the easiest way to get it working.
const mapping: Record<string, SurrogateRule[]> = untypedMapping;

const surrogatesDir = path.join(path.dirname(__dirname), 'surrogates');
const knownSurrogates = fs.readdirSync(surrogatesDir).map(filename => {
    const filepath = path.resolve(surrogatesDir, filename);
    const stat = fs.statSync(filepath);

    if (stat.isFile()) {
        return filename;
    }
}).filter((surrogate) => surrogate) as string[];

const seen = new Set();
Object.entries(mapping).forEach(([domain, rules]) => {
    rules.forEach(({ regexRule, surrogate}) => {
        if (!knownSurrogates.includes(surrogate)) {
            console.error(`🛑 Mapping file contains unknown surrogate - ${surrogate}`);
            process.exit(1);
        }

        // build RE based upon domain portion of regex
        const re = new RegExp(regexRule.split('\\/')[0]);
        if (!re.test(domain)) {
            console.error(`🛑 RegExp rule doesn't match domain - "${regexRule}" doesn't match "${domain}"`);
            process.exit(1);
        }

        seen.add(surrogate);
    });
});

knownSurrogates.forEach(name => {
    if (!seen.has(name)) {
        console.error(`🛑 One of the surrogates is not mentioned in the mapping file - ${name}`);
        process.exit(1);
    }
});
