const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const ElectronStore = require('electron-store');
const { createCanvas } = require('canvas');

// Define the store for app data
const store = new ElectronStore();

// Set default values if not already set
if (!store.has('tasks')) {
  store.set('tasks', []);
}
if (!store.has('lastReset')) {
  store.set('lastReset', null);
}
if (!store.has('categories')) {
  store.set('categories', ['All']);
} else {
  // Migration: Ensure 'All' category exists for existing installations
  const categories = store.get('categories');
  if (!categories.includes('All')) {
    categories.unshift('All'); // Add 'All' at the beginning
    store.set('categories', categories);
  }
}
if (!store.has('activeCategory')) {
  store.set('activeCategory', 'All');
} else {
  // Set active category to 'All' if it doesn't exist in categories
  const activeCategory = store.get('activeCategory');
  const categories = store.get('categories');
  if (!categories.includes(activeCategory)) {
    store.set('activeCategory', 'All');
  }
}
// Set the active date (default to today)
if (!store.has('activeDate')) {
  store.set('activeDate', new Date().toISOString().split('T')[0]);
}

// Migrate existing tasks to include a date if they don't have one
const tasks = store.get('tasks');
let needsMigration = false;
tasks.forEach(task => {
  if (!task.date) {
    task.date = new Date().toISOString().split('T')[0];
    needsMigration = true;
  }
});
if (needsMigration) {
  store.set('tasks', tasks);
}

let mainWindow;
let tray = null;

// Create a canvas-based icon showing percentage
function createPercentageIcon(percentage) {
  const size = 22; // Menu bar icon size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // For menu bar, use a transparent background with just the text
  // Format percentage (no decimal places)
  const displayText = Math.round(percentage) + '%';
  
  // Use a slightly larger font size for better visibility
  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = '#333333'; // Dark gray text that works well in menu bar
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Position the text in the center of the icon
  ctx.fillText(displayText, size/2, size/2);
  
  // Create a template image (works better with macOS dark/light modes)
  const image = nativeImage.createFromDataURL(canvas.toDataURL());
  image.setTemplateImage(true);
  
  return image;
}

// Update the tray icon with current task completion
function updateTrayIcon() {
  if (!tray) return;
  
  const tasks = store.get('tasks');
  const today = new Date().toISOString().split('T')[0];
  
  // Only count today's tasks for the tray icon
  const todayTasks = tasks.filter(task => task.date === today);
  const total = todayTasks.length;
  const completed = todayTasks.filter(task => task.completed).length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  try {
    // Create a dynamic icon based on completion percentage
    const icon = createPercentageIcon(percentage);
    tray.setImage(icon);
    
    // Set tooltip to show more detailed information
    const tooltipText = `Task Manager: ${completed}/${total} tasks completed (${Math.round(percentage)}%)`;
    tray.setToolTip(tooltipText);
  } catch (error) {
    console.error('Error updating tray icon:', error);
    // Fallback to static template icon
    const iconPath = path.join(__dirname, 'assets', 'icon-template.png');
    if (fs.existsSync(iconPath)) {
      const trayIcon = nativeImage.createFromPath(iconPath);
      trayIcon.setTemplateImage(true);
      tray.setImage(trayIcon);
      tray.setToolTip('Task Manager');
    }
  }
}

function createWindow() {
  // Attempt to load the app icon
  const appIconPath = path.join(__dirname, 'assets', 'icon.png');
  let appIcon = null;
  
  if (fs.existsSync(appIconPath)) {
    appIcon = nativeImage.createFromPath(appIconPath);
  }
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 500,
    resizable: true,
    icon: appIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1e1e1e' // Dark background color
  });

  // Initialize the tray if it doesn't exist
  if (!tray) {
    initTray();
  }
  
  mainWindow.loadFile('index.html');
  
  // Open the DevTools in development
  // mainWindow.webContents.openDevTools();
  
  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Function to initialize the tray icon
function initTray() {
  // Check if we have a template icon for macOS
  const templateIconPath = path.join(__dirname, 'assets', 'icon-template.png');
  const standardIconPath = path.join(__dirname, 'assets', 'icon-standard.png');
  
  // Use template icon for macOS, standard for other platforms
  const iconPath = process.platform === 'darwin' ? templateIconPath : standardIconPath;
  
  // Create tray icon from the prepared icon
  if (fs.existsSync(iconPath)) {
    const trayIcon = nativeImage.createFromPath(iconPath);
    tray = new Tray(trayIcon);
  } else {
    // Fallback in case icon doesn't exist
    console.warn('Tray icon not found, creating default icon');
    tray = new Tray(nativeImage.createEmpty());
  }
  
  // Set tray tooltip
  tray.setToolTip('GSD Task Manager');
  
  // Update the tray with task progress
  updateTrayIcon();
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Task App',
      click: () => {
        if (mainWindow === null) {
          createWindow();
        } else {
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  // Add click handler to open app
  tray.on('click', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  // Initialize tray first to ensure it's available
  initTray();
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Keep tray instance when app is closed but not quit (macOS behavior)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Helper function to check for daily reset
async function checkDailyReset() {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const lastReset = store.get('lastReset');
  
  if (lastReset !== today) {
    const tasks = store.get('tasks');
    // Only reset tasks scheduled for today
    const updatedTasks = tasks.map(task => {
      if (task.date === today) {
        return { ...task, completed: false };
      }
      return task;
    });
    store.set('tasks', updatedTasks);
    store.set('lastReset', today);
  }
}

ipcMain.handle('get-tasks', () => {
  checkDailyReset();
  return store.get('tasks');
});

ipcMain.handle('get-tasks-by-category', (event, category) => {
  checkDailyReset();
  const activeDate = store.get('activeDate');
  const tasks = store.get('tasks');
  
  // Filter by date and category if needed
  return tasks.filter(task => {
    const dateMatches = task.date === activeDate;
    const categoryMatches = category === 'All' || task.category === category;
    return dateMatches && categoryMatches;
  });
});

ipcMain.handle('add-task', async (event, taskText) => {
  const tasks = store.get('tasks', []);
  const activeCategory = store.get('activeCategory');
  const activeDate = store.get('activeDate');
  
  // Don't add empty tasks
  if (!taskText.trim()) {
    return getFilteredTasks(activeCategory, activeDate);
  }
  
  // Create the new task
  const newTask = {
    id: Date.now().toString(),
    text: taskText,
    completed: false,
    category: activeCategory === 'All' ? null : activeCategory,
    date: activeDate,
    priority: 'medium' // Default priority
  };
  
  // Add to store and return updated filtered tasks
  tasks.push(newTask);
  store.set('tasks', tasks);
  
  // Update the tray icon when a new task is added
  updateTrayIcon();
  
  return getFilteredTasks(activeCategory, activeDate);
});

// Helper function to get filtered tasks based on category and date
function getFilteredTasks(category, date) {
  const tasks = store.get('tasks');
  return tasks.filter(task => {
    const dateMatches = task.date === date;
    const categoryMatches = category === 'All' || task.category === category;
    return dateMatches && categoryMatches;
  });
}

ipcMain.handle('toggle-task', (event, taskId) => {
  const tasks = store.get('tasks');
  const activeCategory = store.get('activeCategory');
  const activeDate = store.get('activeDate');
  
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  
  store.set('tasks', updatedTasks);
  
  // Update the tray icon when task status changes
  updateTrayIcon();
  
  return getFilteredTasks(activeCategory, activeDate);
});

ipcMain.handle('delete-task', (event, taskId) => {
  const tasks = store.get('tasks');
  const activeCategory = store.get('activeCategory');
  const activeDate = store.get('activeDate');
  
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  
  store.set('tasks', updatedTasks);
  
  // Update the tray icon when a task is deleted
  updateTrayIcon();
  
  return getFilteredTasks(activeCategory, activeDate);
});

ipcMain.handle('edit-task', (event, taskId, newText) => {
  const tasks = store.get('tasks');
  const activeCategory = store.get('activeCategory');
  const activeDate = store.get('activeDate');
  
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, text: newText };
    }
    return task;
  });
  
  store.set('tasks', updatedTasks);
  
  return getFilteredTasks(activeCategory, activeDate);
});

// New handlers for date operations
ipcMain.handle('get-active-date', () => {
  return store.get('activeDate');
});

ipcMain.handle('set-active-date', (event, date) => {
  store.set('activeDate', date);
  return date;
});

ipcMain.handle('move-task-date', (event, taskId, newDate) => {
  const tasks = store.get('tasks');
  const activeCategory = store.get('activeCategory');
  const activeDate = store.get('activeDate');
  
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, date: newDate };
    }
    return task;
  });
  
  store.set('tasks', updatedTasks);
  
  return getFilteredTasks(activeCategory, activeDate);
});

ipcMain.handle('get-tasks-by-date-range', (event, startDate, endDate) => {
  const tasks = store.get('tasks');
  
  return tasks.filter(task => {
    return task.date >= startDate && task.date <= endDate;
  });
});

// Category related handlers
ipcMain.handle('get-categories', () => {
  return store.get('categories');
});

ipcMain.handle('get-active-category', () => {
  return store.get('activeCategory');
});

ipcMain.handle('set-active-category', (event, category) => {
  store.set('activeCategory', category);
  return category;
});

ipcMain.handle('add-category', (event, categoryName) => {
  const categories = store.get('categories');
  if (!categories.includes(categoryName)) {
    categories.push(categoryName);
    store.set('categories', categories);
  }
  return categories;
});

ipcMain.handle('delete-category', (event, categoryName) => {
  const categories = store.get('categories');
  // Don't delete if it's the last category or if it's "All"
  if (categories.length <= 1 || categoryName === 'All') {
    return categories;
  }
  
  const updatedCategories = categories.filter(cat => cat !== categoryName);
  store.set('categories', updatedCategories);
  
  // Move tasks from deleted category to unassigned
  const tasks = store.get('tasks');
  const updatedTasks = tasks.map(task => {
    if (task.category === categoryName) {
      return { ...task, category: null };
    }
    return task;
  });
  store.set('tasks', updatedTasks);
  
  // If active category was deleted, set to All
  if (store.get('activeCategory') === categoryName) {
    store.set('activeCategory', 'All');
  }
  
  return updatedCategories;
});

ipcMain.handle('set-categories', (event, newCategories) => {
  // Make sure "All" category is always first
  if (newCategories.includes('All') && newCategories[0] !== 'All') {
    // Remove "All" from wherever it is
    const filteredCategories = newCategories.filter(cat => cat !== 'All');
    // Add it back at the beginning
    filteredCategories.unshift('All');
    store.set('categories', filteredCategories);
    return filteredCategories;
  }
  
  // Save the categories list
  store.set('categories', newCategories);
  return newCategories;
});

// Calendar integration - get dates that have tasks
ipcMain.handle('get-dates-with-tasks', (event, month, year) => {
  const tasks = store.get('tasks');
  
  // Get dates that have tasks for the given month
  return tasks
    .filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.getMonth() === month && taskDate.getFullYear() === year;
    })
    .map(task => task.date);
});

// Handler to update task priority
ipcMain.handle('update-task-priority', (event, taskId, priority) => {
  const tasks = store.get('tasks');
  const activeCategory = store.get('activeCategory');
  const activeDate = store.get('activeDate');
  
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, priority };
    }
    return task;
  });
  
  store.set('tasks', updatedTasks);
  
  return getFilteredTasks(activeCategory, activeDate);
});
