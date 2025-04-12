const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC API to the renderer process
contextBridge.exposeInMainWorld('taskAPI', {
  // Task operations
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  getTasksByCategory: (category) => ipcRenderer.invoke('get-tasks-by-category', category),
  addTask: (taskText) => ipcRenderer.invoke('add-task', taskText),
  toggleTask: (taskId) => ipcRenderer.invoke('toggle-task', taskId),
  deleteTask: (taskId) => ipcRenderer.invoke('delete-task', taskId),
  editTask: (taskId, newText) => ipcRenderer.invoke('edit-task', taskId, newText),
  updateTaskPriority: (taskId, priority) => ipcRenderer.invoke('update-task-priority', taskId, priority),
  
  // Category operations
  getCategories: () => ipcRenderer.invoke('get-categories'),
  getActiveCategory: () => ipcRenderer.invoke('get-active-category'),
  setActiveCategory: (category) => ipcRenderer.invoke('set-active-category', category),
  addCategory: (categoryName) => ipcRenderer.invoke('add-category', categoryName),
  deleteCategory: (categoryName) => ipcRenderer.invoke('delete-category', categoryName),
  setCategories: (categories) => ipcRenderer.invoke('set-categories', categories),
  
  // Date operations
  getActiveDate: () => ipcRenderer.invoke('get-active-date'),
  setActiveDate: (date) => ipcRenderer.invoke('set-active-date', date),
  moveTaskDate: (taskId, newDate) => ipcRenderer.invoke('move-task-date', taskId, newDate),
  getTasksByDateRange: (startDate, endDate) => ipcRenderer.invoke('get-tasks-by-date-range', startDate, endDate)
});
