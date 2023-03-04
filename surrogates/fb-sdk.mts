interface FacebookEvent extends Event {
    detail: {
        entity: string;
    };
}

interface FBLogin {
    callback: (parameters?: object) => void;
    params?: Record<string, unknown>;
    shouldRun: boolean;
}

function messageAddon(detailObject: {
    entity?: string;
    appID?: string;
    action?: string;
}) {
    detailObject.entity = "Facebook";

    const event = new CustomEvent("ddg-ctp", {
        detail: detailObject,
        bubbles: false,
        cancelable: false,
        composed: false
    });

    dispatchEvent(event);
}

(() => {
    const emptyFunction = () => {
        // Placeholder
    };

    const originalFBURL = (document.currentScript as HTMLScriptElement).src;

    let siteInit = emptyFunction;

    let fbIsEnabled = false;
    let initData = {};
    let runInit = false;
    const parseCalls: Node[] = [];
    const popupName = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .slice(0, 12);

    const fbLogin: FBLogin = {
        callback: emptyFunction,
        params: undefined,
        shouldRun: false
    };

    /**
     * When setting up the Facebook SDK, the site may define a function called window.fbAsyncInit.
     * Once the SDK loads, it searches for and calls window.fbAsyncInit. However, some sites may
     * not use this, and just call FB.init directly at some point (after ensuring that the script has loaded).
     *
     * Our surrogate (defined below in window.FB) captures calls made to init by page scripts. If at a
     * later point we load the real sdk here, we then re-call init with whatever arguments the page passed in
     * originally. The runInit param should be true when a page has called init directly.
     * Because we put it in asyncInit, the flow will be something like:
     *
     * FB SDK loads -> SDK calls window.fbAsyncInit -> Our function calls window.FB.init (maybe) ->
     * our function calls original fbAsyncInit (if it existed)
     */
    function enableFacebookSDK() {
        if (fbIsEnabled) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (initData) {
                window.FB?.init(initData);
            }

            return;
        }

        window.FB = undefined;

        window.fbAsyncInit = () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (runInit && initData) {
                window.FB?.init(initData);
            }

            siteInit();

            if (fbLogin.shouldRun) {
                window.FB?.login(fbLogin.callback, fbLogin.params);
            }
        };

        const fbScript = document.createElement("script");
        fbScript.setAttribute("crossorigin", "anonymous");
        fbScript.setAttribute("async", "");
        fbScript.setAttribute("defer", "");
        fbScript.src = originalFBURL;
        fbScript.addEventListener("load", () => {
            for (const node of parseCalls) {
                window.FB?.XFBML.parse.apply(window.FB.XFBML, node);
            }
        });
        document.head.append(fbScript);

        fbIsEnabled = true;
    }

    function runFacebookLogin() {
        fbLogin.shouldRun = true;
        replaceWindowOpen();
        loginPopup();
        enableFacebookSDK();
    }

    function replaceWindowOpen() {
        const oldOpen = window.open;

        window.open = (url, name, windowParameters) => {
            const u = new URL(url ?? "");

            if (u.origin === "https://www.facebook.com") {
                name = popupName;
            }

            return oldOpen.call(window, url, name, windowParameters);
        };
    }

    function loginPopup() {
        const width = Math.min(window.screen.width, 450);
        const height = Math.min(window.screen.height, 450);
        const popupParameters = `width=${width},height=${height},scrollbars=1,location=1`;
        window.open("about:blank", popupName, popupParameters);
    }

    window.addEventListener("ddg-ctp-load-sdk", (event) => {
        if ((event as FacebookEvent).detail.entity !== "Facebook") {
            return;
        }

        enableFacebookSDK();
    });
    window.addEventListener("ddg-ctp-run-login", (event) => {
        if ((event as FacebookEvent).detail.entity !== "Facebook") {
            return;
        }

        runFacebookLogin();
    });
    window.addEventListener("ddg-ctp-cancel-modal", (event) => {
        if ((event as FacebookEvent).detail.entity !== "Facebook") {
            return;
        }

        fbLogin.callback({});
    });

    function init() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (window.fbAsyncInit) {
            siteInit = window.fbAsyncInit;
            window.fbAsyncInit();
        }
    }

    if (!window.FB) {
        window.FB = {
            api: (_url, callback) => callback(),
            init: (initiationData?: { appId?: string }) => {
                if (!initiationData) {
                    return;
                }

                initData = initiationData;
                runInit = true;
                messageAddon({
                    appID: initiationData.appId
                });
            },
            ui: (parameters, callback) => {
                if (parameters.method && parameters.method === "share") {
                    const shareLink = `https://www.facebook.com/sharer/sharer.php?u=${parameters.href}`;
                    window.open(
                        shareLink,
                        "share-facebook",
                        "width=550,height=235"
                    );
                }

                callback({});
            },
            getAccessToken: emptyFunction,
            getAuthResponse: () => {
                return { status: "" };
            },
            getLoginStatus: (callback) => {
                callback({ status: "unknown" });
            },
            getUserID: emptyFunction,
            login: (callback, parameters) => {
                fbLogin.callback = callback;
                fbLogin.params = parameters;
                messageAddon({
                    action: "login"
                });
            },
            logout: emptyFunction,
            AppEvents: {
                EventNames: {},
                logEvent: emptyFunction,
                logPageView: emptyFunction
            },
            Event: {
                subscribe: function (event, callback) {
                    if (event === "xfbml.render") {
                        callback();
                    }
                },
                unsubscribe: emptyFunction
            },
            XFBML: {
                parse: (node: Node) => {
                    parseCalls.push(node);
                }
            }
        };

        if (document.readyState !== "complete") {
            // sdk script loaded before page content, so wait for load.
            window.addEventListener("load", () => {
                init();
            });
            return;
        }

        init();
    }
})();
