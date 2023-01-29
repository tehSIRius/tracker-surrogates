import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import untypedMapping from '../mapping.json';
import { buildSync } from 'esbuild';

interface SurrogateRule {
	regexRule: string;
	surrogate: string;
}
// The retyping here is not the cleanest but it is the easiest way to get it working.
const mapping: Record<string, SurrogateRule[]> = untypedMapping;

const surrogatesDir = path.join(path.dirname(__dirname), 'surrogates');
const surrogates = fs.readdirSync(surrogatesDir).map((surrogate) => {
    const filepath = path.resolve(surrogatesDir, surrogate);
    const stat = fs.statSync(filepath);

    if (!stat.isFile()) {
        return '';
    }

    const surrogateFileName = surrogate.split('.')[0];
    const domain = Object.keys(mapping).find((domainKey) =>
        mapping[domainKey].find((s) => s.surrogate.split('.')[0] === surrogateFileName)
    );

    if (!domain) {
        throw new Error(`🛑 Domain for surrogate missing - ${surrogate}.`);
    }

    const content = buildSync({
        stdin: { contents: '' },
        inject: [filepath],
        write: false,
        outdir: 'out',
    });

    if (content.errors.length) {
        throw new Error(
            `🛑 Could not compile surrogate ${surrogate} - ${content.errors}`
        );
    }

    return `${domain}/${surrogateFileName}.js application/javascript\n${content.outputFiles[0].text}`;
});

const introduction = `# This file contains "surrogates". Surrogates are small scripts that our apps and extensions serve in place of trackers that cause site breakage when blocked.
# Learn more: https://github.com/duckduckgo/tracker-surrogates`;

const buildsDir = path.join(path.dirname(__dirname), 'builds');
if (!fs.existsSync(buildsDir)) {
    fs.mkdirSync(buildsDir);
}

const output = [introduction, ...surrogates].join('\n');
fs.writeFileSync(path.join(buildsDir, 'surrogates-next.txt'), output);

const hash = crypto.createHash('md5').update(output).digest('hex');
console.log(`MD5 hash: `, hash);
