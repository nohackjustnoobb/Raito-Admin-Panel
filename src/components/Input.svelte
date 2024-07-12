<script lang="ts">
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiClose } from "@mdi/js";
  import { convertRemToPixels } from "../lib/utils";

  export let value: string;
  export let leftIcon: string | undefined = undefined;
  export let rightIcon: string | undefined = undefined;
  export let rightIconAction: () => void = () => (value = "");
  export let hideClear: boolean = false;
  export let rows: number = 1;
  export let paddingHorizontal: string = "1rem";
  export let focused: boolean = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="wrapper"
  style:padding-left={paddingHorizontal}
  style:padding-right={paddingHorizontal}
  style:width={`calc(100% - ${paddingHorizontal} - ${paddingHorizontal})`}
>
  {#if leftIcon}
    <SvgIcon
      type="mdi"
      path={leftIcon}
      size={convertRemToPixels(1.5)}
      color="#999999"
    />
  {/if}
  {#if rows > 1}
    <textarea bind:value on:* {rows} {...$$restProps} />
  {:else}
    <input
      bind:value
      on:focus={() => (focused = true)}
      on:blur={() => setTimeout(() => (focused = false), 100)}
      on:*
      {...$$restProps}
    />
  {/if}

  {#if rows <= 1}
    <div class="rightIcon" on:click={rightIconAction}>
      {#if rightIcon}
        <SvgIcon
          type="mdi"
          path={rightIcon}
          size={convertRemToPixels(1.5)}
          color="#999999"
        />
      {:else if !hideClear}
        <SvgIcon
          type="mdi"
          path={mdiClose}
          size={convertRemToPixels(1.5)}
          color="#999999"
        />
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    position: relative;
    background-color: var(--color-search-background);
    border-radius: 1rem;
    padding: 0.5rem;
    gap: 0.5rem;
    display: flex;

    input,
    textarea {
      outline: none;
      border: none;
      background-color: transparent;
      flex: 1;
      min-width: 0;
      font-size: 1rem;
      padding: 0;
      resize: none;
      color: var(--color-text);

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .rightIcon {
      cursor: pointer;
      display: flex;
    }
  }
</style>
