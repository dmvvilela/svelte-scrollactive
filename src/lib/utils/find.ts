export const find = <T>(
	list: ArrayLike<T>,
	callback: (item: T, index: number, array: T[]) => boolean
): T | undefined => {
	return Array.from(list).find(callback);
};
