<script lang="ts">
	import bezierEasing from 'bezier-easing';
	import { ScrollContainer } from './ScrollContainer';
	import {
		forEach,
		getIdFromHash,
		pushHashToUrl,
		getSectionSelector,
		getSectionIdFromElement
	} from './utils/index';
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Active class that will be applied to the active item. */
		activeClass?: string;
		/** Amount of space between top of screen and the section to highlight. */
		offset?: number;
		/** Amount of space between the top of the screen and the section to highlight when clicking. */
		scrollOffset?: number | null;
		/** The selector string of the scroll container element. Defaults to window. */
		scrollContainerSelector?: string;
		/** Enables/disables the scrolling when clicking in a menu item. */
		clickToScroll?: boolean;
		/** The duration of the scroll animation when clicking to scroll is activated. */
		duration?: number;
		/** Defines if the plugin should track the section change when clicking an item to scroll. */
		alwaysTrack?: boolean;
		/** Custom easing value for the click to scroll functionality. */
		bezierEasingValue?: string;
		/** Decides if the URL should be modified with the section id when clicking a scrollactive item. */
		modifyUrl?: boolean;
		/** If true the active class will only be applied when a section matches exactly. */
		exact?: boolean;
		/** If true the active class will be applied to the first item before you scroll past it. */
		highlightFirstItem?: boolean;
		/** Changes the scrollactive container component html tag. */
		tag?: string;
		/** If true the screen will scroll down to the element in the URL when mounted. */
		scrollOnStart?: boolean;
		/** Exported function to scroll with svelte-scrollactive to any element in the page. */
		scrollToElement?: (target: Element) => Promise<void>;
		/** Callback fired when the active item changes. */
		onitemchanged?: (detail: {
			event: Event;
			currentItem: HTMLElement | null;
			lastActiveItem: HTMLElement | null;
		}) => void;
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
		scrollToElement = $bindable(scrollTo),
		onitemchanged,
		children
	}: Props = $props();

	// Keep the bound value in sync
	$effect(() => {
		scrollToElement = scrollTo;
	});

	let observer: MutationObserver | null = null;
	let items: { section: HTMLElement; menuElement: HTMLElement }[] = [];
	let currentItem: HTMLElement | null = null;
	let lastActiveItem: HTMLElement | null = null;
	let scrollAnimationFrame: number | null = null;

	let cubicBezierArray = $derived(bezierEasingValue.split(','));
	let scrollContainer = $derived(new ScrollContainer(scrollContainerSelector));

	onMount(() => {
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
		scrollContainer.removeScrollListener();
		if (scrollAnimationFrame) window.cancelAnimationFrame(scrollAnimationFrame);
	});

	/**
	 * Makes sure the component is recalculated whenever the DOM tree changes inside of the
	 * scrollactive wrapper.
	 */
	function resetOnDOMChange() {
		if (!observer) {
			observer = new MutationObserver(initScrollactiveItems);
			observer.observe(
				document.getElementById('scrollactive-nav-wrapper') as HTMLElement,
				{
					childList: true,
					subtree: true
				}
			);
		}
	}

	/**
	 * Sets the list of menu items, adding or removing the click listener depending on the
	 * clickToScroll prop.
	 */
	function initScrollactiveItems() {
		const elements = document.querySelectorAll('.scrollactive-item');
		const localItems: { section: HTMLElement; menuElement: HTMLElement }[] = [];

		forEach(elements, (menuElement) => {
			const el = menuElement as HTMLElement;
			const section = document.querySelector(getSectionSelector(el)) as HTMLElement | null;
			if (!section) return;

			localItems.push({ section, menuElement: el });
		});

		items = localItems;

		if (clickToScroll) {
			forEach(elements, (element) =>
				element.addEventListener('click', onMenuItemClick)
			);
		} else {
			forEach(elements, (element) =>
				element.removeEventListener('click', onMenuItemClick)
			);
		}
	}

	/**
	 * Will be called when scrolling event is triggered to handle the addition of the active class
	 * in the current section item and fire the change event.
	 */
	function onScroll(event: Event) {
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

	/**
	 * Gets the scrollactive item that corresponds to the current section inside the window
	 */
	function getItemInsideWindow() {
		let currentItem: HTMLElement | undefined;

		forEach(items, ({ menuElement, section }, index) => {
				const isFirstItem = index === 0;
				const distanceFromTop = scrollContainer.getDistanceFromTop();
				const targetOffsetTop = getOffsetTop(section) - offset;
				const isScreenPastSectionStart = distanceFromTop >= targetOffsetTop;
				const isScreenBeforeSectionEnd =
					distanceFromTop < targetOffsetTop + section.offsetHeight;
				const isScreenInsideSection = isScreenPastSectionStart && isScreenBeforeSectionEnd;

				if (isFirstItem && highlightFirstItem) {
					if (isScreenBeforeSectionEnd) currentItem = menuElement;
				}

				if (exact && isScreenInsideSection) currentItem = menuElement;
				if (!exact && isScreenPastSectionStart) currentItem = menuElement;
			}
		);

		return currentItem ?? null;
	}

	/**
	 * Handles the scrolling when clicking a menu item.
	 */
	async function onMenuItemClick(event: Event) {
		event.preventDefault();

		const menuItem = event.target as HTMLAnchorElement;
		const sectionSelector = getSectionSelector(menuItem);
		const section = document.querySelector(sectionSelector);

		if (!section) {
			console.warn(
				`[svelte-scrollactive] Element '${sectionSelector}' was not found. Make sure it is set in the DOM.`
			);

			return;
		}

		if (!alwaysTrack) {
			scrollContainer.removeScrollListener();
			if (scrollAnimationFrame) window.cancelAnimationFrame(scrollAnimationFrame);

			removeActiveClass();
			menuItem.classList.add(activeClass);
		}

		await scrollTo(section);

		if (!alwaysTrack) {
			scrollContainer.addScrollListener(onScroll);
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

	/**
	 * Scrolls the page to the given target element.
	 */
	function scrollTo(target: Element) {
		return new Promise<void>((resolve) => {
			const targetDistanceFromTop = getOffsetTop(target as HTMLElement);
			const startingY = scrollContainer.getDistanceFromTop();
			const distanceFromTarget = targetDistanceFromTop - startingY;
			const easing = bezierEasing(
				...(cubicBezierArray.map(Number) as [number, number, number, number])
			);
			let startingTime: number | null = null;

			const step = (currentTime: number) => {
				if (!startingTime) startingTime = currentTime;

				let progress = currentTime - startingTime;
				let progressPercentage = progress / duration;

				if (progress >= duration) progress = duration;
				if (progressPercentage >= 1) progressPercentage = 1;

				const localOffset = scrollOffset ?? offset;
				const perTick =
					startingY + easing(progressPercentage) * (distanceFromTarget - localOffset);

				scrollContainer.scrollTo(0, perTick);

				if (progress < duration) {
					scrollAnimationFrame = window.requestAnimationFrame(step);
				} else {
					resolve();
				}
			};

			window.requestAnimationFrame(step);
		});
	}

	/**
	 * Gets the top offset position of an element in the document.
	 */
	function getOffsetTop(element: HTMLElement) {
		let yPosition = 0;
		let nextElement: HTMLElement | null = element;

		while (nextElement) {
			yPosition += nextElement.offsetTop;
			nextElement = nextElement.offsetParent as HTMLElement | null;
		}

		if (scrollContainer.getOffsetTop()) {
			yPosition -= scrollContainer.getOffsetTop();
		}

		return yPosition;
	}

	/**
	 * Removes the active class from all scrollactive items.
	 */
	function removeActiveClass() {
		forEach(items, ({ menuElement }) => {
			menuElement.classList.remove(activeClass);
		});
	}

	/**
	 * Scrolls the page to the element passed as a hash in URL, preventing weird native scroll
	 * jumps while maintaining the hash in the URL.
	 */
	function scrollToHashElement() {
		const { hash } = window.location;
		if (!hash) return;

		const hashElement = document.getElementById(getIdFromHash(hash));
		if (!hashElement) return;

		window.location.hash = '';

		setTimeout(() => {
			const yPos = hashElement.offsetTop - offset;

			scrollContainer.scrollTo(0, yPos);
			pushHashToUrl(hash);
		}, 0);
	}
</script>

<svelte:element this={tag} id="scrollactive-nav-wrapper" class="scrollactive-nav">
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
