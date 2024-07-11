<script lang="ts">
  export let zIndex: number;
</script>

<div class="stackable" style:zIndex>
  <slot />
</div>

<style lang="scss">
  .stackable {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
  }
</style>
