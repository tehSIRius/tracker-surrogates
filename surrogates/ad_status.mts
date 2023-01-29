declare global {
    interface Window {
        google_ad_status?: number;
    }
}

(() => {
    'use strict';
    window.google_ad_status = 1;
})();
