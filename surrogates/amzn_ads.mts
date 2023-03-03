(() => {
    'use strict';

    if (window.amznads) {
        return;
    }

    const noop = () => {
        // placeholder
    };

    const noopHandler = {
        get: () => noop,
    };

    window.amznads = new Proxy({}, noopHandler);
    window.amzn_ads = window.amzn_ads ?? noop;
    window.aax_write = window.aax_write ?? noop;
    window.aax_render_ad = window.aax_render_ad ?? noop;
})();
