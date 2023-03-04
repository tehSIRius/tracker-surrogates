(() => {
    try {
        const emptyFunction = () => {
            // Placeholder
        };
        const emptyFunctionHandler = {
            get: () => emptyFunction
        };

        window.GoogleAnalyticsObject = window.GoogleAnalyticsObject ?? "ga";
        const gaPointer = window.GoogleAnalyticsObject as keyof Window;
        const datalayer = window.dataLayer;

        // execute callback if exists, see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#hitCallback
        const ga = (
            ...arguments_: ({ hitCallback?: () => void } | undefined)[]
        ) => {
            const parameters = [...arguments_];

            for (const parameter of parameters) {
                if (
                    !(parameter instanceof Object) ||
                    typeof parameter.hitCallback !== "function"
                ) {
                    continue;
                }

                try {
                    parameter.hitCallback();
                } catch {
                    // Placeholder
                }
            }
        };

        const Tracker = new Proxy(
            {},
            {
                get(_target, property) {
                    if (property !== "get") {
                        return emptyFunction;
                    }

                    return (fieldName: string) => {
                        if (fieldName === "linkerParam") {
                            // This fixed string is an example value of this API.
                            // As the extension exposes itself with many features we shouldn't be concerned by exposing ourselves here also.
                            // If we randomised this to some other fake value there wouldn't be much benefit and could risk being a tracking vector.
                            // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#linkerParam
                            return "_ga=1.231587807.1974034684.1435105198";
                        }
                        return "something";
                    };
                }
            }
        );
        ga.answer = 42;
        ga.loaded = true;
        ga.create = function () {
            return new Proxy({}, emptyFunctionHandler);
        };
        ga.getByName = function () {
            return new Proxy({}, emptyFunctionHandler);
        };
        ga.getAll = function () {
            return [Tracker];
        };
        ga.remove = emptyFunction;
        (window[gaPointer] as Window["ga"]) = ga;
        // prevent page delay, see https://developers.google.com/optimize
        if (!datalayer?.hide || typeof datalayer.hide.end !== "function") {
            return;
        }

        try {
            datalayer.hide.end();
        } catch {
            // Placeholder
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
})();
