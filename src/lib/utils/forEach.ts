export const forEach = <T>(
	list: ArrayLike<T>,
	callback: (item: T, index: number, array: ArrayLike<T>) => void
) => [].forEach.call(list, callback);
