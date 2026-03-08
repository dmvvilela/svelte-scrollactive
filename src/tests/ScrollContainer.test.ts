import { describe, it, expect, vi } from 'vitest';
import { ScrollContainer } from '$lib/ScrollContainer';

describe('ScrollContainer', () => {
	describe('constructor', () => {
		it('defaults to window when no selector provided', () => {
			const sc = new ScrollContainer('');
			// getOffsetTop returns 0 for window
			expect(sc.getOffsetTop()).toBe(0);
		});

		it('uses element when valid selector provided', () => {
			const div = document.createElement('div');
			div.id = 'scroll-box';
			document.body.appendChild(div);

			const sc = new ScrollContainer('#scroll-box');
			expect(sc.getOffsetTop()).toBe(0); // offsetTop is 0 in jsdom
			document.body.removeChild(div);
		});

		it('falls back to window when selector not found', () => {
			const sc = new ScrollContainer('#nonexistent');
			expect(sc.getOffsetTop()).toBe(0);
		});
	});

	describe('scroll listener', () => {
		it('adds and removes scroll listener', () => {
			const sc = new ScrollContainer('');
			const callback = vi.fn();

			const addSpy = vi.spyOn(window, 'addEventListener');
			sc.addScrollListener(callback);
			expect(addSpy).toHaveBeenCalledWith('scroll', callback);

			const removeSpy = vi.spyOn(window, 'removeEventListener');
			sc.removeScrollListener();
			expect(removeSpy).toHaveBeenCalledWith('scroll', callback);

			addSpy.mockRestore();
			removeSpy.mockRestore();
		});

		it('removeScrollListener is safe to call without addScrollListener', () => {
			const sc = new ScrollContainer('');
			expect(() => sc.removeScrollListener()).not.toThrow();
		});
	});

	describe('getDistanceFromTop', () => {
		it('returns scrollY for window container', () => {
			const sc = new ScrollContainer('');
			// jsdom scrollY defaults to 0
			expect(sc.getDistanceFromTop()).toBe(0);
		});

		it('returns scrollTop for element container', () => {
			const div = document.createElement('div');
			div.id = 'scrollable';
			document.body.appendChild(div);

			const sc = new ScrollContainer('#scrollable');
			expect(sc.getDistanceFromTop()).toBe(0);
			document.body.removeChild(div);
		});
	});

	describe('scrollTo', () => {
		it('calls scrollTo on the container', () => {
			const sc = new ScrollContainer('');
			const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
			sc.scrollTo(0, 100);
			expect(spy).toHaveBeenCalledWith(0, 100);
			spy.mockRestore();
		});
	});
});
