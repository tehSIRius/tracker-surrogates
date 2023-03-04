declare const YT: unknown;

interface PlayerConfiguration {
    height?: string;
    width?: string;
    videoId?: string;
    playerVars?: {
        list?: string;
    };
    events?: {
        onReady: () => void;
        onStateChange: () => void;
    };
}

interface OnElementAnnouncedHandlerArgument { 
    target: Element, 
    detail: { 
        entity: string, 
        widgetID: string, 
        replaceSettings: { 
        type: string 
    }}
}

(() => {
    'use strict';

    if (typeof YT !== 'undefined') {
        return;
    }

    const youtubeEntityName = 'Youtube';

    // See https://developers.google.com/youtube/iframe_api_reference
    const iframeAPIURL = 'https://www.youtube.com/iframe_api';
    const defaultHeight = 640;
    const defaultWidth = 390;

    // The website's `onYouTubeIframeAPIReady` listener (if any).
    let realOnYouTubeIframeAPIReady: (value?: unknown) => void | undefined;

    // Reference to the "real" `YT.Player` constructor.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let realYTPlayer: YoutubePlayer | undefined;

    // Loading state of the YouTube Iframe API.
    let youTubeIframeAPILoaded = false;
    let youTubeIframeAPILoadingPromise: Promise<void> | undefined;

    // Mappings between mock `YT.Player` Objects, their element in the page and
    // any event listeners they might have.
    const mockPlayerByVideoElement = new WeakMap();
    const onReadyListenerByVideoElement = new WeakMap();
    const onStateChangeListenerByVideoElement = new WeakMap();

    // Mappings between the "real" video elements and their placeholder
    // elements.
    const videoElementsByID = new Map();
    const videoElementByPlaceholderElement = new WeakMap();
    const placeholderElementByVideoElement = new WeakMap();

    /**
     * Mock of the `YT.Player` constructor.
     */
    function Player (this: YoutubePlayer, target: Element, configuration: PlayerConfiguration = { }, ...rest: unknown[]) {
        if (youTubeIframeAPILoaded) {
            return new YoutubePlayer(target, configuration, rest);
        }

        const { height, width, videoId, playerVars = { }, events } = configuration;

        if (!(target instanceof Element)) {
            target = document.getElementById(target) as Element;
        }

        // Normalise target to always be the video element instead of the
        // placeholder element (if either even exists at this point).
        if (videoElementByPlaceholderElement.has(target)) {
            target = videoElementByPlaceholderElement.get(target);
        }

        if (!target) {
            throw new Error('Target not found');
        }

        // Set up the video element if the target isn't an existing video.
        if (!placeholderElementByVideoElement.has(target)) {
            const url = new URL(window.YTConfig.host);
            url.pathname = '/embed/';

            // For videos (not playlists) append the video ID to the path.
            // See https://developers.google.com/youtube/player_parameters
            if (!playerVars.list) {
                url.pathname += encodeURIComponent(videoId as string);
            }

            for (const [key, value] of Object.entries(playerVars)) {
                url.searchParams.set(key, value);
            }

            // Ensure that JavaScript control of the video is enabled. This is
            // necessary for the onReady event to fire for the video.
            url.searchParams.set('enablejsapi', '1');

            const videoIframe = document.createElement('iframe');
            videoIframe.height = (parseInt(height ?? '0', 10) ?? defaultHeight).toString();
            videoIframe.width = (parseInt(width ?? '0', 10) ?? defaultWidth).toString();
            videoIframe.src = url.href;

            if (target.id) {
                videoIframe.id = target.id;
            }

            target.replaceWith(videoIframe);
            target = videoIframe;

            target.dispatchEvent(new CustomEvent('ddg-ctp-replace-element'));
        }

        if (events) {
            if (events.onReady) {
                onReadyListenerByVideoElement.set(target, events.onReady);
            }
            if (events.onStateChange) {
                onStateChangeListenerByVideoElement.set(target, events.onStateChange);
            }
        }

        mockPlayerByVideoElement.set(target, this);
        this.playerInfo = {};
        return this;
    }

    // Stub out the YouTube Iframe API.
    window.YTConfig = {
        host: 'https://www.youtube.com'
    };
    window.YT = {
        loading: 1,
        loaded: 1,
        Player: Player as unknown as YoutubePlayer,
        PlayerState: {
            UNSTARTED: -1,
            ENDED: 0,
            PLAYING: 1,
            PAUSED: 2,
            BUFFERING: 3,
            CUED: 5
        },
        setConfig (configuration) {
            for (const [key, value] of Object.entries(configuration)) {
                window.YTConfig[key as keyof typeof window.YTConfig] = value;
            }
        },
        get: () => {
            // Placeholder
        },
        ready: () => {
            // Placeholder
        },
        scan: () => {
            // Placeholder
        },
        subscribe: () => {
            // Placeholder
        },
        unsubscribe: () => {
            // Placeholder
        }
    };

    /**
     * Load the YouTube Iframe API, replacing the stub.
     * @return {Promise}
     *   Promise which resolves after the API has finished loading.
     */
    function ensureYouTubeIframeAPILoaded (): Promise<void> {
        if (youTubeIframeAPILoaded) {
            return Promise.resolve();
        }

        if (youTubeIframeAPILoadingPromise) {
            return youTubeIframeAPILoadingPromise;
        }

        const loadingPromise = new Promise((resolve) => {
            // The YouTube Iframe API calls the `onYouTubeIframeAPIReady`
            // function to signal that it is ready for use by the website.
            window.onYouTubeIframeAPIReady = resolve;
        }).then(() => {
            window.onYouTubeIframeAPIReady = realOnYouTubeIframeAPIReady;
            realYTPlayer = window.YT?.Player;
            youTubeIframeAPILoaded = true;
            youTubeIframeAPILoadingPromise = undefined;
        });

        // Delete the stub `YT` Object, since its presence will prevent the
        // YouTube Iframe API from loading.
        // Note: There's a chance that website will attempt to reference the
        //       `YT` Object inbetween now and when the script has loaded. This
        //       is unfortunate but unavoidable.
        delete window.YT;

        // Load the YouTube Iframe API.
        const script = document.createElement('script');
        script.src = iframeAPIURL;
        document.body.appendChild(script);

        youTubeIframeAPILoadingPromise = loadingPromise;
        return loadingPromise;
    }

    function onClickToPlayReady () {
        // Signal to the website that the YouTube Iframe API is ready for use,
        // even though it probably is not. That triggers the website to attempt
        // to create any videos that it wants to, which we can then block and
        // replace with placeholders.
        realOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
        if (typeof realOnYouTubeIframeAPIReady === 'function') {
            realOnYouTubeIframeAPIReady();
        }
    }

    function onElementAnnounced (name: string) {
        const onElementAnnouncedHandler = (event: Event) => {
            const {
                target,
                detail: {
                    entity, widgetID: videoID,
                    replaceSettings: { type: replaceType }
                }
            } = event as unknown as OnElementAnnouncedHandlerArgument;

            if (entity !== youtubeEntityName || replaceType !== 'youtube-video') {
                return;
            }
    
            let entry = videoElementsByID.get(videoID);
            if (entry) {
                entry[name] = target;
                videoElementByPlaceholderElement.set(entry.placeholder, entry.video);
                placeholderElementByVideoElement.set(entry.video, entry.placeholder);
                videoElementsByID.delete(videoID);
            } else {
                entry = { [name]: target };
                videoElementsByID.set(videoID, entry);
            }
        };

        return onElementAnnouncedHandler;
    }

    async function onPlaceholderClicked (this: YoutubePlayer, event: Event) {
        const {
            target,
            detail: {
                entity,
                replaceSettings: { type: replaceType }
            }} = event as unknown as OnElementAnnouncedHandlerArgument;

        if (entity !== youtubeEntityName || replaceType !== 'youtube-video') {
            return;
        }

        await ensureYouTubeIframeAPILoaded();

        const mockPlayer = mockPlayerByVideoElement.get(target);
        if (!mockPlayer) {
            return;
        }

        const onReadyListener = onReadyListenerByVideoElement.get(target);
        const onStateChangeListener = onStateChangeListenerByVideoElement.get(target);

        const config: { events: { onStateChange?: unknown, onReady?: (args: unknown) => void}} = { events: { } };
        if (onStateChangeListener) {
            config.events.onStateChange = onStateChangeListener;
        }

        let realPlayer: YoutubePlayer; // eslint-disable-line prefer-const

        config.events.onReady = (...args) => {
            // Make a best attempt at turning the mock `YT.Player` instance into
            // something that behaves the same as the "real" one. Necessary
            // since the website will likely still have a reference to the mock.

            // The methods of `YT.Player` instances are stored directly on the
            // instance, instead of in `YT.Player.__proto__` as would be
            // expected. Copy those over onto the mock, taking care to rebind
            // them so that they behave the same when called.
            //   Instead of copying over raw values, replace them with a
            // getter and setter which act on the value. That way any raw values
            // should stay consistent between a mock and "real" `YT.Player`
            // instance.
            const properties = Object.getOwnPropertyDescriptors(realPlayer);
            for (const [property, descriptor] of Object.entries(properties)) {
                if (Object.prototype.hasOwnProperty.call(descriptor, 'value') &&
                    typeof descriptor.value !== 'function' &&
                    !descriptor.get && !descriptor.set) {
                    // Plain value, replace with getter + setter.
                    delete descriptor.writable;
                    delete descriptor.value;
                    descriptor.get = () => realPlayer[property as keyof YoutubePlayer];
                    descriptor.set = (newValue: unknown) => { realPlayer[property as keyof YoutubePlayer] = newValue as YoutubePlayer[keyof YoutubePlayer]; };
                } else {
                    // Method or getter + setter. Rebind to apply to the "real"
                    // instance.
                    for (const key of ['get', 'set', 'value']) {
                        const value = descriptor[key as keyof typeof descriptor];
                        if (typeof value === 'function') {
                            descriptor[key as keyof typeof descriptor] = value.bind(realPlayer);
                        }
                    }
                }
            }
            delete this.playerInfo;
            Object.defineProperties(mockPlayer, properties);

            // Set the "real" player instance as the prototype of the mock. That
            // way, checks like `instanceof` are more likely to behave as
            // expected.
            mockPlayer.__proto__ = realPlayer; // eslint-disable-line no-proto

            if (onReadyListener) {
                onReadyListener(...args);
            }
        };

        realPlayer = new YoutubePlayer(target, config);

        onReadyListenerByVideoElement.delete(target);
        onStateChangeListenerByVideoElement.delete(target);
    }

    window.addEventListener(
        'ddg-ctp-ready', onClickToPlayReady,
        { once: true }
    );
    window.addEventListener(
        'ddg-ctp-tracking-element', onElementAnnounced('video'),
        { capture: true }
    );
    window.addEventListener(
        'ddg-ctp-placeholder-element', onElementAnnounced('placeholder'),
        { capture: true }
    );
    window.addEventListener(
        'ddg-ctp-placeholder-clicked', onPlaceholderClicked,
        { capture: true }
    );
})();
