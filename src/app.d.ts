/// <reference types="@sveltejs/kit" />

declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

declare module 'bezier-easing' {
	function bezierEasing(x1: number, y1: number, x2: number, y2: number): (t: number) => number;
	export default bezierEasing;
}
