<script lang="ts">
  import { getContext } from "svelte";
  import { mdiKeyChain, mdiServerNetwork } from "@mdi/js";
  import { _ } from "svelte-i18n";
  import { fade, scale } from "svelte/transition";

  import Stackable from "./Stackable.svelte";
  import Input from "../components/Input.svelte";
  import Button from "../components/Button.svelte";
  import { connection } from "../lib/connection";
  import FullScreenLoader from "./FullScreenLoader.svelte";

  const { pop, push } = getContext("stack") as any;

  let url: string = connection.url || "";
  let key: string = connection.accessKey || "";

  export let zIndex: number;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<Stackable {zIndex}>
  <div class="background" on:click={pop} transition:fade />
  <div class="container" transition:scale>
    <h3>{$_("connection")}</h3>
    <Input
      bind:value={url}
      leftIcon={mdiServerNetwork}
      placeholder={$_("serverUrl")}
    />
    <Input
      bind:value={key}
      leftIcon={mdiKeyChain}
      placeholder={$_("accessKey")}
    />
    <div class="actions">
      <Button fullWidth warning outline on:click={pop}>{$_("close")}</Button>
      <Button
        fullWidth
        on:click={async () => {
          push(FullScreenLoader);

          if (await connection.setConnectionInfo(url, key)) pop();
          else alert($_("connectionError"));

          pop();
        }}>{$_("connect")}</Button
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

    .actions {
      display: flex;
      gap: 0.5rem;
      width: 100%;
    }
  }
</style>
