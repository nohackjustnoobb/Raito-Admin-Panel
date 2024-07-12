<script lang="ts">
  import { getContext } from "svelte";

  import Swipeable from "./Swipeable.svelte";
  import { _, locale, locales } from "svelte-i18n";
  import TopBar from "../components/TopBar.svelte";
  import { connected, connection } from "../lib/connection";
  import Button from "../components/Button.svelte";
  import SetConnection from "./SetConnection.svelte";
  import ConnectionStatus from "./ConnectionStatus.svelte";
  import { setDarkMode } from "../lib/utils";

  const { push } = getContext("stack") as any;
  export let zIndex: number;

  let darkTheme: string = localStorage.getItem("darkTheme") || "0";
  $: localStorage.setItem("darkTheme", darkTheme);
</script>

<!-- svelte-ignore missing-declaration -->
<Swipeable {zIndex}>
  <div class="container">
    <TopBar />
    <div class="content">
      <h3>{$_("generalSettings")}</h3>
      <ul>
        <li>
          <span
            >{$_("connection")}:
            <b>{$_($connected ? "connected" : "disconnected")}</b></span
          >
          <Button
            outline={$connected}
            warning={$connected}
            on:click={() => {
              if ($connected) push(ConnectionStatus);
              else push(SetConnection);
            }}
          >
            {$_($connected ? "disconnect" : "connect")}
          </Button>
        </li>
        <li>
          <span>{$_("language")}: </span>
          <select
            bind:value={$locale}
            on:change={() => $locale && localStorage.setItem("lang", $locale)}
          >
            {#each $locales as locale}
              <option value={locale}>{locale}</option>
            {/each}
          </select>
        </li>
        <li>
          <span>{$_("darkTheme")}: </span>
          <select bind:value={darkTheme} on:change={setDarkMode}>
            <option value="0">{$_("auto")}</option>
            <option value="1">{$_("dark")}</option>
            <option value="2">{$_("light")}</option>
          </select>
        </li>
      </ul>
      <h3>{$_("version")}</h3>
      <ul>
        <li>
          <span>{$_("serverVersion")}:</span>
          <b>{connection.version || $_("none")}</b>
        </li>
        <li>
          <span>{$_("clientVersion")}:</span>
          <b>{PKG.version}</b>
        </li>
      </ul>
    </div>
  </div>
</Swipeable>

<style lang="scss">
  .container {
    width: calc(100% - 2rem);
    height: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .content {
    height: calc(100% - 2.5rem - max(0.5rem, env(safe-area-inset-top)));
  }

  h3 {
    margin: 0;
    margin-bottom: 0.5rem;
    margin-top: 1rem;

    &:first-child {
      margin-top: 0;
    }
  }

  ul {
    background-color: var(--color-sub-background);
    padding: 1rem;
    border-radius: 1rem;
    list-style-type: none;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 1rem;
    }
  }
</style>
