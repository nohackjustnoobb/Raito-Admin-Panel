<script lang="ts">
  import { getContext } from "svelte";
  import { quadIn } from "svelte/easing";

  export let zIndex: number;

  const { pop } = getContext("stack") as any;
  const transitionDuration: number = 250;

  let isTouchOnEdge: boolean = false;
  let left: string = "0";
  let isTransition: boolean = false;

  function slide(
    node: Element,
    { delay = 0, duration = transitionDuration } = {}
  ) {
    const left = +getComputedStyle(node).left.replaceAll("px", "");
    const width = window.innerWidth;

    return {
      delay,
      duration,
      css: (t: number) => `left: ${(1 - t) * width + left}px`,
    };
  }

  function onTouchStart(event: TouchEvent) {
    const startX = event.changedTouches[0].pageX;
    // check if swipe from edge
    if (startX < 20) isTouchOnEdge = true;
  }

  async function onTouchMove(event: TouchEvent) {
    if (isTouchOnEdge) left = `${event.changedTouches[0].pageX}px`;
  }

  async function onTouchEnd(event: TouchEvent) {
    if (!isTouchOnEdge) return;
    isTouchOnEdge = false;

    if (event.changedTouches[0].pageX > 100) return pop();

    isTransition = true;
    left = "0";
    setTimeout(() => (isTransition = false), transitionDuration);
  }
</script>

<div
  class="swipeable"
  style:zIndex
  style:left
  style:transition={isTransition ? "left 400ms" : ""}
  in:slide
  out:slide
  on:touchstart={onTouchStart}
  on:touchmove={onTouchMove}
  on:touchend={onTouchEnd}
>
  <slot />
</div>

<style lang="scss">
  .swipeable {
    position: fixed;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--color-background);
  }
</style>
