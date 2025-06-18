# Smart Kaboom - Build Instructions

## Overview
Smart Kaboom has been packaged as a standalone desktop application using Tauri for macOS and Windows.

## Prerequisites

### For Building:
1. **Node.js** (v16 or higher)
2. **Rust** (installed via rustup)
3. **System dependencies:**
   - **macOS**: Xcode Command Line Tools
   - **Windows**: Microsoft Visual Studio C++ Build tools

## Quick Setup

### Install Rust (if not already installed):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Install Dependencies:
```bash
npm install
```

## Building the App

### Development Mode:
```bash
npm run tauri:dev
```

### Production Build:

#### For macOS (current platform):
```bash
npm run tauri:build
```

**Note**: The build system automatically detects desktop vs web builds using the `TAURI_BUILD` environment variable.

#### For Windows (requires Windows machine):
```bash
# On Windows machine with Visual Studio Build Tools installed:
npm install
npm run tauri:build
```

#### Cross-Platform Build Options:

##### 1. GitHub Actions (Recommended)
The repository includes a GitHub Actions workflow that automatically builds for all platforms:

```bash
# Create a git tag to trigger builds
git tag v1.0.0
git push origin v1.0.0
```

This will create releases for:
- macOS (Intel & Apple Silicon)
- Windows (x64)
- Linux (AppImage)

##### 2. Manual Options:
- **Windows VM**: Use VMware/Parallels to run Windows
- **Cloud CI**: Use services like AppVeyor, Azure DevOps

## Output Locations

After building, you'll find the packaged apps in:

### macOS:
- **DMG Installer**: `src-tauri/target/release/bundle/dmg/Smart Kaboom_1.0.0_aarch64.dmg`
- **App Bundle**: `src-tauri/target/release/bundle/macos/Smart Kaboom.app`

### Windows (requires Windows machine or VM):
- **MSI Installer**: `src-tauri/target/release/bundle/msi/Smart Kaboom_1.0.0_x64_en-US.msi`
- **EXE**: `src-tauri/target/release/smart-kaboom.exe`
- **NSIS Installer**: `src-tauri/target/release/bundle/nsis/Smart Kaboom_1.0.0_x64-setup.exe`

## App Features

### Game Configuration:
- **Team Names**: Customizable team names (default: Thunder Hawks vs Lightning Wolves)
- **Win Condition**: Configurable points needed to win (default: 501 points)
- **Turn Rules**: Min/Max tries per turn (default: 1-3)

### Game Features:
- **Local Multiplayer**: Two teams competing on 8x8 grids
- **Tile Types**: Points (5-100), Bombs, Lives, Multipliers, Try Again
- **Visual Feedback**: Team status flags, flying coin animations
- **Settings Persistence**: All settings saved locally

## Distribution

### macOS:
1. The `.dmg` file can be distributed and installed by users
2. Users can drag "Smart Kaboom.app" to their Applications folder
3. First launch may require allowing the app in System Preferences > Security & Privacy

### Windows:
1. The `.msi` installer provides a standard Windows installation experience
2. The standalone `.exe` can be run directly without installation

## Technical Details

- **Frontend**: SvelteKit with Tailwind CSS
- **Desktop Framework**: Tauri 2.0
- **Icons**: Auto-generated from bomb.svg asset
- **Window Size**: 1400x900 (minimum 1200x800)
- **Offline**: Fully functional without internet connection

## Troubleshooting

### Build Issues:
1. Ensure Rust is properly installed: `rustc --version`
2. Update Rust: `rustup update`
3. Clear build cache: `rm -rf src-tauri/target`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

### Runtime Issues:
1. Check that all assets are properly bundled
2. Verify app permissions on macOS
3. Ensure Visual C++ Redistributable is installed on Windows

## Development Notes

The app is configured as a Single Page Application (SPA) with client-side rendering, making it ideal for desktop packaging with Tauri. All game logic runs locally with no server dependencies.