/**
 * Builds single file with all surrogates consumed by clients that fetch surrogates from a remote endpoint.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import untypedMapping from '../mapping.json';

interface SurrogateRule {
    regexRule: string
    surrogate: string
}
// The retyping here is not the cleanest but it is the easiest way to get it working.
const mapping: Record<string, SurrogateRule[]> = untypedMapping;

const surrogatesDir = path.join(path.dirname(__dirname), 'surrogates');
const buildsDir = path.join(path.dirname(__dirname), 'builds');

const surrogates = fs.readdirSync(surrogatesDir).map((surrogate: string) => {
    const filepath = path.resolve(surrogatesDir, surrogate);
    const stat = fs.statSync(filepath);

    if (!stat.isFile()) {
        return '';
    }

    // strip blank lines from surrogates, or it breaks parsing in BSK
    const text = fs.readFileSync(filepath, 'utf-8').replace(/^\s*[\r\n]/gm, '');
    const domain = Object.keys(mapping).find((domainKey) =>
        mapping[domainKey].find((s) => s.surrogate === surrogate)
    );

    if (!domain) {
        throw new Error(`🛑 Domain for surrogate missing - ${surrogate}.`);
    }

    return `${domain}/${surrogate} application/javascript\n${text}`;
});

let output = `# This file contains "surrogates". Surrogates are small scripts that our apps and extensions serve in place of trackers that cause site breakage when blocked.
# Learn more: https://github.com/duckduckgo/tracker-surrogates`;
output = [output, ...surrogates].join('\n');

if (!fs.existsSync(buildsDir)) {
    fs.mkdirSync(buildsDir);
}

fs.writeFileSync(path.join(buildsDir, 'surrogates-next.txt'), output);

const hash = crypto.createHash('md5').update(output).digest('hex');
console.log('MD5 hash: ', hash);
