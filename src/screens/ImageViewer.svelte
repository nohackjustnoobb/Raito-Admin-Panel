<script lang="ts">
  import { getContext } from "svelte";
  import { fade, scale } from "svelte/transition";
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiClose } from "@mdi/js";

  import Stackable from "./Stackable.svelte";
  import Image from "../components/Image.svelte";
  import { convertRemToPixels } from "../lib/utils";

  const { pop } = getContext("stack") as any;

  export let src: string;
  export let zIndex: number;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<Stackable {zIndex}>
  <div class="container">
    <div class="background" on:click={pop} transition:fade />
    <div class="content" transition:scale>
      <div class="close" on:click={pop}>
        <SvgIcon type="mdi" path={mdiClose} size={convertRemToPixels(2)} />
      </div>
      <div class="image">
        <Image {src} aspectRatio={"auto"} />
      </div>
    </div>
  </div>
</Stackable>

<style lang="scss">
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .content {
    position: relative;
    display: flex;
    max-width: 80%;
    max-height: 80%;

    .image {
      overflow-y: scroll;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .close {
      position: absolute;
      right: 0.5rem;
      top: 0.5rem;

      opacity: 0.8;
      cursor: pointer;
    }
  }
</style>
