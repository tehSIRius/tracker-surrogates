(() => {
    const emptyFunction = () => {
        // Placeholder
    };

    const cxApiHandler = {
        get: (target: Record<string, unknown>, property: string) => {
            if (target[property] !== undefined) {
                return Reflect.get(target, property);
            }

            return emptyFunction;
        }
    };

    const cxApiTarget = {
        chooseVariation: () => 0
    };

    window.cxApi = new Proxy(cxApiTarget, cxApiHandler);
})();
