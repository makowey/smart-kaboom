<script>
  export let message = '';
  export let show = false;
  export let type = 'info'; // 'info', 'success', 'warning', 'error'

  function getNotificationStyle(type) {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'bomb':
        return 'bg-red-600 border-red-700';
      case 'life':
        return 'bg-pink-500 border-pink-600';
      case 'multiplier':
        return 'bg-purple-500 border-purple-600';
      case 'points':
        return 'bg-green-500 border-green-600';
      case 'try_again':
        return 'bg-blue-500 border-blue-600';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  }
</script>

<!-- Debug info -->
<div class="fixed top-4 right-4 bg-black text-white p-2 rounded text-xs" style="z-index: 10000;">
  show: {show}<br>
  message: "{message}"<br>
  type: {type}
</div>

{#if show && message}
  <div class="fixed top-20 left-1/2 px-6 py-4 rounded-xl border-2 shadow-2xl {getNotificationStyle(type)} text-white font-comic font-bold text-xl transform -translate-x-1/2" style="z-index: 10000; min-width: 300px; text-align: center; position: fixed !important;">
    {message}
  </div>
{/if}

<style>
  .notification {
    pointer-events: none;
    max-width: 90vw;
    text-align: center;
  }
</style>