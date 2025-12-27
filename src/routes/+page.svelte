<script lang="ts">
	import { browser } from '$app/environment';
	import { Scrollactive } from '$lib/index.js';
	import { onMount } from 'svelte';

	let elements: NodeListOf<HTMLAnchorElement> | HTMLAnchorElement[] = $state([]);
	let alwaysTrack = $state(false);
	let duration = $state(600);
	let clickToScroll = $state(true);
	let offset = $state(52);
	let easing = $state('.5,0,.35,1');
	let scrollactiveRef: { scrollToElement: (el: HTMLElement) => Promise<void> } | undefined =
		$state();

	const numberOfElements = $derived(Array.from(elements).length);

	onMount(() => {
		elements = document.querySelectorAll<HTMLAnchorElement>('.scrollactive-item');
	});

	function addNewElement(): void {
		const sectionNumber = numberOfElements + 1;
		const colorClass = numberOfElements % 2 === 0 ? 'is-primary' : 'is-danger';
		const menuItem = document.createElement('div');
		menuItem.innerHTML = `<a href="#section-${sectionNumber}" class="scrollactive-item nav-item">Section ${sectionNumber}</a>`;
		const navCenter = document.querySelector('.nav-center');
		if (navCenter && menuItem.firstChild) {
			navCenter.appendChild(menuItem.firstChild);
		}

		const section = document.createElement('div');
		section.innerHTML = `<section id="section-${sectionNumber}" class="section hero ${colorClass} is-fullheight">
			<div class="container">
				<h1 class="heading title is-1">Section ${sectionNumber}</h1>
			</div>
		</section>`;
		const main = document.querySelector('main');
		if (main && section.firstChild) {
			main.appendChild(section.firstChild);
		}
		elements = document.querySelectorAll<HTMLAnchorElement>('.scrollactive-item');
	}

	function removeElement(): void {
		if (numberOfElements >= 1) {
			const elementsArray = Array.from(elements);
			const lastElement = elementsArray[elementsArray.length - 1];
			if (lastElement) {
				const lastElementId = lastElement.hash;
				const navItem = document.querySelector(`.nav-center a[href="${lastElementId}"]`);
				navItem?.remove();
				const sectionEl = document.querySelector(lastElementId);
				if (sectionEl) {
					document.querySelector('main')?.removeChild(sectionEl);
				}
			}
			elements = document.querySelectorAll<HTMLAnchorElement>('.scrollactive-item');
		}
	}

	function handleScrollToSection3(): void {
		const section = document.querySelector<HTMLElement>('#section-3');
		if (section && scrollactiveRef) {
			scrollactiveRef.scrollToElement(section);
		}
	}
</script>

<div id="app">
	<header id="site-header" class="nav is-fixed">
		<div class="container">
			{#if browser}
				<Scrollactive
					bind:this={scrollactiveRef}
					{offset}
					{alwaysTrack}
					{duration}
					{clickToScroll}
					bezierEasingValue={easing}
					onitemchanged={(detail) => console.log(detail)}
				>
					<ul class="nav-center">
						<li>
							<a href="#section-1" class="scrollactive-item nav-item">Section 1</a>
						</li>
						<li>
							<a href="#section-2" class="scrollactive-item nav-item">Section 2</a>
						</li>
						<li>
							<a href="#section-3" class="scrollactive-item nav-item">Section 3</a>
						</li>
						<li>
							<a href="#section-4" class="scrollactive-item nav-item">Section 4</a>
						</li>
					</ul>
				</Scrollactive>
			{/if}
		</div>
	</header>

	<div class="buttons">
		<button onclick={addNewElement}>Add new element</button>
		<button onclick={removeElement}>Remove last element</button>
		<button onclick={() => (alwaysTrack = !alwaysTrack)}>
			{'Always track ' + (alwaysTrack ? 'on' : 'off')}
		</button>
		<button onclick={() => (clickToScroll = !clickToScroll)}>
			{`Click to scroll ${clickToScroll ? 'on' : 'off'}`}
		</button>
		<button onclick={handleScrollToSection3}>
			{`Scroll to section 3`}
		</button>
		<label for="duration">Duration</label>
		<input type="number" bind:value={duration} id="duration" />
		<label for="offset">Offset</label>
		<input type="number" bind:value={offset} id="offset" />
		<label for="easing">Easing (cubic-bezier format)</label>
		<input type="text" bind:value={easing} id="easing" />
	</div>

	<main>
		<section id="section-1" class="section hero is-primary is-fullheight">
			<div class="container">
				<h1 class="heading title is-1">Section 1</h1>
			</div>
		</section>

		<section id="section-2" class="section hero is-info is-fullheight">
			<div class="container">
				<h1 class="heading title is-1">Section 2</h1>
			</div>
		</section>

		<section id="section-3" class="section hero is-danger is-fullheight">
			<div class="container">
				<h1 class="heading title is-1">Section 3</h1>
			</div>
		</section>

		<section id="section-4" class="section hero is-success is-fullheight">
			<div class="container">
				<h1 class="heading title is-1">Section 4</h1>
			</div>
		</section>
	</main>
</div>

<style>
	.nav.is-fixed {
		position: fixed;
		left: 0;
		right: 0;
	}

	.nav.is-fixed :global(.active) {
		color: #00d1b2;
	}

	.section {
		padding-top: 100px;
	}

	.buttons {
		position: fixed;
		z-index: 10;
		top: 100px;
		right: 100px;
		padding: 15px 30px;
		border-radius: 10px;
		background-color: #fff;
	}

	.buttons label {
		display: block;
	}

	.buttons input,
	.buttons button {
		display: block;
		width: 100%;
		height: 42px;
		padding: 10px 20px;
		margin-top: 15px;
		margin-bottom: 15px;
		border: 2px solid #00d1b2;
		border-radius: 10px;
		font-weight: 600;
		outline: 0;
		transition: all 0.1s;
	}

	.buttons button {
		background-color: #00d1b2;
		cursor: pointer;
		color: #fff;
	}

	.buttons button:hover {
		background-color: #fff;
		color: #00d1b2;
	}
</style>
