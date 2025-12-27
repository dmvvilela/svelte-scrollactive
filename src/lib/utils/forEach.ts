export const forEach = <T>(
	list: ArrayLike<T>,
	callback: (item: T, index: number, array: T[]) => void
): void => {
	Array.from(list).forEach(callback);
};
