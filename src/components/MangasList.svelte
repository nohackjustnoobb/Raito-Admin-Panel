<script lang="ts">
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiPlus } from "@mdi/js";
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import type { Manga } from "../lib/manga";
  import FullScreenLoader from "../screens/FullScreenLoader.svelte";
  import Details from "../screens/Details.svelte";
  import Image from "./Image.svelte";
  import CreateOrUpdateManga from "../screens/CreateOrUpdateManga.svelte";
  import { convertRemToPixels } from "../lib/utils";

  const { push, pop } = getContext("stack") as any;

  export let mangas: Array<Manga>;
  export let showCreate: boolean = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<ul>
  {#if showCreate}
    <li class="create" on:click={() => push(CreateOrUpdateManga)}>
      <SvgIcon type="mdi" path={mdiPlus} size={convertRemToPixels(4)} />
    </li>
  {/if}
  {#each mangas as manga (manga.id)}
    <li
      on:click={async () => {
        // Get the Details of the manga
        push(FullScreenLoader);
        let details;
        try {
          details = await manga.toDetails();
        } catch (e) {}
        pop();

        if (details) push(Details, { manga: details });
      }}
    >
      {#if manga.isEnded}
        <span>{$_("ended")}</span>
      {/if}
      <Image src={manga.thumbnail} />
      <p>{manga.title}</p>
      <b>{$_("updatedTo")} {manga.latest || $_("none")}</b>
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(10rem), 1fr));
    column-gap: 1rem;
    row-gap: 1rem;

    li {
      position: relative;
      cursor: pointer;

      &.create {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--color-sub-background);
        border-radius: 0.5rem;
        padding: 1rem;
      }

      span {
        position: absolute;
        top: 0;
        left: 0;
        background-color: #ff0055aa;
        color: white;
        font-weight: bold;
        font-size: 1rem;
        padding: 0.125rem;
        padding-left: 1rem;
        padding-right: 1rem;
        backdrop-filter: blur(10px);
        border-radius: 0.5rem 0 0.5rem 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 1.5rem;
        margin-right: 0.5rem;
        user-select: all;
      }

      p {
        margin: 0;
        padding: 0;
        margin-top: 0.5rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      b {
        display: block;
        margin: 0;
        padding: 0;
        opacity: 0.3;
        font-size: 0.75rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
</style>
