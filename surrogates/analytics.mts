declare global {
	interface Window extends Record<string, unknown> {
		GoogleAnalyticsObject?: string;

		dataLayer?: {
			hide?: {
				end?: () => void;
			};
		};
	}
}

(() => {
    'use strict';
    const noop = () => {
        // placeholder
    };

    const noopHandler = {
        get: () => noop,
    };

    const gaPointer = (window.GoogleAnalyticsObject =
		window.GoogleAnalyticsObject ?? 'ga');
    const datalayer = window.dataLayer;

    // execute callback if exists, see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#hitCallback
    const ga = (...args: Array<{ hitCallback?: () => void} | undefined>) => {
        const params = Array.from(args);

        params.forEach((param) => {
            if (typeof param?.hitCallback === 'function') {
                try {
                    param.hitCallback();
                } catch (error) {
                    // Placeholder
                }
            }
        });
    };

    const Tracker = new Proxy(
        {},
        {
            get(_target, prop) {
                if (prop !== 'get') {
                    return noop;
                }

                return (fieldName: string) => {
                    if (fieldName === 'linkerParam') {
                        // This fixed string is an example value of this API.
                        // As the extension exposes itself with many features we shouldn't be concerned by exposing ourselves here also.
                        // If we randomized this to some other fake value there wouldn't be much benefit and could risk being a tracking vector.
                        // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#linkerParam
                        return '_ga=1.231587807.1974034684.1435105198';
                    }

                    return 'something';
                };
            },
        }
    );

    ga.answer = 42;
    ga.loaded = true;
    ga.create = () => new Proxy({}, noopHandler);
    ga.getByName = () => new Proxy({}, noopHandler);
    ga.getAll = () => [Tracker];
    ga.remove = noop;

    window[gaPointer] = ga;

    if (typeof datalayer?.hide?.end !== 'function') {
        return;
    }

    // prevent page delay, see https://developers.google.com/optimize
    try {
        datalayer.hide.end();
    } catch (error) {
        // Placeholder
    }
})();
