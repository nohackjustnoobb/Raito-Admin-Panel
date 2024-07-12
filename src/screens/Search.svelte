<script lang="ts">
  import { mdiMagnify } from "@mdi/js";
  import { _ } from "svelte-i18n";
  import { slide } from "svelte/transition";

  import Input from "../components/Input.svelte";
  import TopBar from "../components/TopBar.svelte";
  import Swipeable from "./Swipeable.svelte";
  import { Manga } from "../lib/manga";
  import MangasList from "../components/MangasList.svelte";
  import { Circle } from "svelte-loading-spinners";
  import Button from "../components/Button.svelte";
  import { throttle } from "../lib/utils";

  export let zIndex: number;

  let keywords: string;
  $: if (keywords) getSuggestions();
  let curKeywords: string;
  let page: number = 1;

  let mangas: Array<Manga> = [];
  let suggestions: Array<string> = [];

  let isLoading: boolean = false;
  let isReached: boolean = false;
  let focused: boolean;

  const getSuggestions = throttle(
    async () => (suggestions = await Manga.getSuggestions(keywords)),
    500
  );

  async function search() {
    if (!keywords || isLoading) return;

    if (keywords !== curKeywords) {
      curKeywords = keywords;
      page = 1;
      mangas = [];
      isReached = false;
    }

    if (isReached) return;

    isLoading = true;
    const result = await Manga.search(curKeywords, page);
    if (!result.length) isReached = true;
    page++;

    mangas = [...mangas, ...result];
    isLoading = false;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<Swipeable {zIndex}>
  <div class="container">
    <TopBar />
    <div class="content">
      <div class="searchBar">
        <Input
          bind:value={keywords}
          bind:focused
          rightIcon={mdiMagnify}
          rightIconAction={search}
          placeHolder={$_("keywords")}
        />
        {#if keywords && focused && suggestions.length}
          <ul transition:slide={{ axis: "y" }}>
            {#each suggestions as suggestion}
              <li
                on:click={async () => {
                  keywords = suggestion;
                  search();
                }}
              >
                {suggestion}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      <div class="mangas">
        <MangasList {mangas} />
        {#if isLoading}
          <div class="loader">
            <Circle color="var(--color-chapters-text)" unit="rem" size="3" />
          </div>
        {:else if !mangas.length}
          <div class="noMatching">
            <h3>{$_("noMatchingManga")}</h3>
          </div>
        {:else if !isReached}
          <div class="loadMore">
            <Button on:click={search}>
              {$_("loadMore")}
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</Swipeable>

<style lang="scss">
  .container {
    width: calc(100% - 2rem);
    height: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .content {
    height: calc(100% - 2.5rem - max(0.5rem, env(safe-area-inset-top)));
  }

  .mangas {
    height: calc(100% - 3rem - max(1rem, env(safe-area-inset-bottom)));
    overflow-x: hidden;
    overflow-y: scroll;
    margin-top: 1rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));

    &::-webkit-scrollbar {
      display: none;
    }

    .loader,
    .loadMore {
      width: calc(100% - 2rem);
      display: flex;
      justify-content: center;
      margin: 1rem;
    }

    .noMatching {
      display: flex;
      flex-direction: column;
      height: 100%;
      transform: translateY(-3rem);
      justify-content: center;
      align-items: center;
      opacity: 0.5;
    }
  }

  .searchBar {
    position: relative;

    ul {
      position: absolute;
      padding: 1rem;
      margin: 0;
      top: 2.75rem;
      list-style-type: none;
      width: calc(100% - 2rem);
      background-color: var(--color-background);
      border-radius: 0.5rem;
      opacity: 0.98;
      backdrop-filter: blur(5px);
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      li {
        padding-top: 0.75rem;
        cursor: pointer;
        border-top: solid 0.5px var(--color-text);
      }

      li:first-child {
        border: none;
        padding: 0;
      }
    }
  }
</style>
