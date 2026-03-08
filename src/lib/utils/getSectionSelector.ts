import { getIdFromHash } from './getIdFromHash';

export const getSectionSelector = (element: HTMLAnchorElement | HTMLElement): string => {
	if ((element as HTMLElement).dataset.sectionSelector) {
		return (element as HTMLElement).dataset.sectionSelector!;
	}
	if ((element as HTMLAnchorElement).hash) {
		return `#${getIdFromHash((element as HTMLAnchorElement).hash)}`;
	}

	return '';
};
