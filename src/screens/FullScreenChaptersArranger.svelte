<script lang="ts">
  import ChaptersArranger from "../components/ChaptersArranger/ChaptersArranger.svelte";
  import type { DetailsManga } from "../lib/manga";
  import Swipeable from "./Swipeable.svelte";

  export let manga: DetailsManga;
  export let zIndex: number;
</script>

<Swipeable {zIndex}>
  <div class="container">
    <ChaptersArranger {manga} useTopBar />
  </div>
</Swipeable>

<style lang="scss">
  .container {
    margin-left: 1rem;
    margin-right: 1rem;
    height: 100%;
  }
</style>
