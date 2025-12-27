export const getSectionIdFromElement = (element: HTMLAnchorElement): string => {
	if (element.dataset.sectionSelector && element.dataset.sectionSelector.startsWith('#')) {
		return element.dataset.sectionSelector;
	}

	return element.hash;
};
