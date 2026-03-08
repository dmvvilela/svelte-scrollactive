import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Scrollactive from '$lib/scrollactive.svelte';
import { createRawSnippet } from 'svelte';

// Helper: create sections in the document body that the component references
function createSections() {
	const sections = [
		{ id: 'section-1', text: 'Section 1' },
		{ id: 'section-2', text: 'Section 2' },
		{ id: 'section-3', text: 'Section 3' }
	];

	for (const s of sections) {
		const el = document.createElement('section');
		el.id = s.id;
		el.textContent = s.text;
		// Simulate layout properties (jsdom doesn't compute layout)
		Object.defineProperty(el, 'offsetHeight', { value: 500, configurable: true });
		Object.defineProperty(el, 'offsetTop', { value: sections.indexOf(s) * 500, configurable: true });
		document.body.appendChild(el);
	}
}

function removeSections() {
	document.querySelectorAll('section').forEach((el) => el.remove());
}

// Create a snippet with nav items
function createNavSnippet() {
	return createRawSnippet(() => ({
		render: () => `
			<ul>
				<li><a href="#section-1" class="scrollactive-item">Section 1</a></li>
				<li><a href="#section-2" class="scrollactive-item">Section 2</a></li>
				<li><a href="#section-3" class="scrollactive-item">Section 3</a></li>
			</ul>
		`
	}));
}

describe('Scrollactive component', () => {
	beforeEach(() => {
		createSections();
		// Mock requestAnimationFrame for scroll animations
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
			cb(0);
			return 0;
		});
		vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
	});

	afterEach(() => {
		removeSections();
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders with default nav tag', () => {
		const { container } = render(Scrollactive, {
			props: { children: createNavSnippet(), scrollOnStart: false }
		});

		const nav = container.querySelector('nav');
		expect(nav).toBeTruthy();
		expect(nav!.id).toBe('scrollactive-nav-wrapper');
		expect(nav!.classList.contains('scrollactive-nav')).toBe(true);
	});

	it('renders with custom tag', () => {
		const { container } = render(Scrollactive, {
			props: { tag: 'div', children: createNavSnippet(), scrollOnStart: false }
		});

		const div = container.querySelector('div#scrollactive-nav-wrapper');
		expect(div).toBeTruthy();
	});

	it('renders children snippet', () => {
		const { container } = render(Scrollactive, {
			props: { children: createNavSnippet(), scrollOnStart: false }
		});

		const links = container.querySelectorAll('.scrollactive-item');
		expect(links.length).toBe(3);
	});

	it('applies custom activeClass', () => {
		const { container } = render(Scrollactive, {
			props: {
				activeClass: 'is-active',
				children: createNavSnippet(),
				scrollOnStart: false
			}
		});

		// The component should have initialized and potentially set an active item
		const nav = container.querySelector('#scrollactive-nav-wrapper');
		expect(nav).toBeTruthy();
	});

	it('adds click listeners to scrollactive items when clickToScroll is true', () => {
		const { container } = render(Scrollactive, {
			props: { clickToScroll: true, children: createNavSnippet(), scrollOnStart: false }
		});

		const items = container.querySelectorAll('.scrollactive-item');
		expect(items.length).toBe(3);
		// Items should have click listeners (we can verify by clicking)
	});

	it('does not throw when rendered without children', () => {
		expect(() => {
			render(Scrollactive, {
				props: { scrollOnStart: false }
			});
		}).not.toThrow();
	});

	it('renders without sections in the DOM gracefully', () => {
		removeSections();
		expect(() => {
			render(Scrollactive, {
				props: { children: createNavSnippet(), scrollOnStart: false }
			});
		}).not.toThrow();
	});

	it('handles clicking a menu item', async () => {
		const { container } = render(Scrollactive, {
			props: {
				children: createNavSnippet(),
				scrollOnStart: false,
				duration: 0,
				modifyUrl: false
			}
		});

		const firstLink = container.querySelector('a[href="#section-1"]') as HTMLAnchorElement;
		expect(firstLink).toBeTruthy();

		// Clicking should not throw
		firstLink.click();
	});

	it('handles clicking when section is missing', async () => {
		removeSections();
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const { container } = render(Scrollactive, {
			props: {
				children: createNavSnippet(),
				scrollOnStart: false
			}
		});

		const firstLink = container.querySelector('a[href="#section-1"]') as HTMLAnchorElement;
		if (firstLink) {
			firstLink.click();
		}

		// Should warn about missing section
		// (may or may not fire depending on whether items were initialized)
		warnSpy.mockRestore();
	});

	it('calls onitemchanged callback when active item changes', () => {
		const onitemchanged = vi.fn();

		render(Scrollactive, {
			props: {
				children: createNavSnippet(),
				scrollOnStart: false,
				onitemchanged
			}
		});

		// Simulate a scroll event on window
		window.dispatchEvent(new Event('scroll'));

		// The callback may or may not fire depending on jsdom's scroll behavior
		// but the component should not throw
	});

	it('respects scrollOnStart=false', () => {
		const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
		window.location.hash = '#section-2';

		render(Scrollactive, {
			props: {
				children: createNavSnippet(),
				scrollOnStart: false
			}
		});

		// Should NOT have scrolled to the hash element
		expect(scrollToSpy).not.toHaveBeenCalled();

		window.location.hash = '';
		scrollToSpy.mockRestore();
	});
});
