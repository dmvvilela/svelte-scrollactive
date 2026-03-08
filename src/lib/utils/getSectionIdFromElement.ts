export const getSectionIdFromElement = (element: HTMLAnchorElement | HTMLElement): string => {
	const dataset = (element as HTMLElement).dataset;
	if (dataset.sectionSelector && dataset.sectionSelector.startsWith('#')) {
		return dataset.sectionSelector;
	}

	return (element as HTMLAnchorElement).hash;
};
