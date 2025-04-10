# Task List Application

A simple Electron-based task list application for macOS that allows you to:
- Add new tasks
- Mark tasks as completed
- Track daily progress with a progress bar
- Tasks reset each day for fresh tracking

## Features

- Clean, macOS-style UI
- Daily progress tracking with visual progress bar
- Tasks automatically reset at the start of each new day
- Persistent storage of tasks using electron-store

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start the application
npm start
```

### Project Structure

- `main.js` - Main Electron process
- `preload.js` - Exposes safe APIs to the renderer process
- `index.html` - Application UI structure
- `styles.css` - Application styling
- `renderer.js` - UI logic and event handling

## Building for Production

To build a production version of the app:

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Add build script to package.json
# Then run:
npm run build
```
