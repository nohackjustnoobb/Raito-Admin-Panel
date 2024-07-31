<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import SvgIcon from "@jamescoyle/svelte-icon";
  import {
    mdiClose,
    mdiContentCopy,
    mdiDelete,
    mdiMagnify,
    mdiPlus,
    mdiRefresh,
  } from "@mdi/js";

  import Input from "../components/Input.svelte";
  import Button from "./../components/Button.svelte";
  import TopBar from "../components/TopBar.svelte";
  import Swipeable from "./Swipeable.svelte";
  import { convertRemToPixels } from "../lib/utils";
  import { connection } from "../lib/connection";
  import CreateToken from "./CreateToken.svelte";
  import FullScreenLoader from "./FullScreenLoader.svelte";

  export let zIndex;

  const { pop, push } = getContext("stack") as any;

  let tokens: { [id: string]: string } = {};

  let keywords: string = "";
  let curKeywords: string = "";

  let page: number = 1;
  let isReached: boolean = false;

  function search() {
    // reset the variables
    page = 1;
    isReached = false;
    tokens = {};

    curKeywords = keywords;
    load();
  }

  function clear() {
    keywords = "";
    search();
  }

  async function load() {
    const result = await connection.get("token", {
      id: curKeywords,
      page: page.toString(),
    });
    if (result.ok) {
      const json = await result.json();
      if (!Object.keys(json).length) return (isReached = true);

      tokens = { ...tokens, ...json };

      page++;
    }
  }

  function pushCreate() {
    push(CreateToken, {
      fallback: (v: any) => (tokens = { ...v, ...tokens }),
    });
  }

  async function refreshToken(id: string) {
    if (!confirm($_("refreshTokenConfirmation"))) return;

    push(FullScreenLoader);
    const result = await connection.put("token", {}, { id: id });
    pop();

    if (result.ok) {
      const token = (await result.json())["token"];
      tokens[id] = token;
    } else {
      alert($_("failedToRefreshToken"));
    }
  }

  async function deleteToken(id: string) {
    if (!confirm($_("deleteTokenConfirmation"))) return;

    push(FullScreenLoader);
    const result = await connection.delete("token", { id: id });
    pop();

    if (result.ok) {
      delete tokens[id];
      tokens = tokens;
    } else alert($_("failedToDeleteTheToken"));
  }

  onMount(() => load());
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Swipeable {zIndex}>
  <div class="container">
    <TopBar>
      <span slot="right" on:click={pushCreate} class="icon">
        <SvgIcon type="mdi" path={mdiPlus} size={convertRemToPixels(2)} />
      </span>
    </TopBar>
    <Input
      bind:value={keywords}
      rightIcon={keywords === curKeywords && keywords ? mdiClose : mdiMagnify}
      rightIconAction={() => {
        if (keywords === curKeywords) clear();
        else search();
      }}
      placeHolder={$_("keywords")}
    />
    <ul>
      <li>
        <span class="id">ID</span>
        <span class="token">Token</span>
        <span class="edit">{$_("edit")}</span>
      </li>
      {#each Object.entries(tokens) as token (token[0])}
        <li>
          <span class="id">{token[0]}</span>
          <span class="token">{token[1]}</span>
          <span class="edit">
            <span
              class="icon"
              on:click={() => navigator.clipboard.writeText(token[1])}
            >
              <SvgIcon
                type="mdi"
                path={mdiContentCopy}
                size={convertRemToPixels(1.25)}
              />
            </span>
            <span class="icon" on:click={() => refreshToken(token[0])}>
              <SvgIcon
                type="mdi"
                path={mdiRefresh}
                size={convertRemToPixels(1.5)}
              />
            </span>
            <span class="icon" on:click={() => deleteToken(token[0])}>
              <SvgIcon
                type="mdi"
                path={mdiDelete}
                color="var(--color-warning)"
                size={convertRemToPixels(1.5)}
              />
            </span>
          </span>
        </li>
      {/each}
      {#if !Object.keys(tokens).length}
        <li class="noMatching">
          <h3>
            {$_("noMatchingToken")}
          </h3>
        </li>
      {:else if !isReached}
        <li class="loadMore">
          <Button on:click={load}>
            {$_("loadMore")}
          </Button>
        </li>
      {/if}
    </ul>
  </div>
</Swipeable>

<style lang="scss">
  .container {
    width: calc(100% - 2rem);
    height: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    display: flex;
    flex-direction: column;
  }

  .icon {
    display: flex;
    cursor: pointer;
    transition: transform 250ms;

    &:active {
      transform: scale(1.25);
    }
  }

  ul {
    display: flex;
    flex-direction: column;
    list-style-type: none;
    margin: 0;
    margin-top: 1rem;
    padding: 0;
    width: 100%;
    gap: 0.5rem;
    overflow-y: scroll;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));

    &::-webkit-scrollbar {
      display: none;
    }

    li {
      display: flex;
      gap: 0.5rem;

      &.loadMore {
        justify-content: center;
        margin-top: 1rem;
      }

      &.noMatching {
        justify-content: center;
        opacity: 0.5;
      }

      span {
        flex-shrink: 0;
        text-align: center;

        &.id {
          width: 5rem;
          overflow: scroll;
          user-select: all;

          &::-webkit-scrollbar {
            display: none;
          }
        }

        &.token {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          user-select: all;
        }

        &.edit {
          display: flex;
          gap: 0.5rem;
          flex: initial;
          width: 5rem;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
</style>
