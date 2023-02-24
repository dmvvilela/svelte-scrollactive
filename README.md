# svelte-scrollactive

## About

This is a port from [vue-scrollactive](https://github.com/eddiemf/vue-scrollactive) to Svelte.

You can check the demo on [REPL](https://svelte.dev/repl/d9616fce34c444d4bcac551cb5bdc0ee?version=3.55.1) and follow the common configuration for the module (check the example code on github repo).

Remember to check if you're on the browser if you're using SvelteKit.

Main differences from the Vue component:
- The default scroll active class is 'active' instead of 'is-active'
- You can use it without direct children (see below for example and why would you use this way).

---

This component makes it simple to highlight a menu item with an 'active' class as you scroll.

- Highlights items with a class as you scroll
- Scrolls to item's section on click
- Configurable easing scroll effect
- Emits events for full control

Make sure to check the [REPL demo](https://svelte.dev/repl/d9616fce34c444d4bcac551cb5bdc0ee?version=3.55.1) where you can play around with every option.

## Installation

Install using `pnpm`

```bash
pnpm add svelte-scrollactive
```

or `yarn`

```bash
yarn add svelte-scrollactive
```

or `npm`

```bash
npm install --save svelte-scrollactive
```

then import the plugin

```js
import { Scrollactive } from 'svelte-scrollactive';
```

## Primary Usage

The primary way to use the plugin is to wrap your menu in a `<Scrollactive>` tag (which will be your nav) and add a `.scrollactive-item` class in your `<a>` tags as I show in the example below:

```js
<Scrollactive class="my-nav">
  <a href="#home" class="scrollactive-item">Home</a>
  <a href="#about-us" class="scrollactive-item">About Us</a>
  <a href="#portfolio" class="scrollactive-item">Portfolio</a>
  <a href="#contact" class="scrollactive-item">Contact</a>
</Scrollactive>
```

You can follow whatever structure you wish, just make sure to set the `.scrollactive-item` class in the items you want to highlight and set its `href` with a valid element ID that you would like to track while scrolling.

The secondary way to use it is almost the same as the primary but instead of relying on `href` to find your sections you'll need to set a data attribute `data-section-selector` on your elements with the section selector you wish to have.

```js
<Scrollactive class="my-nav">
  <span data-section-selector="#home" class="scrollactive-item">Home</span>
  <span data-section-selector=".about-us" class="scrollactive-item">About Us</span>
  <span data-section-selector=".portfolio div span" class="scrollactive-item">Portfolio</span>
  <span data-section-selector="#contact" class="scrollactive-item">Contact</span>
</Scrollactive>
```

As you can see this gives you more freedom to choose different tags and you can use whatever CSS selector you find necessary, but it's important to notice that `data-section-selector` takes precedence over `href`, so if you have a tag `<a href="#section-1" data-section-selector="#another-section">` it will completely ignore the `#section-1` and use `#another-section` instead.

## SvelteKit Usage

You can use the first way with Sveltekit but checking if you're in the browser first. However, this will take long to show your content. So a better way is to load your content from server first (from load function) and add ScrollActive side by side like so:

```js
  import { Scrollactive } from 'svelte-scrollactive';
  import { browser } from '$app/environment';
  import { navigating } from '$app/stores';

  {#if browser}
    {#key $navigating}
      <Scrollactive offset={120} />
    {/key}
  {/if}
  <slot />
```

Be sure to use the nav elements like mentioned above (using the class `scrollactive-item`). But now they can be anywhere in the page.

You can also use `navigating` store with a `key` directive to always update scrollactive when the page changes (and content is updated).

## Events

Scrollactive will emit an `itemchanged(event, currentItem, lastActiveItem)` event when an active menu item is changed to another. You can catch that event doing as the example below:

```js
<Scrollactive class="my-nav" on:itemchanged={onItemChanged}>
  <a href="#home" class="scrollactive-item">Home</a>
  <a href="#about-us" class="scrollactive-item">About Us</a>
  <a href="#portfolio" class="scrollactive-item">Portfolio</a>
  <a href="#contact" class="scrollactive-item">Contact</a>
</Scrollactive>
```

```javascript
function onItemChanged({event, currentItem, lastActiveItem}) {
  // here you have access to everything you need regarding that event
}
```

## Configuration

All options should be passed as a prop in the `<Scrollactive>` component as you can see in the example below:

```js
<Scrollactive activeClass="is-active" offset="80" duration="800" bezierEasingValue=".5,0,.35,1" />
```

Remember that all options are optional and you can check the default values below:

### Options

```javascript
/**
 * Active class that will be applied to the active item.
 */
activeClass: {
  type: String,
  default: 'active',
},

/**
 * Amount of space between top of screen and the section to highlight. (Usually your fixed
 * header's height).
 */
offset: {
  type: Number,
  default: 20,
},

/**
 * Amount of space between the top of the screen and the section to highlight when clicking a
 * scrollactive item to scroll. It will use the value of the `offset` prop if none is provided
 * here. Useful when you want to use the `offset` prop to make an item be active as soon as
 * it shows on the screen but still scroll to the top of the section when clicking the item.
 */
scrollOffset: {
  type: Number,
  default: null,
},

/**
 * The selector string of the scroll container element you'd like to use. It defaults to the
 * window object (most common), but you might want to change in case you're using an element
 * as container with overflow.
 */
scrollContainerSelector: {
  type: String,
  default: '',
},

/**
 * Enables/disables the scrolling when clicking in a menu item.
 * Disable if you'd like to handle the scrolling by your own.
 */
clickToScroll: {
  type: Boolean,
  default: true,
},

/**
 * The duration of the scroll animation when clicking to scroll is activated.
 */
duration: {
  type: Number,
  default: 600,
},

/**
 * Defines if the plugin should track the section change when clicking an item to scroll to
 * its section. If set to true, it will always keep track and change the active class to the
 * current section while scrolling, if false, the active class will be immediately applied to
 * the clicked menu item, ignoring the passed sections until the scrolling is over.
 */
alwaysTrack: {
  type: Boolean,
  default: false,
},

/**
 * Your custom easing value for the click to scroll functionality.
 * It must be a string with 4 values separated by commas in a cubic bezier format.
 */
bezierEasingValue: {
  type: String,
  default: '.5,0,.35,1',
},

/**
 * Decides if the URL should be modified with the section id when clicking a scrollactive
 * item.
 */
modifyUrl: {
  type: Boolean,
  default: true,
},

/**
 * If true the active class will only be applied when a section matches exactly one of the
 * scrollactive items, meaning it will be highlighted when scrolling exactly inside the
 * section. If false (default) it will always highlight the last item which was matched
 * in a section, even if it is already outside that section (and not inside another that's
 * being tracked).
 */
exact: {
  type: Boolean,
  default: false,
},

/**
 * If true the active class will be applied to the first scrollactive-item before you scroll
 * past it (even if you didn't reach it yet).
 */
highlightFirstItem: {
  type: Boolean,
  default: false,
},

/**
 * Changes the scrollactive container component html tag.
 */
tag: {
  type: String,
  default: 'nav',
},

/**
 * If true the screen will scroll down to the element in the URL when the component is mounted.
 */
scrollOnStart: {
  type: Boolean,
  default: true,
},
```

## Contributing

Clone the repository and install the dependencies running `pnpm`. After the dependencies are installed you should be good to run `pnpm dev` which will load up a server with the sandbox for you to play around.
