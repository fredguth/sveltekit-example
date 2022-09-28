<script lang="ts">
  import { session } from "$lib/stores/session";
</script>

session:
<pre>{JSON.stringify($session, null, 2)}</pre>

<style>
  pre {
    font-size: 12px;
  }
</style>
