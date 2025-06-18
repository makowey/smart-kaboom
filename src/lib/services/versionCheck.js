// Version check service for Smart Kaboom
const GITHUB_API_URL = 'https://api.github.com/repos/makowey/smart-kaboom/releases/latest';
const CURRENT_VERSION = '1.0.7'; // This should match package.json version

export async function checkForUpdates() {
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const release = await response.json();
    const latestVersion = release.tag_name.replace(/^app-v/, ''); // Remove 'app-v' prefix
    
    return {
      hasUpdate: compareVersions(CURRENT_VERSION, latestVersion) < 0,
      currentVersion: CURRENT_VERSION,
      latestVersion: latestVersion,
      releaseData: {
        name: release.name,
        body: release.body,
        publishedAt: release.published_at,
        htmlUrl: release.html_url,
        assets: release.assets.map(asset => ({
          name: asset.name,
          downloadUrl: asset.browser_download_url,
          size: asset.size,
          platform: detectPlatform(asset.name)
        }))
      }
    };
  } catch (error) {
    console.warn('Failed to check for updates:', error);
    return {
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      latestVersion: CURRENT_VERSION,
      error: error.message
    };
  }
}

function compareVersions(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;
    
    if (currentPart < latestPart) return -1;
    if (currentPart > latestPart) return 1;
  }
  
  return 0;
}

function detectPlatform(filename) {
  const name = filename.toLowerCase();
  
  if (name.includes('.dmg')) return 'macOS';
  if (name.includes('.msi') || name.includes('.exe')) return 'Windows';
  if (name.includes('.appimage') || name.includes('.deb') || name.includes('.rpm')) return 'Linux';
  if (name.includes('aarch64') || name.includes('arm64')) return 'macOS (Apple Silicon)';
  if (name.includes('x86_64') || name.includes('intel')) return 'macOS (Intel)';
  
  return 'Unknown';
}

export function getPlatformIcon(platform) {
  switch (platform) {
    case 'macOS':
    case 'macOS (Apple Silicon)':
    case 'macOS (Intel)':
      return 'fab fa-apple';
    case 'Windows':
      return 'fab fa-windows';
    case 'Linux':
      return 'fab fa-linux';
    default:
      return 'fas fa-download';
  }
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}