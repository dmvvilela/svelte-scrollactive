import { getIdFromHash } from './getIdFromHash.js';

export const getSectionSelector = (element: HTMLAnchorElement): string => {
	if (element.dataset.sectionSelector) return element.dataset.sectionSelector;
	if (element.hash) return `#${getIdFromHash(element.hash)}`;

	return '';
};
