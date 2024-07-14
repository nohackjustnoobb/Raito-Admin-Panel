<script lang="ts">
  import { crossfade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiSwapHorizontal, mdiDrag } from "@mdi/js";
  import { flip } from "svelte/animate";

  import type { Chapter, Chapters } from "../../lib/manga";
  import { convertRemToPixels, sleep } from "../../lib/utils";
  import { onMount } from "svelte";

  export let chapters: Chapters;
  export let content: HTMLElement;
  export let isExtra = false;

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),
    fallback(node, _) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
				transform: ${transform} scale(${t});
				opacity: ${t}
			`,
      };
    },
  });

  onMount(updatePositions);

  let draggingChapter: Chapter | null = null;
  let mouseYCoordinate: number | null = null;
  let ghostItemWidth: number | null = null;
  let distanceTopGrabbedVsPointer: number | null = null;
  let top: string;
  $: top = `${mouseYCoordinate! + distanceTopGrabbedVsPointer!}px`;

  let list: Array<Chapter>;
  $: list = isExtra ? chapters.extra : chapters.serial;

  let ul: HTMLElement | null = null;
  let positions: Array<[top: number, bottom: number]> = [];
  let length: number = 0;
  $: if (length !== list.length) {
    length = list.length;
    updatePositions();
  }

  async function updatePositions() {
    if (!ul) return;

    await sleep(500);

    const elems = ul.querySelectorAll("li:not(.ghost)");
    const scrollTop = content.scrollTop || 0;
    positions = Array.from(elems).map((v) => [
      v.getBoundingClientRect().top + scrollTop,
      v.getBoundingClientRect().bottom + scrollTop,
    ]);
  }

  function onDragStartWrapper(chapter: Chapter) {
    return (e: MouseEvent | TouchEvent) => onDragStart(e, chapter);
  }

  function onDragStart(e: MouseEvent | TouchEvent, chapter: Chapter) {
    mouseYCoordinate =
      e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    const elem: HTMLElement | null = e.target && (e.target as HTMLElement);
    if (elem) {
      ghostItemWidth = ul!.clientWidth - convertRemToPixels(0.75);
      distanceTopGrabbedVsPointer =
        elem.getBoundingClientRect().y - mouseYCoordinate;
    }

    draggingChapter = chapter;

    e.preventDefault();
  }

  function onDrag(e: MouseEvent | TouchEvent) {
    if (!draggingChapter) return;

    const touch = e instanceof TouchEvent ? e.touches[0] : e;
    mouseYCoordinate = touch.clientY;

    const scrollTop = content.scrollTop || 0;
    const index = positions.findIndex(
      (v) =>
        v[0] < mouseYCoordinate! + scrollTop &&
        v[1] > mouseYCoordinate! + scrollTop
    );

    if (index === -1 || draggingChapter.id == list[index].id) return;

    list = list
      .filter((v) => v.id !== draggingChapter!.id)
      .toSpliced(index, 0, draggingChapter);

    if (isExtra) chapters.extra = list;
    else chapters.serial = list;
  }

  function onDragEnd() {
    draggingChapter = null;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<ul bind:this={ul}>
  {#if draggingChapter}
    <li class="ghost" style:top style:width="{ghostItemWidth}px">
      <span>
        <SvgIcon
          type="mdi"
          path={mdiSwapHorizontal}
          size={convertRemToPixels(1.5)}
        />
      </span>
      <p>
        {draggingChapter.title}
      </p>
      <span>
        <SvgIcon type="mdi" path={mdiDrag} size={convertRemToPixels(1.5)} />
      </span>
    </li>
  {/if}

  {#each list as chapter (chapter.id)}
    <li
      style:opacity={draggingChapter && draggingChapter.id == chapter.id
        ? "0"
        : "1"}
      in:receive={{ key: chapter.id }}
      out:send={{ key: chapter.id }}
      animate:flip={{ duration: 200 }}
    >
      <span
        on:click={() => {
          if (isExtra) {
            chapters.extra = list.filter((v) => v.id !== chapter.id);
            chapters.serial = [...chapters.serial, chapter];
          } else {
            chapters.serial = list.filter((v) => v.id !== chapter.id);
            chapters.extra = [...chapters.extra, chapter];
          }
        }}
      >
        <SvgIcon
          type="mdi"
          path={mdiSwapHorizontal}
          size={convertRemToPixels(1.5)}
        />
      </span>
      <p>
        {chapter.title}
      </p>
      <span
        class="draggable"
        on:mousedown={onDragStartWrapper(chapter)}
        on:touchstart={onDragStartWrapper(chapter)}
      >
        <SvgIcon type="mdi" path={mdiDrag} size={convertRemToPixels(1.5)} />
      </span>
    </li>
  {/each}
</ul>

<svelte:document
  on:mousemove={onDrag}
  on:mouseup={onDragEnd}
  on:touchmove={onDrag}
  on:touchend={onDragEnd}
/>

<style lang="scss">
  ul {
    position: relative;
    display: flex;
    flex-direction: column;
    list-style-type: none;
    padding: 0;
    margin: 0;
    gap: 0.5rem;
    width: 100%;

    li {
      display: flex;
      background-color: var(--color-chapters-background);
      color: var(--color-chapters-text);
      font-weight: bold;
      justify-content: space-between;
      align-items: center;
      padding: 0.25rem;
      padding-left: 0.5rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      text-align: center;
      width: calc(100% - 0.75rem);
      height: 1.5rem;

      span {
        display: flex;
        cursor: pointer;
      }

      .draggable {
        cursor: grab;
      }

      p {
        margin: 0;
        padding: 0;
        padding-left: 1rem;
        padding-right: 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .ghost {
      position: fixed;
      pointer-events: none;
      z-index: 2;
    }
  }
</style>
