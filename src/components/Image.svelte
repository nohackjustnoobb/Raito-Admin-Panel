<script lang="ts">
  import { onMount } from "svelte";
  import { Circle } from "svelte-loading-spinners";

  import { sleep } from "../lib/utils";

  export let src: string;
  export let aspectRatio: string = "3 / 4";

  let loaded = false;

  onMount(tryLoad);

  async function tryLoad() {
    while (!loaded) {
      // don't load if it is a placeholder
      if (!src.match(/https?:\/\/.*\/\.webp/)) {
        const img = new Image();
        img.src = src;
        while (!img.complete) await sleep(100);

        // Check if error
        if (img.naturalWidth) return (loaded = true);
      }

      await sleep(500);
    }
  }
</script>

<div class="image" style:aspect-ratio={aspectRatio}>
  {#if loaded}
    <img {src} alt {...$$restProps} />
  {:else}
    <Circle color="var(--color-chapters-text)" unit="rem" size="3" />
  {/if}
</div>

<style lang="scss">
  .image {
    overflow: hidden;
    border-radius: 0.5rem;
    background-color: var(--color-search-background);
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
</style>
