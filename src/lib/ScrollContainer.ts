type ScrollTarget = Window | HTMLElement;

export class ScrollContainer {
	private container: ScrollTarget;
	private scrollListenerCallback: ((event: Event) => void) | null = null;

	constructor(containerSelector: string) {
		let container: ScrollTarget = window;

		if (containerSelector) {
			container = document.querySelector(containerSelector) as HTMLElement || window;
		}

		this.container = container;
	}

	addScrollListener(callback: (event: Event) => void) {
		this.scrollListenerCallback = callback;
		this.container.addEventListener('scroll', callback);
	}

	removeScrollListener() {
		if (this.scrollListenerCallback) {
			this.container.removeEventListener('scroll', this.scrollListenerCallback);
		}
	}

	getDistanceFromTop(): number {
		if (this.container instanceof HTMLElement) {
			return this.container.scrollTop;
		}
		return this.container.scrollY || 0;
	}

	scrollTo(x: number, y: number) {
		this.container.scrollTo(x, y);
	}

	getOffsetTop(): number {
		if (this.container instanceof HTMLElement) {
			return this.container.offsetTop;
		}
		return 0;
	}
}
