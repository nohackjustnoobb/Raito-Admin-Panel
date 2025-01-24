<script lang="ts">
  import { getContext } from "svelte";
  import { mdiFormatTitle } from "@mdi/js";
  import { _ } from "svelte-i18n";
  import { fade, scale } from "svelte/transition";

  import Stackable from "./Stackable.svelte";
  import Input from "../components/Input.svelte";
  import Button from "../components/Button.svelte";
  import type { DetailsManga } from "../lib/manga";
  import FullScreenLoader from "./FullScreenLoader.svelte";

  const { pop, push } = getContext("stack") as any;

  let title: string = "";

  export let isExtra: boolean = false;
  export let manga: DetailsManga;
  export let zIndex: number;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<Stackable {zIndex}>
  <div class="background" on:click={pop} transition:fade />
  <div class="container" transition:scale>
    <h3>{$_("createChapter")}</h3>
    <Input
      bind:value={title}
      leftIcon={mdiFormatTitle}
      placeholder={$_("title")}
    />
    <div>
      <span>{$_("extra")}: </span>
      <input type="checkbox" bind:checked={isExtra} />
    </div>
    <div class="actions">
      <Button fullWidth warning outline on:click={pop}>{$_("close")}</Button>
      <Button
        fullWidth
        on:click={async () => {
          push(FullScreenLoader);
          const result = await manga.createChapter(title, isExtra);
          pop();

          if (result) pop();
          else alert($_("failedToCreateTheChapter"));
        }}>{$_("create")}</Button
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
    padding: 1rem;
    max-width: 30rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    h3 {
      margin: 0;
    }

    div {
      align-self: flex-start;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      width: 100%;
    }
  }
</style>
