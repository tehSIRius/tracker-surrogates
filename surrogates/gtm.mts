interface DataLayerArgument {
    eventCallback: () => void;
    eventTimeout: number;
}

function isDataLayerArgument(argument: unknown): argument is DataLayerArgument {
    return typeof (argument as { eventCallback?: () => void })?.eventCallback === 'function' && typeof (argument as { eventTimeout?: number}).eventTimeout === 'number';
}

(() => {
    'use strict';

    const datalayer = window.dataLayer;
    window.ga = (window.ga === undefined) ? () => {
        // Placeholder
    } : window.ga;

    if (!datalayer) {
        return;
    }

    // execute callback if exists, see https://www.simoahava.com/gtm-tips/use-eventtimeout-eventcallback/
    if (typeof datalayer.push === 'function') {
        datalayer.push = (argument) => {
            if (!argument) {
                return;
            }

            if (isDataLayerArgument(argument)) {
                const timeout = argument.eventTimeout || 10;

                try {
                    setTimeout(argument.eventCallback, timeout);
                } catch {
                    // Placeholder
                }
            }
        };
    }

    // prevent page delay, see https://developers.google.com/optimize
    if (!datalayer.hide || !datalayer.hide.end) {
        return;
    }

    try {
        datalayer.hide.end();
    } catch {
        // Placeholder
    }
})();
