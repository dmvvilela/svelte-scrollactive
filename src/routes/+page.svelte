<script lang="ts">
	import { browser } from '$app/environment';
	import { Scrollactive } from '$lib/index';
	import { onMount } from 'svelte';

	let elements: any[] = [];
	let alwaysTrack = false;
	let duration = 600;
	let clickToScroll = true;
	let offset = 52;
	let easing = '.5,0,.35,1';

	$: numberOfElements = elements.length;

	onMount(() => {
		elements = document.querySelectorAll('.scrollactive-item');
	});

	function addNewElement() {
		const sectionNumber = numberOfElements + 1;
		const colorClass = numberOfElements % 2 === 0 ? 'is-primary' : 'is-danger';
		const menuItem = document.createElement('div');
		menuItem.innerHTML = `<a href="#section-${sectionNumber}" class="scrollactive-item nav-item">Section ${sectionNumber}</a>`;
		document.querySelector('.nav-center').appendChild(menuItem.firstChild);

		const section = document.createElement('div');
		section.innerHTML = `<section id="section-${sectionNumber}" class="section hero ${colorClass} is-fullheight">
      <div class="container">
      <h1 class="heading title is-1">Section ${sectionNumber}</h1>
      </div>
      </section>
      `;
		document.querySelector('main').appendChild(section.firstChild);
		elements = document.querySelectorAll('.scrollactive-item');
	}

	function removeElement() {
		if (numberOfElements >= 1) {
			const elementsIds = [].map.call(elements, (el) => el.hash);
			const lastElementId = elementsIds.slice(-1);

			document.querySelector(`.nav-center a[href="${lastElementId}"]`).remove();
			document.querySelector('main').removeChild(document.querySelector(lastElementId));

			elements = document.querySelectorAll('.scrollactive-item');
		}
	}
</script>

<div id="app">
	<header id="site-header" class="nav is-fixed">
		<div class="container">
			{#if browser}
				<Scrollactive
					{offset}
					{alwaysTrack}
					{duration}
					{clickToScroll}
					bezierEasingValue={easing}
					on:itemchanged={(e) => console.log(e.detail)}
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
		<button on:click={addNewElement}>Add new element</button>
		<button on:click={removeElement}>Remove last element</button>
		<button on:click={() => (alwaysTrack = !alwaysTrack)}>
			{'Always track ' + (alwaysTrack ? 'on' : 'off')}
		</button>
		<button on:click={() => (clickToScroll = !clickToScroll)}>
			{`Click to scroll ${clickToScroll ? 'on' : 'off'}`}
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

<style lang="scss">
	.nav.is-fixed {
		position: fixed;
		left: 0;
		right: 0;

		:global(.active) {
			color: #00d1b2;
		}
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
		background-color: #7a7a7a;
		background-color: #fff;

		label {
			display: block;
		}

		input,
		button {
			display: block;
			width: 100%;
			height: 42px;
			padding: 10px 20px;
			margin-top: 15px;
			margin-bottom: 15px;
			border: 0;
			border: 2px solid #00d1b2;
			border-radius: 10px;
			font-weight: 600;
			outline: 0;
			transition: all 0.1s;
		}

		button {
			background-color: #00d1b2;
			cursor: pointer;
			color: #fff;

			&:hover {
				background-color: #fff;
				color: #00d1b2;
			}
		}
	}
</style>
