# svelte-scrollactive

## About

This is a port from [vue-scrollactive](https://github.com/eddiemf/vue-scrollactive) to Svelte 5.

Main differences from the Vue component:
- The default scroll active class is 'active' instead of 'is-active'
- You can use it without direct children (see below for example and why would you use this way).
- There is a bindable `scrollToElement` prop so that you can scroll programmatically.

---

This component makes it simple to highlight a menu item with an 'active' class as you scroll.

- Highlights items with a class as you scroll
- Scrolls to item's section on click
- Configurable easing scroll effect
- Callback props for full control

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

then import the component

```svelte
<script>
  import { Scrollactive } from 'svelte-scrollactive';
</script>
```

## Primary Usage

The primary way to use the plugin is to wrap your menu in a `<Scrollactive>` tag (which will be your nav) and add a `.scrollactive-item` class in your `<a>` tags as I show in the example below:

```svelte
<Scrollactive class="my-nav">
  <a href="#home" class="scrollactive-item">Home</a>
  <a href="#about-us" class="scrollactive-item">About Us</a>
  <a href="#portfolio" class="scrollactive-item">Portfolio</a>
  <a href="#contact" class="scrollactive-item">Contact</a>
</Scrollactive>
```

You can follow whatever structure you wish, just make sure to set the `.scrollactive-item` class in the items you want to highlight and set its `href` with a valid element ID that you would like to track while scrolling.

The secondary way to use it is almost the same as the primary but instead of relying on `href` to find your sections you'll need to set a data attribute `data-section-selector` on your elements with the section selector you wish to have.

```svelte
<Scrollactive class="my-nav">
  <span data-section-selector="#home" class="scrollactive-item">Home</span>
  <span data-section-selector=".about-us" class="scrollactive-item">About Us</span>
  <span data-section-selector=".portfolio div span" class="scrollactive-item">Portfolio</span>
  <span data-section-selector="#contact" class="scrollactive-item">Contact</span>
</Scrollactive>
```

As you can see this gives you more freedom to choose different tags and you can use whatever CSS selector you find necessary, but it's important to notice that `data-section-selector` takes precedence over `href`, so if you have a tag `<a href="#section-1" data-section-selector="#another-section">` it will completely ignore the `#section-1` and use `#another-section` instead.

## SvelteKit Usage

You can use the first way with SvelteKit but checking if you're in the browser first. However, this will take long to show your content. So a better way is to load your content from server first (from load function) and add Scrollactive side by side like so:

```svelte
<script>
  import { Scrollactive } from 'svelte-scrollactive';
  import { browser } from '$app/environment';
  import { navigating } from '$app/stores';

  let { children } = $props();
</script>

{#if browser}
  {#key $navigating}
    <Scrollactive offset={120} />
  {/key}
{/if}
{@render children()}
```

Be sure to use the nav elements like mentioned above (using the class `scrollactive-item`). But now they can be anywhere in the page.

You can also use the `navigating` store with a `{#key}` block to always update scrollactive when the page changes (and content is updated).

## Events

Scrollactive accepts an `onitemchanged` callback prop that fires when the active menu item changes. You can use it like this:

```svelte
<Scrollactive class="my-nav" {onitemchanged}>
  <a href="#home" class="scrollactive-item">Home</a>
  <a href="#about-us" class="scrollactive-item">About Us</a>
  <a href="#portfolio" class="scrollactive-item">Portfolio</a>
  <a href="#contact" class="scrollactive-item">Contact</a>
</Scrollactive>
```

```javascript
function onitemchanged(event, currentItem, lastActiveItem) {
  // here you have access to everything you need regarding that event
}
```

## Configuration

All options should be passed as a prop in the `<Scrollactive>` component as you can see in the example below:

```svelte
<Scrollactive activeClass="is-active" offset={80} duration={800} bezierEasingValue=".5,0,.35,1" />
```

Remember that all options are optional and you can check the default values below:

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeClass` | `string` | `'active'` | Active class that will be applied to the active item. |
| `offset` | `number` | `20` | Amount of space between top of screen and the section to highlight. (Usually your fixed header's height). |
| `scrollOffset` | `number \| null` | `null` | Amount of space between the top of the screen and the section to highlight when clicking a scrollactive item to scroll. It will use the value of `offset` if none is provided. Useful when you want to use `offset` to make an item be active as soon as it shows on the screen but still scroll to the top of the section when clicking the item. |
| `scrollContainerSelector` | `string` | `''` | The selector string of the scroll container element you'd like to use. Defaults to the window object (most common), but you might want to change in case you're using an element as container with overflow. |
| `clickToScroll` | `boolean` | `true` | Enables/disables the scrolling when clicking in a menu item. Disable if you'd like to handle the scrolling by your own. |
| `duration` | `number` | `600` | The duration of the scroll animation when clicking to scroll is activated. |
| `alwaysTrack` | `boolean` | `false` | Defines if the plugin should track the section change when clicking an item to scroll to its section. If `true`, it will always keep track and change the active class to the current section while scrolling. If `false`, the active class will be immediately applied to the clicked menu item, ignoring the passed sections until the scrolling is over. |
| `bezierEasingValue` | `string` | `'.5,0,.35,1'` | Your custom easing value for the click to scroll functionality. It must be a string with 4 values separated by commas in a cubic bezier format. |
| `modifyUrl` | `boolean` | `true` | Decides if the URL should be modified with the section id when clicking a scrollactive item. |
| `exact` | `boolean` | `false` | If `true` the active class will only be applied when a section matches exactly one of the scrollactive items. If `false` it will always highlight the last item which was matched in a section, even if it is already outside that section. |
| `highlightFirstItem` | `boolean` | `false` | If `true` the active class will be applied to the first scrollactive-item before you scroll past it (even if you didn't reach it yet). |
| `tag` | `string` | `'nav'` | Changes the scrollactive container component html tag. |
| `scrollOnStart` | `boolean` | `true` | If `true` the screen will scroll down to the element in the URL when the component is mounted. |
| `scrollToElement` | `$bindable` | — | Bindable prop that exposes a function to programmatically scroll to any element on the page. Use with `bind:scrollToElement`. |
| `onitemchanged` | `function` | — | Callback fired when the active item changes. Receives `(event, currentItem, lastActiveItem)`. |

## Contributing

Clone the repository and install the dependencies running `pnpm install`. After the dependencies are installed you should be good to run `pnpm dev` which will load up a server with the sandbox for you to play around.
