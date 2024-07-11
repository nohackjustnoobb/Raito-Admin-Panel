<script lang="ts">
  export let outline = false;
  export let warning = false;
  export let fullWidth = false;
</script>

<button class:outline class:warning class:fullWidth on:* {...$$restProps}>
  <slot />
</button>

<style lang="scss">
  button {
    background-color: var(--color-text);
    color: var(--color-background);
    padding: 1.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    font-size: 1rem;
    outline: none;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: bold;
  }

  button:hover {
    opacity: 0.8;
  }

  button:active {
    opacity: 0.6;
  }

  @mixin outline($color) {
    border-color: $color;
    border-style: solid;
    border-width: 1px;
    background-color: transparent;
    color: $color;
    font-weight: normal;
  }

  .outline {
    @include outline(var(--color-text));
  }

  .warning {
    background-color: var(--color-warning);
  }

  .outline.warning {
    @include outline(var(--color-warning));
  }

  .fullWidth {
    width: 100%;
    flex: 1;
  }
</style>
