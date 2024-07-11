<script lang="ts">
  import { onMount, setContext } from "svelte";
  import Home from "./Home.svelte";

  type Screen = { component: any; props?: any };
  let screens: Array<Screen> = [];

  onMount(() => push(Home));

  setContext("stack", {
    push,
    pop,
  });

  function push(component: any, props?: any) {
    const screen: Screen = {
      component: component,
      props: props,
    };
    if (screen.props === undefined) screen.props = {};
    screen.props["zIndex"] = screens.length + 2;

    screens = [...screens, screen];
  }

  function pop() {
    if (screens.length > 1) screens = screens.slice(0, -1);
  }
</script>

{#each screens as screen}
  <svelte:component this={screen.component} {...screen.props} />
{/each}
