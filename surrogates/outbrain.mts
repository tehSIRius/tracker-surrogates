(() => {
    const emptyFunction = () => {
        // Placeholder
    };

    const emptyFunctionHandler = {
        get: () => {
            return emptyFunction;
        }
    };

    const emptyFunctionExternalHandler = {
        get: (target: Record<string, unknown>, property: string) => {
            if (
                property === "video" ||
                property === "feed" ||
                property === "recReasons"
            ) {
                return Reflect.get(target, property);
            }

            return emptyFunction;
        }
    };

    const emptyFunctionProxy = new Proxy({}, emptyFunctionHandler);

    const externalTarget = {
        video: {
            getVideoRecs: emptyFunction,
            initInPlayerWidget: emptyFunction,
            videoClicked: emptyFunction
        },
        feed: {
            loadNextChunk: emptyFunction
        },
        recReasons: {
            backFromScopedWidget: emptyFunction,
            loadScopedWidget: emptyFunction,
            onRecFollowClick: emptyFunction,
            onRecLinkHover: emptyFunction,
            onRecLinkHoverOut: emptyFunction
        }
    };

    const outbrainObject: OutbrainObject = {
        ready: true,
        error: emptyFunction,
        extern: new Proxy(externalTarget, emptyFunctionExternalHandler),
        display: emptyFunctionProxy,
        controller: emptyFunctionProxy,
        printLog: emptyFunction,
        IntersectionObserver: emptyFunction,
        proxy: emptyFunctionProxy,
        languageManager: emptyFunctionProxy
    };

    window.OBR$ = emptyFunction;
    window.OB_releaseVer = "200037";
    window.OBR = window.OBR ?? outbrainObject;
    window.OB_PROXY = window.OB_PROXY ?? emptyFunctionProxy;
    window.outbrain = window.outbrain ?? emptyFunctionProxy;
    window.outbrain_rater = window.outbrain_rater ?? emptyFunctionProxy;
})();
