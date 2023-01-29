(() => {
    const noop = () => {
        // Placeholder
    };

    const cxApiHandler = {
        get: (target: Record<string, unknown>, prop: string) => {
            if (typeof target[prop] !== 'undefined') {
                return Reflect.get(target, prop);
            }

            return noop;
        },
    };

    const cxApiTarget = {
        chooseVariation: () => 0,
    };

    window.cxApi = new Proxy(cxApiTarget, cxApiHandler);
})();
