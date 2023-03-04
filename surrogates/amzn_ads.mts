(() => {
    if (window.amznads) {
        return;
    }

    const emptyFunction = () => {
        // placeholder
    };

    const emptyFunctionHandler = {
        get: () => emptyFunction
    };

    window.amznads = new Proxy({}, emptyFunctionHandler);
    window.amzn_ads = window.amzn_ads ?? emptyFunction;
    window.aax_write = window.aax_write ?? emptyFunction;
    window.aax_render_ad = window.aax_render_ad ?? emptyFunction;
})();
