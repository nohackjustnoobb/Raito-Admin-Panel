<script lang="ts">
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiImport, mdiPlus } from "@mdi/js";
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import { Manga } from "../lib/manga";
  import FullScreenLoader from "../screens/FullScreenLoader.svelte";
  import Details from "../screens/Details.svelte";
  import Image from "./Image.svelte";
  import CreateOrUpdateManga from "../screens/CreateOrUpdateManga.svelte";
  import { convertRemToPixels } from "../lib/utils";

  const { push, pop } = getContext("stack") as any;

  export let mangas: Array<Manga>;
  export let showCreate: boolean = false;

  let mangaInput: HTMLInputElement;

  async function uploadManga(event: InputEvent) {
    const target = event.target;
    if (target) {
      const files = (target as HTMLInputElement).files;
      if (files?.length) {
        push(FullScreenLoader);

        const result = await Manga.upload(files[0]);

        pop();
        (target as HTMLInputElement).value = "";

        if (!result) alert($_("failedToUploadTheManga"));
      }
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<ul>
  {#if showCreate}
    <li class="create">
      <span on:click={() => push(CreateOrUpdateManga)}>
        <SvgIcon type="mdi" path={mdiPlus} size={convertRemToPixels(4)} />
      </span>
      <span on:click={() => mangaInput.click()}>
        <input
          type="file"
          on:change={uploadManga}
          accept=".zip"
          bind:this={mangaInput}
        />
        <SvgIcon type="mdi" path={mdiImport} size={convertRemToPixels(4)} />
      </span>
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
        flex-direction: column;
        gap: 1rem;

        span {
          color: var(--color-texts);
          background-color: var(--color-sub-background);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 0;
          width: calc(100% - 2rem);
          flex: 1;
        }

        input {
          opacity: 0;
          position: absolute;
          z-index: -1;
        }
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
