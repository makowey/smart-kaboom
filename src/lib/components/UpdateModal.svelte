<script>
  // UpdateModal.svelte - Version update notification for desktop apps only
  // This modal only appears when running as a Tauri desktop application
  import { createEventDispatcher } from 'svelte';
  import { getPlatformIcon, formatFileSize } from '../services/versionCheck.js';
  
  export let updateInfo = null;
  export let visible = false;
  
  const dispatch = createEventDispatcher();
  
  function closeModal() {
    dispatch('close');
  }
  
  function downloadAsset(asset) {
    window.open(asset.downloadUrl, '_blank');
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function skipVersion() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('smartKaboom_skipVersion', updateInfo.latestVersion);
    }
    closeModal();
  }
  
  // Group assets by platform for better organization
  $: groupedAssets = updateInfo?.releaseData?.assets?.reduce((groups, asset) => {
    const platform = asset.platform;
    if (!groups[platform]) {
      groups[platform] = [];
    }
    groups[platform].push(asset);
    return groups;
  }, {}) || {};
</script>

{#if visible && updateInfo?.hasUpdate}
  <!-- Modal backdrop -->
  <div class="modal-backdrop" on:click={closeModal} role="presentation">
    <!-- Modal content -->
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-labelledby="modal-title">
      <!-- Header -->
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="update-icon">
            <i class="fas fa-download"></i>
          </div>
          <div>
            <h2 id="modal-title">New Version Available!</h2>
            <p class="version-info">
              Smart Kaboom v{updateInfo.latestVersion} 
              <span class="current-version">(you have v{updateInfo.currentVersion})</span>
            </p>
          </div>
        </div>
        <button class="close-button" on:click={closeModal} title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Release info -->
      <div class="modal-body">
        <div class="release-info">
          <h3>{updateInfo.releaseData.name}</h3>
          <p class="release-date">Released on {formatDate(updateInfo.releaseData.publishedAt)}</p>
          
          {#if updateInfo.releaseData.body}
            <div class="release-notes">
              <h4>What's New:</h4>
              <div class="release-body">
                {updateInfo.releaseData.body}
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Download section -->
        <div class="download-section">
          <h4>Download for your platform:</h4>
          
          {#each Object.entries(groupedAssets) as [platform, assets]}
            <div class="platform-group">
              <div class="platform-header">
                <i class="{getPlatformIcon(platform)}"></i>
                <span class="platform-name">{platform}</span>
              </div>
              
              {#each assets as asset}
                <button 
                  class="download-button"
                  on:click={() => downloadAsset(asset)}
                  title="Download {asset.name}"
                >
                  <div class="download-info">
                    <span class="file-name">{asset.name}</span>
                    <span class="file-size">{formatFileSize(asset.size)}</span>
                  </div>
                  <i class="fas fa-download"></i>
                </button>
              {/each}
            </div>
          {/each}
          
          {#if Object.keys(groupedAssets).length === 0}
            <p class="no-downloads">No download assets available for this release.</p>
          {/if}
        </div>
      </div>
      
      <!-- Footer -->
      <div class="modal-footer">
        <button class="skip-button" on:click={skipVersion}>
          Skip this version
        </button>
        <button class="later-button" on:click={closeModal}>
          Remind me later
        </button>
        <a 
          href={updateInfo.releaseData.htmlUrl} 
          target="_blank" 
          class="github-link"
          title="View release on GitHub"
        >
          <i class="fab fa-github"></i>
          View on GitHub
        </a>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 20px;
  }
  
  .modal-content {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    animation: modal-appear 0.3s ease-out;
  }
  
  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 24px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .update-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #10b981, #34d399);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  h2 {
    font-family: 'Alfa Slab One', cursive;
    font-size: 24px;
    color: #1f2937;
    margin: 0;
    line-height: 1.2;
  }
  
  .version-info {
    font-size: 16px;
    color: #10b981;
    font-weight: 600;
    margin: 4px 0 0;
  }
  
  .current-version {
    color: #6b7280;
    font-weight: 400;
    font-size: 14px;
  }
  
  .close-button {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
  
  .modal-body {
    padding: 20px 24px;
  }
  
  .release-info h3 {
    font-family: 'Alfa Slab One', cursive;
    font-size: 20px;
    color: #1f2937;
    margin: 0 0 8px;
  }
  
  .release-date {
    color: #6b7280;
    font-size: 14px;
    margin: 0 0 16px;
  }
  
  .release-notes h4 {
    color: #374151;
    font-size: 16px;
    font-weight: 600;
    margin: 16px 0 8px;
  }
  
  .release-body {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    line-height: 1.5;
    color: #4b5563;
    white-space: pre-wrap;
    border-left: 3px solid #10b981;
  }
  
  .download-section {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .download-section h4 {
    color: #1f2937;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px;
  }
  
  .platform-group {
    margin-bottom: 16px;
  }
  
  .platform-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #374151;
    font-weight: 600;
    font-size: 14px;
  }
  
  .platform-header i {
    font-size: 16px;
    color: #6b7280;
  }
  
  .download-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
  }
  
  .download-button:hover {
    background: linear-gradient(135deg, #10b981, #34d399);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  .download-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .file-name {
    font-weight: 500;
  }
  
  .file-size {
    font-size: 12px;
    opacity: 0.7;
  }
  
  .no-downloads {
    text-align: center;
    color: #6b7280;
    font-style: italic;
    padding: 20px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    gap: 12px;
  }
  
  .skip-button, .later-button {
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }
  
  .skip-button:hover, .later-button:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #374151;
  }
  
  .github-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #1f2937;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s ease;
  }
  
  .github-link:hover {
    background: #374151;
    transform: translateY(-1px);
  }
</style>