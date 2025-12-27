type ScrollTarget = Window | HTMLElement;
type ScrollCallback = (event: Event) => void;

export class ScrollContainer {
	private container: ScrollTarget;
	private scrollListenerCallback: ScrollCallback | null = null;

	constructor(containerSelector?: string) {
		if (containerSelector) {
			const element = document.querySelector<HTMLElement>(containerSelector);
			this.container = element ?? window;
		} else {
			this.container = window;
		}
	}

	addScrollListener(callback: ScrollCallback): void {
		this.scrollListenerCallback = callback;
		this.container.addEventListener('scroll', callback);
	}

	removeScrollListener(): void {
		if (this.scrollListenerCallback) {
			this.container.removeEventListener('scroll', this.scrollListenerCallback);
		}
	}

	getDistanceFromTop(): number {
		if (this.container instanceof Window) {
			return this.container.pageYOffset ?? this.container.scrollY;
		}
		return this.container.scrollTop;
	}

	scrollTo(x: number, y: number): void {
		this.container.scrollTo(x, y);
	}

	getOffsetTop(): number {
		if (this.container instanceof Window) {
			return 0;
		}
		return this.container.offsetTop;
	}
}
