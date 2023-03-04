(() => {
    const emptyFunction = () => {
        // Placeholder
    };

    window.udm_ = emptyFunction;
    window._comscore = [];
    window.COMSCORE = {
        beacon: emptyFunction,
        purge: () => {
            window._comscore = [];
        }
    };
})();
