<script lang="ts">
  import ChapterEditor from "../components/ChapterEditor.svelte";
  import type { Chapter, DetailsManga } from "../lib/manga";
  import Swipeable from "./Swipeable.svelte";

  export let manga: DetailsManga;
  export let chapter: Chapter;
  export let zIndex: number;
</script>

<Swipeable {zIndex}>
  <div class="container">
    <ChapterEditor {manga} {chapter} useTopBar />
  </div>
</Swipeable>

<style lang="scss">
  .container {
    margin-left: 1rem;
    margin-right: 1rem;
    height: 100%;
  }
</style>
