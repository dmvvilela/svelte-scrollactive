<script lang="ts">
	// @ts-ignore
	import bezierEasing from 'bezier-easing';
	import { ScrollContainer } from './ScrollContainer';
	import {
		forEach,
		find,
		getIdFromHash,
		pushHashToUrl,
		getSectionSelector,
		getSectionIdFromElement
	} from './utils/index';
	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	/**
	 * Active class that will be applied to the active item.
	 */
	export let activeClass = 'active';

	/**
	 * Amount of space between top of screen and the section to highlight. (Usually your fixed
	 * header's height).
	 */
	export let offset = 20;

	/**
	 * Amount of space between the top of the screen and the section to highlight when clicking a
	 * scrollactive item to scroll. It will use the value of the `offset` prop if none is provided
	 * here. Useful when you want to use the `offset` prop to make an item be active as soon as
	 * it shows on the screen but still scroll to the top of the section when clicking the item.
	 */
	export let scrollOffset: any = null;

	/**
	 * The selector string of the scroll container element you'd like to use. It defaults to the
	 * window object (most common), but you might want to change in case you're using an element
	 * as container with overflow.
	 */
	export let scrollContainerSelector = '';

	/**
	 * Enables/disables the scrolling when clicking in a menu item.
	 * Disable if you'd like to handle the scrolling by your own.
	 */
	export let clickToScroll = true;

	/**
	 * The duration of the scroll animation when clicking to scroll is activated.
	 */
	export let duration = 600;

	/**
	 * Defines if the plugin should track the section change when clicking an item to scroll to
	 * its section. If set to true, it will always keep track and change the active class to the
	 * current section while scrolling, if false, the active class will be immediately applied to
	 * the clicked menu item, ignoring the passed sections until the scrolling is over.
	 */
	export let alwaysTrack = false;

	/**
	 * Your custom easing value for the click to scroll functionality.
	 * It must be a string with 4 values separated by commas in a cubic bezier format.
	 */
	export let bezierEasingValue = '.5,0,.35,1';

	/**
	 * Decides if the URL should be modified with the section id when clicking a scrollactive
	 * item.
	 */
	export let modifyUrl = true;

	/**
	 * If true the active class will only be applied when a section matches exactly one of the
	 * scrollactive items, meaning it will be highlighted when scrolling exactly inside the
	 * section. If false (default) it will always highlight the last item which was matched
	 * in a section, even if it is already outside that section (and not inside another that's
	 * being tracked).
	 */
	export let exact = false;

	/**
	 * If true the active class will be applied to the first scrollactive-item before you scroll
	 * past it (even if you didn't reach it yet).
	 */
	export let highlightFirstItem = false;

	/**
	 * Changes the scrollactive container component html tag.
	 */
	export let tag = 'nav';

	/**
	 * If true the screen will scroll down to the element in the URL when the component is mounted.
	 */
	export let scrollOnStart = true;

	/**
	 * Exported function so the user can choose when to call this.
	 */
	export const scrollToHash = () => scrollToHashElement();

	let observer: any = null;
	let items: any[] = [];
	let currentItem = null;
	let lastActiveItem: any = null;
	let scrollAnimationFrame: any = null;

	$: cubicBezierArray = bezierEasingValue.split(',');
	$: scrollContainer = new ScrollContainer(scrollContainerSelector);

	onMount(() => {
		resetOnDOMChange();
		initScrollactiveItems();
		removeActiveClass();
		currentItem = getItemInsideWindow() as any;

		if (currentItem) currentItem.classList.add(activeClass);

		if (scrollOnStart) scrollToHashElement();

		scrollContainer.addScrollListener(onScroll);
	});

	afterUpdate(() => {
		initScrollactiveItems();
	});

	onDestroy(() => {
		scrollContainer.removeScrollListener();
		window.cancelAnimationFrame(scrollAnimationFrame);
	});

	/**
	 * Makes sure the component is recalculated whenever the DOM tree changes inside of the
	 * scrollactive wrapper.
	 */
	function resetOnDOMChange() {
		const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		if (!observer) {
			observer = new MutationObserver(initScrollactiveItems);
			// Calls initScrollactiveItems() whenever the DOM tree is changed inside of the wrapper
			observer.observe(document.getElementById('scrollactive-nav-wrapper'), {
				childList: true,
				subtree: true
			});
		}
	}

	/**
	 * Sets the list of menu items, adding or removing the click listener depending on the
	 * clickToScroll prop.
	 */
	function initScrollactiveItems() {
		const elements = document.querySelectorAll('.scrollactive-item');
		const localItems: any[] = [];

		forEach(elements, (menuElement) => {
			const section = document.querySelector(getSectionSelector(menuElement));
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

	/**
	 * Will be called when scrolling event is triggered to handle the addition of the active class
	 * in the current section item and fire the change event.
	 */
	function onScroll(event) {
		currentItem = getItemInsideWindow();
		const sectionHasChanged = currentItem !== lastActiveItem;

		if (sectionHasChanged) {
			removeActiveClass();
			dispatch('itemchanged', {
				event,
				currentItem,
				lastActiveItem
			});
			lastActiveItem = currentItem;
		}

		// Check first because item might be null if not inside any section
		if (currentItem) currentItem.classList.add(activeClass);
	}

	/**
	 * Gets the scrollactive item that corresponds to the current section inside the window
	 */
	function getItemInsideWindow() {
		let currentItem;

		forEach(items, ({ menuElement, section }, index) => {
			const isFirstItem = index === 0;
			const distanceFromTop = scrollContainer.getDistanceFromTop();
			const targetOffsetTop = getOffsetTop(section) - offset;
			const isScreenPastSectionStart = distanceFromTop >= targetOffsetTop;
			const isScreenBeforeSectionEnd = distanceFromTop < targetOffsetTop + section.offsetHeight;
			const isScreenInsideSection = isScreenPastSectionStart && isScreenBeforeSectionEnd;

			if (isFirstItem && highlightFirstItem) {
				if (isScreenBeforeSectionEnd) currentItem = menuElement;
			}

			if (exact && isScreenInsideSection) currentItem = menuElement;
			if (!exact && isScreenPastSectionStart) currentItem = menuElement;
		});

		return currentItem;
	}

	/**
	 * Handles the scrolling when clicking a menu item.
	 */
	async function onMenuItemClick(event) {
		event.preventDefault();

		const menuItem = event.target;
		const sectionSelector = getSectionSelector(menuItem);
		const section = document.querySelector(sectionSelector);

		if (!section) {
			console.warn(
				`[svelte-scrollactive] Element '${sectionSelector}' was not found. Make sure it is set in the DOM.`
			);

			return;
		}

		/**
		 *  Temporarily removes the scroll listener and the request animation frame so the active
		 *  class will only be applied to the clicked element, and not all elements while the window
		 *  is scrolling.
		 */
		if (!alwaysTrack) {
			scrollContainer.removeScrollListener();
			window.cancelAnimationFrame(scrollAnimationFrame);

			removeActiveClass();
			menuItem.classList.add(activeClass);
		}

		await scrollTo(section);

		if (!alwaysTrack) {
			scrollContainer.addScrollListener(onScroll);
			currentItem = menuItem;

			if (currentItem !== lastActiveItem) {
				dispatch('itemchanged', {
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
	function scrollTo(target: any) {
		return new Promise<void>((resolve) => {
			const targetDistanceFromTop = getOffsetTop(target);
			const startingY = scrollContainer.getDistanceFromTop();
			const distanceFromTarget = targetDistanceFromTop - startingY;
			const easing = bezierEasing(...cubicBezierArray);
			let startingTime: number | null = null;

			const step = (currentTime: number) => {
				if (!startingTime) startingTime = currentTime;

				let progress = currentTime - startingTime;
				let progressPercentage = progress / duration;

				if (progress >= duration) progress = duration;
				if (progressPercentage >= 1) progressPercentage = 1;

				const localOffset = scrollOffset || offset;
				const perTick = startingY + easing(progressPercentage) * (distanceFromTarget - localOffset);

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
	function getOffsetTop(element: any) {
		let yPosition = 0;
		let nextElement = element;

		while (nextElement) {
			yPosition += nextElement.offsetTop;
			nextElement = nextElement.offsetParent;
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
		// Must be called with 'call' to prevent bugs on some devices
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

		window.location.hash = ''; // Clears the hash to prevent scroll from jumping

		setTimeout(() => {
			const yPos = hashElement.offsetTop - offset;

			scrollContainer.scrollTo(0, yPos);
			// Sets the hash back with pushState so it won't jump to the element ignoring the offset
			pushHashToUrl(hash);
		}, 0);
	}
</script>

<component :is="tag" id="scrollactive-nav-wrapper" class="scrollactive-nav">
	<slot />
</component>
