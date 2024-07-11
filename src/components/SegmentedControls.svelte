<script lang="ts">
  export let segments: Array<string>;
  export let value: string = segments[0];
  export let index: number = 0;

  $: index = segments.findIndex((v) => value === v);
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container">
  <ul>
    {#each segments as segment}
      <li class:selected={segment === value} on:click={() => (value = segment)}>
        {segment}
      </li>
    {/each}
  </ul>
  <div
    class="hover"
    style:width={`calc(${100 / segments.length}% - ${index == segments.length - 1 ? "0.25" : "0"}rem)`}
    style:left={`calc(${(100 / segments.length) * index}% + ${index == 0 ? "0.25" : "0"}rem)`}
  />
</div>

<style lang="scss">
  .container {
    flex: 1;
    background-color: var(--color-chapters-background);
    padding: 0.5rem;
    border-radius: 0.5rem;
    position: relative;
    max-width: 450px;

    ul {
      display: flex;
      list-style-type: none;
      position: relative;
      padding: 0;
      margin: 0;
      z-index: 1;

      li {
        flex: 1;
        display: flex;
        justify-content: center;
        cursor: pointer;
      }

      .selected {
        font-weight: bold;
        cursor: auto;
      }
    }

    .hover {
      position: absolute;
      background-color: var(--color-background);
      border-radius: 0.5rem;
      height: calc(100% - 0.5rem);
      top: 0.25rem;
      transition: left 400ms;
    }
  }
</style>
