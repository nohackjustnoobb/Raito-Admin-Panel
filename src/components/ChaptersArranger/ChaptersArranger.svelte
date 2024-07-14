<script lang="ts">
  import { _ } from "svelte-i18n";
  import { getContext } from "svelte";

  import type { DetailsManga } from "../../lib/manga";
  import ChaptersList from "./ChaptersList.svelte";
  import TopBar from "../TopBar.svelte";
  import FullScreenLoader from "../../screens/FullScreenLoader.svelte";

  export let manga: DetailsManga;
  export let useTopBar: boolean = false;
  export let cancelAction: (() => void) | null = null;

  const { push, pop } = getContext("stack") as any;

  let chapters = structuredClone(manga.chapters);
  let isChanged: boolean = false;

  let content: HTMLElement;

  $: isChanged = JSON.stringify(chapters) !== JSON.stringify(manga.chapters);

  async function upload() {
    if (!isChanged) return;

    push(FullScreenLoader);
    const result = await manga.uploadChapters(chapters);
    pop();

    if (result) {
      if (useTopBar) pop();
      else if (cancelAction) cancelAction();
    } else {
      alert($_("failedToArrangeTheChapters"));
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container">
  {#if useTopBar}
    {#if isChanged}
      <TopBar>
        <span
          slot="left"
          on:click={() => (chapters = structuredClone(manga.chapters))}
        >
          {$_("reset")}
        </span>
        <span class="done" slot="right" on:click={upload}>{$_("done")}</span>
      </TopBar>
    {:else}
      <TopBar />
    {/if}
  {:else}
    <div class="controller">
      <span
        on:click={() => {
          if (cancelAction) cancelAction();
        }}
      >
        {$_("cancel")}
      </span>
      <span class:disabled={!isChanged} class="done" on:click={upload}>
        {$_("done")}
      </span>
    </div>
  {/if}
  <div class="content" bind:this={content}>
    <div>
      <h3>{$_("serial")}</h3>
      <ChaptersList bind:chapters {content} />
    </div>
    <div>
      <h3>{$_("extra")}</h3>
      <ChaptersList bind:chapters isExtra {content} />
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    height: 100%;
    width: 100%;
  }

  .controller {
    display: flex;
    justify-content: space-between;
    margin-top: max(1rem, env(safe-area-inset-top));
    margin-bottom: 0.5rem;
  }

  span {
    cursor: pointer;
  }

  .done {
    font-weight: bold;
  }

  .content {
    display: flex;
    overflow-x: hidden;
    overflow-y: scroll;
    gap: 1rem;
    width: 100%;
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(
      100% - env(safe-area-inset-bottom) - max(1rem, env(safe-area-inset-top)) -
        2.5rem
    );

    &::-webkit-scrollbar {
      display: none;
    }

    div {
      width: calc(50% - 0.5rem);
    }
  }

  .disabled {
    opacity: 0.3;
    cursor: auto;
  }

  h3 {
    margin: 0;
    margin-bottom: 0.5rem;
    text-align: center;
  }
</style>
