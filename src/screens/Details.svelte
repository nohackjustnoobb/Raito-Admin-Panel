<script lang="ts">
  import { _ } from "svelte-i18n";
  import SvgIcon from "@jamescoyle/svelte-icon";
  import {
    mdiPencil,
    mdiDelete,
    mdiOrderNumericAscending,
    mdiOrderNumericDescending,
    mdiPlus,
    mdiBookEdit,
  } from "@mdi/js";
  import { getContext, tick } from "svelte";

  import Image from "../components/Image.svelte";
  import TopBar from "../components/TopBar.svelte";
  import type { Chapter, DetailsManga } from "../lib/manga";
  import Swipeable from "./Swipeable.svelte";
  import CreateOrUpdateManga from "./CreateOrUpdateManga.svelte";
  import { convertRemToPixels, sleep } from "../lib/utils";
  import SegmentedControls from "../components/SegmentedControls.svelte";
  import CreateChapter from "./CreateChapter.svelte";
  import FullScreenLoader from "./FullScreenLoader.svelte";
  import ChaptersArranger from "../components/ChaptersArranger/ChaptersArranger.svelte";
  import FullScreenChaptersArranger from "./FullScreenChaptersArranger.svelte";
  import { fly, scale } from "svelte/transition";
  import ChapterEditor from "../components/ChapterEditor.svelte";
  import FullScreenChapterEditor from "./FullScreenChapterEditor.svelte";
  import { flip } from "svelte/animate";

  export let zIndex;
  export let manga: DetailsManga;

  const { push, pop } = getContext("stack") as any;
  const transitionDuration = 400;

  // Thumbnail
  let imageInput: HTMLInputElement;

  // Layout
  let isVertical: boolean = window.innerWidth < window.innerHeight;
  let rightScreen: any | null = null;
  type Props = { [key: string]: any };
  let rightProps: Props = {};

  // Controller
  let isExtra: number = 0;
  let isDescending: boolean = true;

  // Manga data
  let mangaInfo: { [title: string]: Array<string> } = {};
  let chapters: Array<Chapter>;
  let orderedChapters: Array<Chapter>;

  $: mangaInfo = {
    title: [manga.title],
    latest: [manga.latest],
    status: [manga.isEnded ? "ended" : "onGoing"],
    authors: manga.authors,
    genre: manga.categories,
  };
  $: chapters = manga.chapters[isExtra ? "extra" : "serial"];
  $: orderedChapters = isDescending ? chapters : chapters.toReversed();

  async function uploadThumbnail(event: InputEvent) {
    const target = event.target;
    if (target) {
      const images = (target as HTMLInputElement).files;
      if (images?.length) {
        const reader = new FileReader();
        reader.readAsDataURL(images[0]);
        while (!reader.result) await sleep(100);

        const regex = /data:image\/.*;base64,/g;
        const image = (reader.result as string).replaceAll(regex, "");
        const result = await manga.uploadThumbnail(image);

        if (result) manga = manga;
        else alert($_("failedToUploadThumbnail"));

        (target as HTMLInputElement).value = "";
      }
    }
  }

  function clearRightScreen() {
    rightScreen = null;
    rightProps = {};
  }

  async function setRightScreen(component: any, props: Props = {}) {
    if (rightScreen) {
      clearRightScreen();
      await sleep(transitionDuration + 50);
    }

    rightScreen = component;
    rightProps = props;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Swipeable {zIndex}>
  <div class="container" style:flex-direction={isVertical ? "column" : "row"}>
    <div class="left" style:max-width={isVertical ? "" : "400px"}>
      <TopBar>
        <div slot="right" class="actions">
          <span on:click={() => push(CreateOrUpdateManga, { manga })}>
            <SvgIcon
              type="mdi"
              path={mdiBookEdit}
              size={convertRemToPixels(1.5)}
            />
          </span>
          <span
            on:click={async () => {
              if (confirm($_("deleteMangaConfirmation"))) {
                push(FullScreenLoader);
                const result = await manga.delete();
                pop();

                if (result) pop();
                else alert($_("failedToDeleteManga"));
              }
            }}
          >
            <SvgIcon
              type="mdi"
              path={mdiDelete}
              size={convertRemToPixels(1.7)}
              color="var(--color-warning)"
            />
          </span>
        </div>
      </TopBar>
      <div class="content">
        <div class="info">
          <div class="thumbnail">
            <Image src={manga.thumbnail} />
            <div class="edit" on:click={() => imageInput.click()}>
              <input
                type="file"
                on:change={uploadThumbnail}
                accept="image/*"
                bind:this={imageInput}
              />
              <SvgIcon
                type="mdi"
                path={mdiPencil}
                size={convertRemToPixels(1.5)}
              />
            </div>
          </div>
          <ul class="others">
            {#each Object.entries(mangaInfo) as info}
              <li>
                <b> {$_(info[0])}:</b>
                {#if info[1].length}
                  {#each info[1] as value}
                    <span>{$_(value)}</span>
                  {/each}
                {:else}
                  <span>{$_("none")}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
        <div class="description">
          <b>{$_("description")}</b>
          <span>
            {manga.description}
          </span>
        </div>
        <div class="controller">
          <span on:click={() => (isDescending = !isDescending)}>
            <SvgIcon
              type="mdi"
              path={isDescending
                ? mdiOrderNumericDescending
                : mdiOrderNumericAscending}
              size={convertRemToPixels(1.5)}
            />
          </span>
          <SegmentedControls
            bind:index={isExtra}
            segments={["serial", "extra"].map((v) => $_(v))}
          />

          <span
            on:click={() => {
              if (isVertical) push(FullScreenChaptersArranger, { manga });
              else
                setRightScreen(ChaptersArranger, {
                  manga,
                  cancelAction: clearRightScreen,
                });
            }}
          >
            <SvgIcon
              type="mdi"
              path={mdiPencil}
              size={convertRemToPixels(1.5)}
            />
          </span>
        </div>

        <ul class="chapters">
          <li on:click={() => push(CreateChapter, { manga })}>
            <SvgIcon type="mdi" path={mdiPlus} size={convertRemToPixels(1.5)} />
          </li>
          {#each orderedChapters as chapter (chapter.id)}
            <li
              in:scale
              out:scale
              animate:flip={{ duration: 200 }}
              on:click={() => {
                if (isVertical)
                  push(FullScreenChapterEditor, {
                    manga,
                    chapter,
                  });
                else
                  setRightScreen(ChapterEditor, {
                    manga,
                    cancelAction: clearRightScreen,
                    chapter,
                  });
              }}
            >
              <p>
                {chapter.title}
              </p>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    {#if !isVertical}
      <div class="divider" />
      <div class="right">
        {#if rightScreen}
          <div
            class="content"
            transition:fly={{ x: "100%", duration: transitionDuration }}
          >
            <svelte:component this={rightScreen} {...rightProps} />
          </div>
        {/if}
        <div class="empty">
          <h3>
            {$_("noContent")}
          </h3>
        </div>
      </div>
    {/if}
  </div>
</Swipeable>

<style lang="scss">
  .container {
    width: calc(100% - 2rem);
    height: 100%;

    padding-left: 1rem;
    padding-right: 1rem;
    display: flex;
    gap: 1rem;
    position: relative;
  }

  .content {
    overflow-y: scroll;
    flex: 1;
    z-index: 1;
    background-color: var(--color-background);

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .right,
  .left {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .right {
    .content {
      overflow: hidden;
    }
  }

  .divider {
    background: var(--color-text);
    width: 1px;
    opacity: 0.3;
  }

  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.5;
    position: absolute;
    width: 100%;
    height: 100%;

    h3 {
      margin: 0;
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;

    span {
      cursor: pointer;
    }
  }

  .info {
    display: flex;
    gap: 1rem;

    .thumbnail {
      flex: 1;
      position: relative;

      .edit {
        position: absolute;
        background-color: var(--color-background);
        bottom: 0;
        opacity: 0.7;
        width: calc(100% - 0.5rem);
        display: flex;
        cursor: pointer;
        padding: 0.25rem;
        justify-content: center;

        input {
          display: none;
        }
      }
    }

    .others {
      flex: 2;
      margin: 0;
      padding: 0;
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      li {
        display: flex;
        column-gap: 0.5rem;
        flex-wrap: wrap;

        span {
          opacity: 0.8;
        }
      }
    }
  }

  .description {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    span {
      opacity: 0.8;
    }
  }

  .controller {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 0.75rem;

    span {
      cursor: pointer;
    }
  }

  .chapters {
    display: grid;
    list-style-type: none;
    padding: 0;
    margin: 0;
    margin-bottom: max(1rem, env(safe-area-inset-bottom));
    grid-template-columns: repeat(auto-fill, minmax(calc(75px), 1fr));
    gap: 0.5rem;

    li {
      cursor: pointer;
      background-color: var(--color-chapters-background);
      color: var(--color-chapters-text);
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.25rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      text-align: center;
      height: 1.5rem;

      p {
        margin: 0;
        padding: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
