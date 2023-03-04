# tracker-surrogates

<div align="center">
    <a href="https://github.com/tehSIRius/tracker-surrogates/actions/workflows/test.yml">
        <img src="https://github.com/tehSIRius/tracker-surrogates/actions/workflows/test.yml/badge.svg" alt="Test Status" />
    </a>
    <a href="https://snyk.io/test/github/tehsirius/tracker-surrogates">
        <img src="https://snyk.io/test/github/tehSIRius/tracker-surrogates/badge.svg" alt="Snyk Vulnerabilities Scan" />
    </a>
    <a href="https://codeclimate.com/github/tehSIRius/tracker-surrogates/maintainability">
        <img src="https://api.codeclimate.com/v1/badges/860c45e3365b6ec3e6b1/maintainability" />
    </a>
</div>

## Patrik Dvořáček's Note

I have forked this repository to try to modernize it. Mostly to implement TypeScript, a proper build system with esbuild and an opinionated linter.

I have limited the typing of `window` to what could be seen in the `surrogates` scripts themselves. It would probably be much better to find the definitions for each script, if they exists, and import those.

Additionally, I have moved from `npm` to a forced usage of `pnpm`. This move is mostly motivated by faster install times.

I have tried to keep the scripts as close in functionality to the original as possible. However, there are better approaches these days than when these scripts were seemingly written. I have therefore decided to create a separate suite of scripts with the modern approaches. They are available under `pnpm build:modern` and `pnpm test:modern`.

For `pnpm build`, I rewrote the concat script to output the files into a JSON file. The new format should be much easier to parse and work with. Moreover, I have minified the surrogates scripts, because why not. Having readable scripts when the source code is readily available does not make much sense in production.

For `pnpm test`, I used [vitest](https://vitest.dev/) as the test runner.

---

Surrogates are small scripts that our apps and extensions serve in place of trackers that cause site breakage when blocked. Surrogates mock the API structure of the original scripts they replace, allowing pages that depend on the existence of certain methods, or properties, to function as if the original script was loaded.

## How this repository is used

All surrogates are bundled together and [deployed to a CDN](https://duckduckgo.com/contentblocking.js?l=surrogates) from which they are picked by client apps and extensions.
For platforms that don't allow remote code execution this repository is imported as a git submodule and surrogates are embedded at build time.

DuckDuckGo clients using surrogates:

-   [Chrome and Firefox extensions](https://github.com/duckduckgo/duckduckgo-privacy-extension)
-   [Safari extension](https://github.com/duckduckgo/privacy-essentials-safari)
-   [iOS app](https://github.com/duckduckgo/iOS)
-   [Android app](https://github.com/duckduckgo/Android)

## Structure of this repository

-   `scripts/` - testing and deployment scripts
-   `surrogates/` - surrogate files
-   `mapping.json` - list of regular expressions that map urls to surrogates that should be served as request responses. Data from this file is incorporated into the [web blocklist](https://github.com/duckduckgo/tracker-blocklists/tree/main/web).

Format of the `mapping.json` file:

```js
{
    "example.com": [
        {
            "regexRule": "example.com\\/rule\\/matching\\/[a-z_A-Z]+\\/file.js", // regular expression for matching urls
            "surrogate": "surrogate_name.js", // name of the file from the `surrogates/` folder
            "action": "block-ctl-example" // optional action name, used by the blocklist, indicating that this surrogate is meant for the Click To Load feature
        },
        …
    ],
    …
}
```

## Contributing

We don't take external contributions at this time, but please feel free to open issues.
