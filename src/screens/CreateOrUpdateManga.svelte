<script lang="ts">
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { fade, scale } from "svelte/transition";
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiClose, mdiPlus } from "@mdi/js";

  import Stackable from "./Stackable.svelte";
  import { DetailsManga, categories as categoriesList } from "../lib/manga";
  import Input from "../components/Input.svelte";
  import { convertRemToPixels } from "../lib/utils";
  import Button from "../components/Button.svelte";
  import FullScreenLoader from "./FullScreenLoader.svelte";

  const { pop, push } = getContext("stack") as any;

  export let zIndex: number;
  export let manga: DetailsManga | null = null;

  let title: string = manga?.title || "";
  let description: string = manga?.description || "";
  let isEnded: boolean = manga?.isEnded || false;
  let authors: Array<string> = manga?.authors || [];
  let categories: Array<string> = manga?.categories || [];

  let selected: number = 0;
  let value: string = "";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<Stackable {zIndex}>
  <div class="background" on:click={pop} transition:fade />
  <div class="container" transition:scale>
    <h3>{$_(manga ? "editManga" : "createManga")}</h3>
    <Input bind:value={title} placeholder={$_("title")} />
    <Input bind:value={description} placeholder={$_("description")} rows={6} />
    <div>
      <span>{$_("genre")}: </span>
      <ul>
        {#each categories as category}
          <li
            on:click={() =>
              (categories = categories.filter((v) => v !== category))}
          >
            {$_(category)}
            <SvgIcon
              type="mdi"
              path={mdiClose}
              color={"#999999"}
              size={convertRemToPixels(1)}
            />
          </li>
        {/each}
        <li class="add">
          <SvgIcon
            type="mdi"
            path={mdiPlus}
            color={"#999999"}
            size={convertRemToPixels(1.5)}
          />
          <select
            bind:value={selected}
            on:change={() => {
              if (Number(selected) !== 0)
                categories = [...categories, categoriesList[selected]];
              selected = 0;
            }}
          >
            <option value="0">
              {$_("selectGenre")}:
            </option>
            {#each categoriesList.slice(1) as category, idx}
              {#if !categories.includes(category)}
                <option value={idx + 1}>
                  {$_(category)}
                </option>
              {/if}
            {/each}
          </select>
        </li>
      </ul>
    </div>
    <div>
      <span>{$_("authors")}: </span>
      <ul>
        {#each authors as author}
          <li on:click={() => (authors = authors.filter((v) => v !== author))}>
            {author}
            <SvgIcon
              type="mdi"
              path={mdiClose}
              color={"#999999"}
              size={convertRemToPixels(1)}
            />
          </li>
        {/each}
        <li class="authors">
          <Input
            bind:value
            paddingHorizontal=".5rem"
            placeHolder={$_("typeHere")}
            rightIcon={mdiPlus}
            rightIconAction={() => {
              if (value !== "") authors = [...authors, value];
              value = "";
            }}
          />
        </li>
      </ul>
    </div>
    <div>
      <span>{$_("ended")}: </span>
      <input type="checkbox" bind:checked={isEnded} />
    </div>
    <div>
      <Button fullWidth warning outline on:click={pop}>{$_("close")}</Button>
      <Button
        fullWidth
        on:click={async () => {
          push(FullScreenLoader);
          const result = manga
            ? await manga.update(
                title,
                description,
                isEnded,
                authors,
                categories
              )
            : await DetailsManga.create(
                title,
                description,
                isEnded,
                authors,
                categories
              );
          pop();

          if (result) pop();
          else alert($_("failedToCreateOrEditTheManga"));
        }}>{$_(manga ? "update" : "create")}</Button
      >
    </div>
  </div>
</Stackable>

<style lang="scss">
  .container {
    background-color: var(--color-background);

    display: flex;
    border-radius: 1rem;
    position: relative;
    width: calc(100% - 4rem);
    max-height: calc(
      100% - 6rem - env(safe-area-inset-bottom) - env(safe-area-inset-top)
    );
    padding: 1rem;
    max-width: 30rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      display: none;
    }

    h3 {
      margin: 0;
    }

    div {
      display: flex;
      width: 100%;
      gap: 0.5rem;

      span {
        height: 1.5rem;
        display: flex;
        align-items: center;
      }

      ul {
        margin: 0;
        padding: 0;
        list-style-type: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;

        li {
          background-color: var(--color-search-background);
          display: flex;
          height: 1.5rem;
          border-radius: 0.75rem;
          padding-left: 1rem;
          padding-right: 0.5rem;
          align-items: center;
          cursor: pointer;
          overflow: hidden;
          position: relative;
          gap: 0.25rem;

          select {
            opacity: 0;
            position: absolute;
            left: 0;
            top: 0;
            cursor: pointer;
            width: 100%;
            height: 100%;
          }
        }

        li.add {
          padding-left: 0.5rem;
        }

        li.authors {
          padding: 0;
          padding-left: 0.5rem;
          width: 8rem;
        }
      }
    }
  }
</style>
