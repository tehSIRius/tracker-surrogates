(() => {
    const emptyFunction = () => {
        // Placeholder
    };
    const emptyFunctionReturningArray = <ArrayType,>(): ArrayType[] => {
        return [];
    };
    const emptyFunctionHandler = {
        get: (target: Record<string, unknown>, property: string) => {
            if (!target[property]) {
                return Reflect.get(target, property);
            }

            return emptyFunction;
        }
    };
    const trackerTarget = {
        _getLinkerUrl: (argument: unknown) => argument
    };
    const gaqTarget = {
        push: (argument: (() => void) | string[] | (() => void)[]) => {
            if (typeof argument === "function") {
                try {
                    argument();
                } catch {
                    // Placeholder
                }
                return;
            }

            if (!Array.isArray(argument)) {
                return;
            }

            if (argument[0] === "_link" && typeof argument[1] === "string") {
                window.location.assign(argument[1]);
            }

            if (
                argument[0] === "_set" &&
                argument[1] === "hitCallback" &&
                typeof argument[2] === "function"
            ) {
                try {
                    argument[2]();
                } catch {
                    // Placeholder
                }
            }
        }
    };

    const gatTarget = {
        _getTracker: () => new Proxy(trackerTarget, emptyFunctionHandler),
        _getTrackerByName: () => new Proxy(trackerTarget, emptyFunctionHandler),
        _getTrackers: emptyFunctionReturningArray
    };

    const gaqObject = new Proxy(gaqTarget, emptyFunctionHandler);
    window._gat = new Proxy(gatTarget, emptyFunctionHandler);

    const commandQueue =
        window._gaq && Array.isArray(window._gaq) ? window._gaq : [];
    while (commandQueue.length > 0) {
        gaqObject[commandQueue.length] = commandQueue.shift();
    }

    window._gaq = gaqObject;
})();
