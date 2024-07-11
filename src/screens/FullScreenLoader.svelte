<script lang="ts">
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { fade, scale } from "svelte/transition";

  import Stackable from "./Stackable.svelte";
  import { Circle } from "svelte-loading-spinners";

  export let zIndex: number;
</script>

<Stackable {zIndex}>
  <div class="background" transition:fade />
  <div class="container" transition:scale>
    <Circle color="var(--color-text)" unit="rem" size="3" />
    <span>{$_("loading")}</span>
  </div>
</Stackable>

<style lang="scss">
  .container {
    position: absolute;
    background-color: var(--color-background);

    display: flex;
    flex-direction: column;
    border-radius: 1rem;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6rem;
    height: 6rem;
    padding: 1.5rem;
    opacity: 0.96;
  }
</style>
