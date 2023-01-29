(() => {
    'use strict';

    const noop = () => {
        // Placeholder
    };
    
    window.udm_ = noop;
    window._comscore = [];
    window.COMSCORE = {
        beacon: noop,
        purge: () => {
            window._comscore = [];
        }
    };
})();
