<script lang="ts">
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiCog, mdiMagnify, mdiShieldEdit } from "@mdi/js";
  import { _ } from "svelte-i18n";
  import { Circle } from "svelte-loading-spinners";
  import { getContext, onDestroy } from "svelte";

  import AppIcon from "../components/AppIcon.svelte";
  import { connected } from "../lib/connection";
  import SetConnection from "./SetConnection.svelte";
  import Stackable from "./Stackable.svelte";
  import ConnectionStatus from "./ConnectionStatus.svelte";
  import { GENRES, list, manga, Manga, Status } from "../lib/manga";
  import { convertRemToPixels, wheelToScrollHorizontally } from "../lib/utils";
  import Button from "../components/Button.svelte";
  import MangasList from "../components/MangasList.svelte";
  import Search from "./Search.svelte";
  import Settings from "./Settings.svelte";
  import TokenManager from "./TokenManager.svelte";

  let selectedCategory: string = "all";
  let selectedStatus: Status = Status.Any;
  let isLoading: boolean = false;
  let isReached: boolean = false;
  let mangas: Array<Manga> = [];
  let storedPage: { [id: string]: number } = {};

  const { push } = getContext("stack") as any;
  const status = ["any", "onGoing", "ended"];

  // update mangas if manga or list is changed
  const mangaUnsubscriber = manga.subscribe(() =>
    updateMangas(selectedCategory, selectedStatus)
  );
  const listUnsubscriber = list.subscribe(() =>
    updateMangas(selectedCategory, selectedStatus)
  );

  // fetch list when connected to the server
  const connectedUnsubscriber = connected.subscribe(fetchList);

  async function fetchList() {
    if (isLoading) return;

    if (!storedPage[selectedStatus + selectedCategory])
      storedPage[selectedStatus + selectedCategory] = 1;

    isLoading = true;
    await Manga.getList(
      selectedCategory,
      selectedStatus,
      storedPage[selectedStatus + selectedCategory]
    );
    isLoading = false;
  }

  function updateMangas(category: string, status: Status) {
    const listMap = $list[status + category] || {};
    const ids = [];

    for (const [_, value] of Object.entries(listMap).toSorted(
      (a, b) => Number(a[0]) - Number(b[0])
    ))
      ids.push(...value);

    const mangasValue = [];
    for (const id of ids) {
      const manga = $manga[id];
      if (manga) mangasValue.push(manga);
    }
    mangas = mangasValue;

    // check if the end is reached
    isReached = false;
    const keys = Object.keys(listMap);
    if (keys.length !== 0) {
      const lastIndex = Number(
        keys.toSorted((a, b) => Number(b[0]) - Number(a[0]))[0]
      );
      if (!listMap[lastIndex].length) isReached = true;
    }
  }

  onDestroy(() => {
    mangaUnsubscriber();
    listUnsubscriber();
    connectedUnsubscriber();
  });

  // listen to selected category and status changes
  $: updateMangas(selectedCategory, selectedStatus);

  export let zIndex;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<Stackable {zIndex}>
  <div class="container">
    <div class="menuBar">
      <div class="leftItems">
        <div class="icon" on:click={() => window.location.reload()}>
          <AppIcon />
        </div>
        <div class="appName">
          <h2>Admin Panel</h2>
          <h5
            on:click={() => {
              if ($connected) push(ConnectionStatus);
              else push(SetConnection);
            }}
          >
            {$_($connected ? "connected" : "disconnected")}
          </h5>
        </div>
      </div>
      <div class="rightItems">
        <span on:click={() => push(TokenManager)}>
          <SvgIcon
            type="mdi"
            path={mdiShieldEdit}
            size={convertRemToPixels(2)}
          />
        </span>
        <span on:click={() => push(Search)}>
          <SvgIcon type="mdi" path={mdiMagnify} size={convertRemToPixels(2)} />
        </span>
        <span on:click={() => push(Settings)}>
          <SvgIcon type="mdi" path={mdiCog} size={convertRemToPixels(2)} />
        </span>
      </div>
    </div>
    {#if $connected}
      <div class="filters">
        <div>
          <b>{$_("genre")}: </b>
          <ul on:mousewheel={wheelToScrollHorizontally("UL")}>
            {#each GENRES as category}
              <li
                class:selected={category === selectedCategory}
                on:click={() => {
                  selectedCategory = category;
                  fetchList();
                }}
              >
                {$_(category)}
              </li>
            {/each}
          </ul>
        </div>
        <div>
          <b>{$_("status")}: </b>
          <ul>
            {#each status as state, idx}
              <li
                class:selected={idx === selectedStatus}
                on:click={() => {
                  selectedStatus = idx;
                  fetchList();
                }}
              >
                {$_(state)}
              </li>
            {/each}
          </ul>
        </div>
      </div>
      <div class="mangas">
        <MangasList {mangas} showCreate />
        {#if isLoading}
          <div class="loader">
            <Circle color="var(--color-chapters-text)" unit="rem" size="3" />
          </div>
        {:else if !isReached}
          <div class="loadMore">
            <Button
              on:click={() => {
                storedPage[selectedStatus + selectedCategory] =
                  Object.keys($list[selectedStatus + selectedCategory]).length +
                  1;
                fetchList();
              }}
            >
              {$_("loadMore")}
            </Button>
          </div>
        {/if}
      </div>
    {:else}
      <div class="disconnected">
        <h3>{$_("currentlyDisconnected")}</h3>
        <Button on:click={() => push(SetConnection)}>
          {$_("clickToConnect")}
        </Button>
      </div>
    {/if}
  </div>
</Stackable>

<style lang="scss">
  .container {
    padding: 1rem;
    padding-top: max(1rem, env(safe-area-inset-top));
    height: calc(100% - 3rem - max(1rem, env(safe-area-inset-top)));
  }

  .menuBar {
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;

    .leftItems {
      height: 100%;
      display: flex;
      gap: 1rem;
      align-items: center;

      .icon {
        height: 100%;
        aspect-ratio: 1;
      }

      h2 {
        margin: 0;
      }

      h5 {
        margin: 0;
        opacity: 0.3;
        cursor: pointer;
      }
    }

    .rightItems {
      height: 100%;
      display: flex;
      gap: 0.5rem;
      align-items: center;
      cursor: pointer;

      span {
        display: flex;
      }
    }
  }

  .disconnected {
    display: flex;
    flex-direction: column;
    height: 100%;
    transform: translateY(-3rem);
    justify-content: center;
    align-items: center;
    opacity: 0.5;
  }

  .filters {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    white-space: nowrap;

    div {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    ul {
      padding: 0;
      margin: 0;
      list-style-type: none;
      display: flex;
      gap: 0.5rem;
      width: 100%;
      overflow-x: scroll;
      overflow-y: hidden;
      scrollbar-width: 0;
      height: 1.5rem;
      align-items: center;

      &::-webkit-scrollbar {
        display: none;
      }

      li {
        opacity: 0.5;
        cursor: pointer;
        transition: all 0.5s;
      }

      .selected {
        font-weight: bold;
        font-size: 1.25rem;
        opacity: 1;
        cursor: auto;
      }
    }
  }

  .mangas {
    height: calc(100% - 4.5rem - max(1rem, env(safe-area-inset-bottom)));
    overflow-x: hidden;
    overflow-y: scroll;
    margin-top: 0.5rem;
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
  }
</style>
