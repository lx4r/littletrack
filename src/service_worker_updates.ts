import { registerSW } from "virtual:pwa-register";

// https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html#handling-edge-cases
export function enablePeriodicServiceWorkerUpdates(updateIntervalMs: number) {
	registerSW({
		onRegisteredSW(serviceWorkerUrl, registration) {
			registration &&
				setInterval(async () => {
					if (!(!registration.installing && navigator)) {
						return;
					}

					if ("connection" in navigator && !navigator.onLine) {
						return;
					}

					const resp = await fetch(serviceWorkerUrl, {
						cache: "no-store",
						headers: {
							cache: "no-store",
							"cache-control": "no-cache",
						},
					});

					if (resp?.status === 200) {
						await registration.update();
					}
				}, updateIntervalMs);
		},
	});
}
