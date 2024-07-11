<script lang="ts">
  import { getContext, type SvelteComponent } from "svelte";
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiChevronLeft } from "@mdi/js";
  import { _ } from "svelte-i18n";

  import { convertRemToPixels } from "../lib/utils";

  const { pop } = getContext("stack") as any;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="topBar">
  <slot name="left">
    <div class="back" on:click={pop}>
      <SvgIcon type="mdi" path={mdiChevronLeft} size={convertRemToPixels(2)} />
      <span>{$_("back")}</span>
    </div>
  </slot>
  <div class="center">
    <slot name="center" />
  </div>
  <slot name="right" />
</div>

<style lang="scss">
  .topBar {
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    position: relative;
    align-items: center;
    margin-top: max(0.5rem, env(safe-area-inset-top));
    margin-bottom: 0.5rem;
    height: 2rem;

    .center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .back {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }
</style>
