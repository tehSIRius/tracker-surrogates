(() => {
    const emptyFunction = () => {
        // Placeholder
    };
    const emptyFunctionHandler = {
        get: () => emptyFunction
    };

    const noopProxy = new Proxy({}, emptyFunctionHandler);
    window.pSUPERFLY = noopProxy;
    window.pSUPERFLY_mab = noopProxy;
})();
