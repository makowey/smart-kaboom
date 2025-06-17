# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Smart Kaboom is a local multiplayer tile-flipping game designed for 2 teams of kids/teenagers at camp. Players reveal tiles on 8x8 grids to collect points, avoid bombs, and use special effects.

## Technology Stack
- **Frontend**: SvelteKit
- **Styling**: Tailwind CSS
- **Target**: Local web application for camp activities

## Game Specifications
- **Board**: 8x8 grid per team with hidden tiles
- **Point Distribution**: 1×100pts, 2×50pts, 3×30pts, 5×20pts, 10×10pts
- **Special Tiles**: 3 bombs, 2 lives, 1 x2 multiplier, remaining tiles "try one more time"
- **Gameplay**: Turn-based tile revealing with immediate feedback

## Development Setup
Since this is a greenfield project, initial setup commands will be:
```bash
git init
npm create svelte@latest .
npm install
npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography
npx tailwindcss init -p
```

## Architecture Approach
- Component-based UI with SvelteKit
- Game state management for 2-team gameplay
- Responsive design for group/camp settings
- Local multiplayer without network dependencies