/**
 * Pushes the given hash to the URL using primarily pushState if available to prevent the
 * scroll from jumping to the hash element. Uses window.location.hash as a fallback.
 */
export const pushHashToUrl = (hash: string): void => {
	if (window.history.pushState) {
		window.history.pushState(null, '', hash);
		return;
	}

	window.location.hash = hash;
};
