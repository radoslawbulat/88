# Task List Application

A simple Electron-based task list application for macOS that allows you to:
- Add new tasks
- Mark tasks as completed
- Track daily progress with a progress bar
- Tasks reset each day for fresh tracking
- Organize tasks by categories
- Generate task summaries

## Features

- Clean, modern UI with mint green accent color scheme
- Daily progress tracking with visual progress bar
- Tasks automatically reset at the start of each new day
- Persistent storage of tasks using electron-store
- **Task Categories** - Organize tasks into different categories
- **Task Summary** - Generate and copy daily task reports to clipboard
- **Calendar View** - Navigate between days to manage tasks
- **Task Priority** - Assign priority levels to tasks 
- **Celebrations** - Visual confetti effect when completing all tasks
- **Custom Images** - Visual feedback for empty states
- **Category Persistence** - Categories remain when moving tasks between dates

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
- `assets/` - Images and sounds used in the application

## Building for Production

To build a production version of the app:

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Add build script to package.json
# Then run:
npm run build
```
