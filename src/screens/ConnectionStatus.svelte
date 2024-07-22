<script lang="ts">
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { fade, scale } from "svelte/transition";
  import SvgIcon from "@jamescoyle/svelte-icon";
  import { mdiKeyChain, mdiServerNetwork } from "@mdi/js";

  import Stackable from "./Stackable.svelte";
  import Button from "../components/Button.svelte";
  import { connection } from "../lib/connection";
  import { convertRemToPixels, wheelToScrollHorizontally } from "../lib/utils";

  const { pop } = getContext("stack") as any;

  export let zIndex: number;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<Stackable {zIndex}>
  <div class="background" on:click={pop} transition:fade />
  <div class="container" transition:scale>
    <h3>{$_("connection")}</h3>
    <div class="info">
      <span>
        <SvgIcon
          type="mdi"
          path={mdiServerNetwork}
          size={convertRemToPixels(1.25)}
        />
        {$_("serverUrl")}:
      </span>
      <b on:mousewheel={wheelToScrollHorizontally("B")}>{connection.url}</b>
    </div>
    <div class="info">
      <span>
        <SvgIcon
          type="mdi"
          path={mdiKeyChain}
          size={convertRemToPixels(1.25)}
        />
        {$_("accessKey")}:
      </span>
      <b on:mousewheel={wheelToScrollHorizontally("B")}>
        {connection.accessKey || $_("none")}
      </b>
    </div>
    <div class="actions">
      <Button
        fullWidth
        warning
        outline
        on:click={() => {
          if (confirm($_("disconnectConfirmation"))) {
            connection.disconnect();
            pop();
          }
        }}>{$_("disconnect")}</Button
      >
      <Button fullWidth on:click={pop}>{$_("close")}</Button>
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

    .info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 1rem;

      span {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      b {
        user-select: all;
        overflow-y: scroll;

        &::-webkit-scrollbar {
          display: none;
        }
      }
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      width: 100%;
    }
  }
</style>
