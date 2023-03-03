declare global {
	interface Window {
		// ad_status
		google_ad_status?: number;
	
		// amzn_ads
		amznads?: object;
		amzn_ads?: object;
		aax_write?: object;
		aax_render_ad?: object;
	
		// analytics
		GoogleAnalyticsObject?: string;
		ga?: object;
		dataLayer?: {
			hide?: {
				end?: () => void;
			};

			// gtm
			push?: (argument: unknown) => void;
		};

		// api
		cxApi?: Record<string, unknown>;

		// beacon
		udm_?: () => void;
		_comscore?: unknown[]
		COMSCORE?: {
			beacon: () => void;
			purge: () => void;
		}

		// chartbeat
		pSUPERFLY?: object
		pSUPERFLY_mab?: object;

		// fb-sdk
		FB?: {
			api: (url: URL, callback: () => void) => void;
			init: (initiationData: { appId?: string }) => void;
			ui: (parameters: { method?: string, href: string }, callback: (parameters?: object) => void) => void;
			getAccessToken: () => void;
			getAuthResponse: () => { status: string};
			getLoginStatus: (callback: ({ status: string }) => void) => void;
			getUserID: () => void;
			login: (callback: () => void, parameters?: Record<string, unknown>) => void;
			logout: () => void;
			AppEvents: {
				EventNames: Record<string, unknown>;
				logEvent: (a: unknown, b: unknown, c: unknown) => void;
				logPageView: () => void;
			},
			Event: {
				subscribe: (event: string, callback: () => void) => void;
				unsubscribe: () => void;
			},
			XFBML: {
				parse: {
					apply: (XFBML: object, node: Node) => void;
				}
			}
		};
		fbAsyncInit: () => void;

		// ga
		_gat?: Record<string, unknown>;
		_gaq?: Record<string, unknown>;

		// gpt
		googletag?: {
			cmd?: string[];
		}
	}
}

export {};