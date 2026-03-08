import { describe, it, expect, vi } from 'vitest';
import { forEach } from '$lib/utils/forEach';
import { getIdFromHash } from '$lib/utils/getIdFromHash';
import { getSectionSelector } from '$lib/utils/getSectionSelector';
import { getSectionIdFromElement } from '$lib/utils/getSectionIdFromElement';
import { pushHashToUrl } from '$lib/utils/pushHashToUrl';

describe('forEach', () => {
	it('iterates over an array', () => {
		const items = ['a', 'b', 'c'];
		const results: string[] = [];
		forEach(items, (item) => results.push(item));
		expect(results).toEqual(['a', 'b', 'c']);
	});

	it('passes index to callback', () => {
		const items = ['x', 'y'];
		const indices: number[] = [];
		forEach(items, (_item, index) => indices.push(index));
		expect(indices).toEqual([0, 1]);
	});

	it('works with NodeList-like objects', () => {
		const div = document.createElement('div');
		div.innerHTML = '<span>1</span><span>2</span><span>3</span>';
		const spans = div.querySelectorAll('span');
		const texts: string[] = [];
		forEach(spans, (el) => texts.push(el.textContent!));
		expect(texts).toEqual(['1', '2', '3']);
	});

	it('handles empty lists', () => {
		const callback = vi.fn();
		forEach([], callback);
		expect(callback).not.toHaveBeenCalled();
	});
});

describe('getIdFromHash', () => {
	it('removes the # prefix', () => {
		expect(getIdFromHash('#section-1')).toBe('section-1');
	});

	it('handles encoded characters', () => {
		expect(getIdFromHash('#my%20section')).toBe('my section');
	});

	it('returns empty string for just #', () => {
		expect(getIdFromHash('#')).toBe('');
	});
});

describe('getSectionSelector', () => {
	it('returns selector from data-section-selector attribute', () => {
		const el = document.createElement('a');
		el.dataset.sectionSelector = '.my-section';
		expect(getSectionSelector(el)).toBe('.my-section');
	});

	it('returns selector from hash', () => {
		const el = document.createElement('a');
		el.setAttribute('href', '#section-2');
		// In jsdom, setting href on an <a> sets the hash
		expect(getSectionSelector(el)).toBe('#section-2');
	});

	it('prefers data-section-selector over hash', () => {
		const el = document.createElement('a');
		el.setAttribute('href', '#section-2');
		el.dataset.sectionSelector = '.custom-section';
		expect(getSectionSelector(el)).toBe('.custom-section');
	});

	it('returns empty string when no hash or data attribute', () => {
		const el = document.createElement('div');
		expect(getSectionSelector(el as unknown as HTMLAnchorElement)).toBe('');
	});
});

describe('getSectionIdFromElement', () => {
	it('returns data-section-selector when it starts with #', () => {
		const el = document.createElement('a');
		el.dataset.sectionSelector = '#custom-id';
		expect(getSectionIdFromElement(el)).toBe('#custom-id');
	});

	it('returns hash when no data-section-selector with #', () => {
		const el = document.createElement('a');
		el.setAttribute('href', '#section-3');
		expect(getSectionIdFromElement(el)).toContain('section-3');
	});

	it('falls back to hash when data-section-selector does not start with #', () => {
		const el = document.createElement('a');
		el.setAttribute('href', '#section-1');
		el.dataset.sectionSelector = '.not-a-hash';
		expect(getSectionIdFromElement(el)).toContain('section-1');
	});
});

describe('pushHashToUrl', () => {
	it('uses pushState to set hash', () => {
		const spy = vi.spyOn(window.history, 'pushState');
		pushHashToUrl('#test-section');
		expect(spy).toHaveBeenCalledWith(null, '', '#test-section');
		spy.mockRestore();
	});
});
