<script lang="ts">
  import { _ } from "svelte-i18n";
  import { mdiFormatTitle, mdiPlus } from "@mdi/js";
  import { getContext, onMount } from "svelte";
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiDelete, mdiDrag } from "@mdi/js";

  import type { Chapter, DetailsManga } from "../lib/manga";
  import TopBar from "./TopBar.svelte";
  import Input from "./Input.svelte";
  import Image from "./Image.svelte";
  import FullScreenLoader from "../screens/FullScreenLoader.svelte";
  import { convertRemToPixels, sleep } from "../lib/utils";
  import ImageViewer from "../screens/ImageViewer.svelte";
  import { flip } from "svelte/animate";
  import { scale } from "svelte/transition";

  export let manga: DetailsManga;
  export let chapter: Chapter;
  export let useTopBar: boolean = false;
  export let cancelAction: (() => void) | null = null;

  const { push, pop } = getContext("stack") as any;

  let isLoading: boolean = false;
  let urls: string[] = [];
  let isChanged: boolean = false;

  let newUrls: string[];
  $: newUrls = structuredClone(urls);

  let newTitle: string = chapter.title;
  $: isChanged =
    newTitle !== chapter.title ||
    JSON.stringify(newUrls) !== JSON.stringify(urls);

  let imageInput: HTMLInputElement;
  let content: HTMLElement;

  let draggingUrl: string | null = null;
  let mouseYCoordinate: number | null = null;
  let mouseXCoordinate: number | null = null;
  let distanceTopGrabbedVsPointer: number | null = null;
  let distanceLeftGrabbedVsPointer: number | null = null;
  let ghostItemWidth: number | null = null;
  let ghostItemHeight: number | null = null;
  let top: string;
  let left: string;
  $: top = `${mouseYCoordinate! + distanceTopGrabbedVsPointer!}px`;
  $: left = `${mouseXCoordinate! + distanceLeftGrabbedVsPointer!}px`;

  let positions: Array<
    [top: number, left: number, bottom: number, right: number]
  > = [];
  let length: number = 0;
  $: if (length !== newUrls.length) {
    length = newUrls.length;
    updatePositions();
  }

  onMount(loadChapter);

  async function updatePositions() {
    if (!content) return;

    await sleep(500);

    const elems = content.querySelectorAll("li:not(.plus, .ghost)");
    const scrollTop = content.scrollTop || 0;
    positions = Array.from(elems).map((v) => {
      const bounding = v.getBoundingClientRect();
      return [
        bounding.top + scrollTop,
        bounding.left,
        bounding.bottom + scrollTop,
        bounding.right,
      ];
    });
  }

  async function loadChapter() {
    if (isLoading) return;

    isLoading = true;
    urls = await manga.getChapter(chapter.id);
    isLoading = false;
  }

  async function deleteThis() {
    if (!confirm($_("deleteChapterConfirmation"))) return;

    push(FullScreenLoader);
    const result = await manga.deleteChapter(chapter.id);
    pop();

    if (result) {
      if (useTopBar) pop();
      else if (cancelAction) cancelAction();
    } else {
      alert($_("failedToDeleteTheChapter"));
    }
  }

  async function deleteImage(url: string) {
    if (!confirm($_("deleteImageConfirmation"))) return;

    push(FullScreenLoader);
    const result = await manga.deleteChapterImage(chapter.id, url);
    pop();

    if (result) {
      await loadChapter();
    } else {
      alert($_("failedToDeleteTheImage"));
    }
  }

  function pushViewer(src: string) {
    push(ImageViewer, { src });
  }

  async function uploadImages(event: InputEvent) {
    const target = event.target;
    if (target) {
      const files = (target as HTMLInputElement).files;
      if (files?.length) {
        const images = [];

        push(FullScreenLoader);
        for (const file of files) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          while (!reader.result) await sleep(100);

          const regex = /data:image\/.*;base64,/g;
          images.push((reader.result as string).replaceAll(regex, ""));
        }

        const result = await manga.uploadImages(chapter.id, images);
        pop();

        if (result.length) urls = result;
        else alert($_("failedToUploadTheImages"));

        (target as HTMLInputElement).value = "";
      }
    }
  }

  function onDragStartWrapper(url: string) {
    return (e: MouseEvent | TouchEvent) => onDragStart(e, url);
  }

  function onDragStart(e: MouseEvent | TouchEvent, url: string) {
    mouseYCoordinate = (e instanceof MouseEvent ? e : e.touches[0]).clientY;
    mouseXCoordinate = (e instanceof MouseEvent ? e : e.touches[0]).clientX;

    let elem: HTMLElement = e.target as HTMLElement;
    while (elem.tagName != "LI") elem = elem.parentElement!;

    if (elem) {
      const li = content!.getElementsByTagName("li")[0];
      ghostItemWidth = li.clientWidth;
      ghostItemHeight = li.clientHeight;

      distanceTopGrabbedVsPointer =
        elem.getBoundingClientRect().y - mouseYCoordinate;
      distanceLeftGrabbedVsPointer =
        elem.getBoundingClientRect().x - mouseXCoordinate;
    }

    draggingUrl = url;

    e.preventDefault();
  }

  function onDrag(e: MouseEvent | TouchEvent) {
    if (!draggingUrl) return;

    const touch = e instanceof TouchEvent ? e.touches[0] : e;
    mouseYCoordinate = touch.clientY;
    mouseXCoordinate = touch.clientX;

    const scrollTop = content.scrollTop || 0;
    const index = positions.findIndex((v) => {
      return (
        mouseYCoordinate! + scrollTop >= v[0] &&
        mouseXCoordinate! >= v[1] &&
        mouseYCoordinate! + scrollTop <= v[2] &&
        mouseXCoordinate! <= v[3]
      );
    });

    if (index === -1 || draggingUrl == newUrls[index]) return;

    newUrls = newUrls
      .filter((v) => v !== draggingUrl)
      .toSpliced(index, 0, draggingUrl);
  }

  function onDragEnd() {
    draggingUrl = null;
  }

  async function upload() {
    if (!isChanged) return;

    let result: boolean = true;

    push(FullScreenLoader);
    if (newTitle !== chapter.title) {
      const chapters = structuredClone(manga.chapters);
      chapters.serial = chapters.serial.map((v) => {
        if (v.id === chapter.id) v.title = newTitle;
        return v;
      });
      chapters.extra = chapters.extra.map((v) => {
        if (v.id === chapter.id) v.title = newTitle;
        return v;
      });

      result = await manga.uploadChapters(chapters);
    }

    if (result && JSON.stringify(newUrls) !== JSON.stringify(urls))
      result = await manga.uploadChapter(chapter.id, newUrls);

    if (result) {
      if (useTopBar) pop();
      else if (cancelAction) cancelAction();
    } else {
      alert($_("failedToEditTheChapter"));
    }

    pop();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div class="container">
  {#if useTopBar}
    {#if isChanged}
      <TopBar>
        <span
          slot="left"
          on:click={() => {
            newUrls = structuredClone(urls);
            newTitle = chapter.title;
          }}
        >
          {$_("reset")}
        </span>
        <span class="done" slot="right" on:click={upload}>{$_("done")}</span>
      </TopBar>
    {:else}
      <TopBar>
        <span class="delete" slot="right" on:click={deleteThis}
          ><SvgIcon
            type="mdi"
            path={mdiDelete}
            size={convertRemToPixels(1.7)}
            color="var(--color-warning)"
          /></span
        >
      </TopBar>
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
      <span
        class="done"
        class:delete={!isChanged}
        on:click={() => {
          if (isChanged) {
            upload();
          } else {
            deleteThis();
          }
        }}>{$_(isChanged ? "done" : "delete")}</span
      >
    </div>
  {/if}
  <div class="content" bind:this={content}>
    <Input
      bind:value={newTitle}
      leftIcon={mdiFormatTitle}
      placeHolder={$_("title")}
    />
    <ul>
      {#if draggingUrl}
        <li
          class="ghost"
          style:left
          style:top
          style:width="{ghostItemWidth}px"
          style:height="{ghostItemHeight}px"
        >
          <div class="image">
            <Image src={draggingUrl} />
          </div>
          <div class="actions">
            <span>
              <SvgIcon
                type="mdi"
                path={mdiDelete}
                size={convertRemToPixels(1.5)}
              />
            </span>
            <span>
              <SvgIcon
                type="mdi"
                path={mdiDrag}
                size={convertRemToPixels(1.5)}
              />
            </span>
          </div>
        </li>
      {/if}
      <li class="plus" on:click={() => imageInput.click()}>
        <SvgIcon type="mdi" path={mdiPlus} size={convertRemToPixels(5)} />
        <input
          type="file"
          on:change={uploadImages}
          accept="image/*"
          multiple
          bind:this={imageInput}
        />
      </li>
      {#each newUrls as url (url)}
        <li
          style:opacity={draggingUrl && draggingUrl == url ? "0" : "1"}
          in:scale
          out:scale
          animate:flip={{ duration: 200 }}
        >
          <div class="image" on:click={() => pushViewer(url)}>
            <Image src={url} />
          </div>
          <div class="actions">
            <span on:click={() => deleteImage(url)}>
              <SvgIcon
                type="mdi"
                path={mdiDelete}
                size={convertRemToPixels(1.5)}
              />
            </span>
            <span
              on:mousedown={onDragStartWrapper(url)}
              on:touchstart={onDragStartWrapper(url)}
            >
              <SvgIcon
                type="mdi"
                path={mdiDrag}
                size={convertRemToPixels(1.5)}
              />
            </span>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>

<svelte:document
  on:mousemove={onDrag}
  on:mouseup={onDragEnd}
  on:touchmove={onDrag}
  on:touchend={onDragEnd}
/>

<style lang="scss">
  .container {
    height: 100%;
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

  .delete {
    color: var(--color-warning);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
    overflow-y: scroll;
    height: calc(
      100% - max(1rem, env(safe-area-inset-bottom)) - max(
          0.5rem,
          env(safe-area-inset-top)
        ) - 2rem
    );

    &::-webkit-scrollbar {
      display: none;
    }
  }

  ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(10rem), 1fr));
    gap: 1rem;

    li {
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      position: relative;

      .image {
        height: calc(100% - 2rem);
        cursor: pointer;
        display: flex;
      }

      input {
        opacity: 0;
        position: absolute;
        z-index: -1;
      }

      .actions {
        margin-top: 0.25rem;
        height: 2rem;
        bottom: 0;
        width: 100%;
        display: flex;
        cursor: pointer;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;

        span {
          display: flex;
          justify-content: center;
          flex: 1;
          background-color: var(--color-sub-background);
          border-radius: 0.5rem;
          opacity: 0.9;
        }

        span:first-child {
          color: var(--color-warning);
        }

        span:last-child {
          flex: 0;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
          cursor: grab;
        }
      }
    }

    .plus {
      justify-content: center;
      align-items: center;
      background-color: var(--color-sub-background);
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .ghost {
      position: fixed;
      pointer-events: none;
      z-index: 2;
    }
  }
</style>
