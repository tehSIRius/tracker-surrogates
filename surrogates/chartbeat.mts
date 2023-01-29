(() => {
    'use strict';

    const noop = () => {
        // Placeholder
    };
    const noopHandler = {
        get: () => noop,
    };
    
    const noopProxy = new Proxy({}, noopHandler);
    window.pSUPERFLY = noopProxy;
    window.pSUPERFLY_mab = noopProxy;
})();
