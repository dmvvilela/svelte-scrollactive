<script lang="ts">
	import bezierEasing from 'bezier-easing';
	import { ScrollContainer } from './ScrollContainer.js';
	import {
		forEach,
		getIdFromHash,
		pushHashToUrl,
		getSectionSelector,
		getSectionIdFromElement
	} from './utils/index.js';
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	interface ScrollactiveItem {
		section: HTMLElement;
		menuElement: HTMLAnchorElement;
	}

	interface ItemChangedDetail {
		event: Event;
		currentItem: HTMLAnchorElement | null;
		lastActiveItem: HTMLAnchorElement | null;
	}

	interface Props {
		/** Active class that will be applied to the active item. */
		activeClass?: string;
		/** Amount of space between top of screen and the section to highlight. (Usually your fixed header's height). */
		offset?: number;
		/** Amount of space between the top of the screen and the section to highlight when clicking a scrollactive item to scroll. */
		scrollOffset?: number | null;
		/** The selector string of the scroll container element you'd like to use. Defaults to window. */
		scrollContainerSelector?: string;
		/** Enables/disables the scrolling when clicking in a menu item. */
		clickToScroll?: boolean;
		/** The duration of the scroll animation when clicking to scroll is activated. */
		duration?: number;
		/** Defines if the plugin should track the section change when clicking an item to scroll to its section. */
		alwaysTrack?: boolean;
		/** Your custom easing value for the click to scroll functionality (cubic bezier format). */
		bezierEasingValue?: string;
		/** Decides if the URL should be modified with the section id when clicking a scrollactive item. */
		modifyUrl?: boolean;
		/** If true the active class will only be applied when a section matches exactly one of the scrollactive items. */
		exact?: boolean;
		/** If true the active class will be applied to the first scrollactive-item before you scroll past it. */
		highlightFirstItem?: boolean;
		/** Changes the scrollactive container component html tag. */
		tag?: string;
		/** If true the screen will scroll down to the element in the URL when the component is mounted. */
		scrollOnStart?: boolean;
		/** Callback fired when the active item changes. */
		onitemchanged?: (detail: ItemChangedDetail) => void;
		/** Slot content */
		children?: Snippet;
	}

	let {
		activeClass = 'active',
		offset = 20,
		scrollOffset = null,
		scrollContainerSelector = '',
		clickToScroll = true,
		duration = 600,
		alwaysTrack = false,
		bezierEasingValue = '.5,0,.35,1',
		modifyUrl = true,
		exact = false,
		highlightFirstItem = false,
		tag = 'nav',
		scrollOnStart = true,
		onitemchanged,
		children
	}: Props = $props();

	let observer: MutationObserver | null = null;
	let items: ScrollactiveItem[] = $state([]);
	let currentItem: HTMLAnchorElement | null = $state(null);
	let lastActiveItem: HTMLAnchorElement | null = $state(null);
	let scrollAnimationFrame: number | null = null;
	let scrollContainer: ScrollContainer | null = $state(null);

	const cubicBezierArray = $derived(
		bezierEasingValue.split(',').map((v) => parseFloat(v.trim())) as [
			number,
			number,
			number,
			number
		]
	);

	export function scrollToElement(target: HTMLElement): Promise<void> {
		return scrollTo(target);
	}

	onMount(() => {
		scrollContainer = new ScrollContainer(scrollContainerSelector);
		resetOnDOMChange();
		initScrollactiveItems();
		removeActiveClass();
		currentItem = getItemInsideWindow();

		if (currentItem) currentItem.classList.add(activeClass);

		if (scrollOnStart) scrollToHashElement();

		scrollContainer.addScrollListener(onScroll);
	});

	$effect(() => {
		initScrollactiveItems();
	});

	onDestroy(() => {
		scrollContainer?.removeScrollListener();
		if (scrollAnimationFrame) {
			window.cancelAnimationFrame(scrollAnimationFrame);
		}
		if (observer) {
			observer.disconnect();
		}
	});

	function resetOnDOMChange(): void {
		if (!observer) {
			observer = new MutationObserver(initScrollactiveItems);
			const wrapper = document.getElementById('scrollactive-nav-wrapper');
			if (wrapper) {
				observer.observe(wrapper, {
					childList: true,
					subtree: true
				});
			}
		}
	}

	function initScrollactiveItems(): void {
		const elements = document.querySelectorAll<HTMLAnchorElement>('.scrollactive-item');
		const localItems: ScrollactiveItem[] = [];

		forEach(elements, (menuElement) => {
			const section = document.querySelector<HTMLElement>(getSectionSelector(menuElement));
			if (!section) return;

			localItems.push({ section, menuElement });
		});

		items = localItems;

		if (clickToScroll) {
			forEach(elements, (element) => element.addEventListener('click', onMenuItemClick));
		} else {
			forEach(elements, (element) => element.removeEventListener('click', onMenuItemClick));
		}
	}

	function onScroll(event: Event): void {
		currentItem = getItemInsideWindow();
		const sectionHasChanged = currentItem !== lastActiveItem;

		if (sectionHasChanged) {
			removeActiveClass();
			onitemchanged?.({
				event,
				currentItem,
				lastActiveItem
			});
			lastActiveItem = currentItem;
		}

		if (currentItem) currentItem.classList.add(activeClass);
	}

	function getItemInsideWindow(): HTMLAnchorElement | null {
		let result: HTMLAnchorElement | null = null;

		forEach(items, ({ menuElement, section }, index) => {
			const isFirstItem = index === 0;
			const distanceFromTop = scrollContainer?.getDistanceFromTop() ?? 0;
			const targetOffsetTop = getOffsetTop(section) - offset;
			const isScreenPastSectionStart = distanceFromTop >= targetOffsetTop;
			const isScreenBeforeSectionEnd = distanceFromTop < targetOffsetTop + section.offsetHeight;
			const isScreenInsideSection = isScreenPastSectionStart && isScreenBeforeSectionEnd;

			if (isFirstItem && highlightFirstItem) {
				if (isScreenBeforeSectionEnd) result = menuElement;
			}

			if (exact && isScreenInsideSection) result = menuElement;
			if (!exact && isScreenPastSectionStart) result = menuElement;
		});

		return result;
	}

	async function onMenuItemClick(event: Event): Promise<void> {
		event.preventDefault();

		const menuItem = event.target as HTMLAnchorElement;
		const sectionSelector = getSectionSelector(menuItem);
		const section = document.querySelector<HTMLElement>(sectionSelector);

		if (!section) {
			console.warn(
				`[svelte-scrollactive] Element '${sectionSelector}' was not found. Make sure it is set in the DOM.`
			);
			return;
		}

		if (!alwaysTrack) {
			scrollContainer?.removeScrollListener();
			if (scrollAnimationFrame) {
				window.cancelAnimationFrame(scrollAnimationFrame);
			}

			removeActiveClass();
			menuItem.classList.add(activeClass);
		}

		await scrollTo(section);

		if (!alwaysTrack) {
			scrollContainer?.addScrollListener(onScroll);
			currentItem = menuItem;

			if (currentItem !== lastActiveItem) {
				onitemchanged?.({
					event,
					currentItem,
					lastActiveItem
				});
				lastActiveItem = currentItem;
			}
		}

		if (modifyUrl) {
			pushHashToUrl(getSectionIdFromElement(menuItem));
		}
	}

	function scrollTo(target: HTMLElement): Promise<void> {
		return new Promise<void>((resolve) => {
			const targetDistanceFromTop = getOffsetTop(target);
			const startingY = scrollContainer?.getDistanceFromTop() ?? 0;
			const distanceFromTarget = targetDistanceFromTop - startingY;
			const easing = bezierEasing(...cubicBezierArray);
			let startingTime: number | null = null;

			const step = (currentTime: number): void => {
				if (!startingTime) startingTime = currentTime;

				let progress = currentTime - startingTime;
				let progressPercentage = progress / duration;

				if (progress >= duration) progress = duration;
				if (progressPercentage >= 1) progressPercentage = 1;

				const localOffset = scrollOffset ?? offset;
				const perTick = startingY + easing(progressPercentage) * (distanceFromTarget - localOffset);

				scrollContainer?.scrollTo(0, perTick);

				if (progress < duration) {
					scrollAnimationFrame = window.requestAnimationFrame(step);
				} else {
					resolve();
				}
			};

			window.requestAnimationFrame(step);
		});
	}

	function getOffsetTop(element: HTMLElement): number {
		let yPosition = 0;
		let nextElement: HTMLElement | null = element;

		while (nextElement) {
			yPosition += nextElement.offsetTop;
			nextElement = nextElement.offsetParent as HTMLElement | null;
		}

		const containerOffset = scrollContainer?.getOffsetTop() ?? 0;
		if (containerOffset) {
			yPosition -= containerOffset;
		}

		return yPosition;
	}

	function removeActiveClass(): void {
		forEach(items, ({ menuElement }) => {
			menuElement.classList.remove(activeClass);
		});
	}

	function scrollToHashElement(): void {
		const { hash } = window.location;
		if (!hash) return;

		const hashElement = document.getElementById(getIdFromHash(hash));
		if (!hashElement) return;

		window.location.hash = '';

		setTimeout(() => {
			const yPos = hashElement.offsetTop - offset;

			scrollContainer?.scrollTo(0, yPos);
			pushHashToUrl(hash);
		}, 0);
	}
</script>

<svelte:element this={tag} id="scrollactive-nav-wrapper" class="scrollactive-nav">
	{@render children?.()}
</svelte:element>
