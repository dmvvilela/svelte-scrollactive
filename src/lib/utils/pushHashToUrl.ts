export const pushHashToUrl = (hash: string): void => {
	if (window.history.pushState) {
		window.history.pushState(null, '', hash);
		return;
	}

	window.location.hash = hash;
};
