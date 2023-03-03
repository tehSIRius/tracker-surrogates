(() => {
    'use strict';

    const emptyFunction = () => {
        // Placeholder
    };
    const emptyFunctionNull = () => null;
    const emptyFunctionArray = () => [];
    const emptyFunctionString = () => '';
    const emptyFunctionThis = () => this;

    const emptyFunctionHandler = {
        get: (target: Record<string, unknown>, property: string) => {
            if (target[property] !== undefined) {
                return Reflect.get(target, property);
            }

            return emptyFunction;
        }
    };

    const noopReturnThisHandler = {
        get: (target: Record<string, unknown>, property: string) => {
            if (!target[property] !== undefined) {
                return Reflect.get(target, property);
            }

            return emptyFunctionThis;
        }
    };

    const passbackTarget = {
        display: emptyFunction,
        get: emptyFunctionNull
    };

    const pubadsTarget = {
        addEventListener: emptyFunctionThis,
        clearCategoryExclusions: emptyFunctionThis,
        clearTagForChildDirectedTreatment: emptyFunctionThis,
        clearTargeting: emptyFunctionThis,
        definePassback: () => new Proxy(passbackTarget, noopReturnThisHandler),
        defineOutOfPagePassback: () => new Proxy(passbackTarget, noopReturnThisHandler),
        get: emptyFunctionNull,
        getAttributeKeys: emptyFunctionArray,
        getTargetingKeys: emptyFunctionArray,
        getSlots: emptyFunctionArray,
        set: emptyFunctionThis,
        setCategoryExclusion: emptyFunctionThis,
        setCookieOptions: emptyFunctionThis,
        setForceSafeFrame: emptyFunctionThis,
        setLocation: emptyFunctionThis,
        setPublisherProvidedId: emptyFunctionThis,
        setRequestNonPersonalizedAds: emptyFunctionThis,
        setSafeFrameConfig: emptyFunctionThis,
        setTagForChildDirectedTreatment: emptyFunctionThis,
        setTargeting: emptyFunctionThis,
        setVideoContent: emptyFunctionThis
    };

    const companionadsTarget = {
        addEventListener: emptyFunctionThis
    };

    const sizeMappingTarget = {
        build: emptyFunctionNull
    };

    const contentTarget = {
        addEventListener: emptyFunctionThis
    };

    const slotTarget = {
        get: emptyFunctionNull,
        getAdUnitPath: emptyFunctionArray,
        getAttributeKeys: emptyFunctionArray,
        getCategoryExclusions: emptyFunctionArray,
        getDomId: emptyFunctionString,
        getSlotElementId: emptyFunctionString,
        getTargeting: emptyFunctionArray,
        getTargetingKeys: emptyFunctionArray
    };

    const gptObj = {
        _loadStarted_: true,
        apiReady: true,
        pubadsReady: true,
        cmd: [] as string[],
        pubads: () => new Proxy(pubadsTarget, emptyFunctionHandler),
        companionAds: () => new Proxy(companionadsTarget, emptyFunctionHandler),
        sizeMapping: () => new Proxy(sizeMappingTarget, noopReturnThisHandler),
        content: () => new Proxy(contentTarget, emptyFunctionHandler),
        defineSlot: () => new Proxy(slotTarget, noopReturnThisHandler),
        defineOutOfPageSlot: () => new Proxy(slotTarget, noopReturnThisHandler),
        defineUnit: emptyFunctionNull,
        destroySlots: emptyFunction,
        disablePublisherConsole: emptyFunction,
        display: emptyFunction,
        enableServices: emptyFunction,
        getVersion: emptyFunctionString,
        setAdIframeTitle: emptyFunction
    };

    const commandQueue = (window.googletag && window.googletag.cmd?.length) ? window.googletag.cmd : [];
    gptObj.cmd.push = (argument: unknown) => {
        if (typeof argument !== 'function') {
            return 1;
        }

        try {
            argument();
        } catch {
            // Placeholder
        }

        return 0;
    };

    window.googletag = gptObj;
    while (commandQueue.length > 0) {
        gptObj.cmd.push(commandQueue.shift() as string);
    }
})();
