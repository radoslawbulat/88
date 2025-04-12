// DOM Elements
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');
const progressBar = document.getElementById('progress-bar');
const categoryLabel = document.getElementById('category-label');
const overallCompletedCount = document.getElementById('overall-completed-count');
const overallTotalCount = document.getElementById('overall-total-count');
const overallProgressBar = document.getElementById('overall-progress-bar');
const overallProgressContainer = document.getElementById('overall-progress-container');
const categoryTabs = document.getElementById('category-tabs');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryModal = document.getElementById('category-modal');
const closeCategoryModal = document.getElementById('close-category-modal');
const newCategoryInput = document.getElementById('new-category-input');
const saveCategoryBtn = document.getElementById('save-category-btn');

// Calendar Elements
const calendarDays = document.getElementById('calendar-days');
const currentMonthElement = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const currentDateElement = document.getElementById('current-date');
const yesterdayBtn = document.getElementById('yesterday-btn');
const todayBtn = document.getElementById('today-btn');
const tomorrowBtn = document.getElementById('tomorrow-btn');
const calendarBtn = document.getElementById('calendar-btn');
const calendarModal = document.getElementById('calendar-modal');
const closeCalendarModal = document.getElementById('close-calendar-modal');

// Move Task Dialog Elements
const moveTaskModal = document.getElementById('move-task-modal');
const closeMoveTaskModal = document.getElementById('close-move-task-modal');
const moveDateInput = document.getElementById('move-date-input');
const saveMoveTaskBtn = document.getElementById('save-move-task-btn');
const movePrevDayBtn = document.getElementById('move-prev-day-btn');
const moveNextDayBtn = document.getElementById('move-next-day-btn');

// Focus-related elements
const focusModal = document.getElementById('focus-modal');
const focusTaskName = document.getElementById('focus-task-name');
const focusTimer = document.getElementById('focus-timer');
const focusStartBtn = document.getElementById('focus-start-btn');
const focusPauseBtn = document.getElementById('focus-pause-btn');
const focusResetBtn = document.getElementById('focus-reset-btn');
const focusDoneBtn = document.getElementById('focus-done-btn');
const focusCancelBtn = document.getElementById('focus-cancel-btn');
const focusModeIndicator = document.getElementById('focus-mode-indicator');
const focusSessionCount = document.getElementById('focus-session-count');

// Summary elements
const summarizeBtn = document.getElementById('summarize-btn');
const summaryModal = document.getElementById('summary-modal');
const closeSummaryModal = document.getElementById('close-summary-modal');
const summaryLoading = document.getElementById('summary-loading');
const summaryContainer = document.getElementById('summary-container');
const summaryText = document.getElementById('summary-text');
const copySummaryBtn = document.getElementById('copy-summary-btn');

// Notification sound element
const notificationSound = document.getElementById('notification-sound');

// Application state
let tasks = [];
let categories = [];
let activeCategory = '';
let activeDate = '';
let currentTaskToMove = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Focus state
let focusState = {
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  timeRemaining: 25 * 60,
  isRunning: false,
  isWorkMode: true,
  sessionCount: 0,
  interval: null,
  taskId: null
};

// Load tasks, categories, and active date when the app starts
window.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  activeDate = await window.taskAPI.getActiveDate();
  activeCategory = await window.taskAPI.getActiveCategory();
  await setActiveCategory(activeCategory);
  await loadTasks();
  updateActiveDateButton();
});

// Add task when button is clicked
addTaskBtn.addEventListener('click', addTask);

// Add task when Enter key is pressed in the input field
newTaskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Open category modal
addCategoryBtn.addEventListener('click', () => {
  categoryModal.classList.add('show');
  newCategoryInput.focus();
});

// Close category modal
closeCategoryModal.addEventListener('click', () => {
  categoryModal.classList.remove('show');
  newCategoryInput.value = '';
});

// Save new category
saveCategoryBtn.addEventListener('click', addCategory);

// Add category when Enter key is pressed in the input field
newCategoryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addCategory();
  }
});

// Close move task modal
closeMoveTaskModal.addEventListener('click', () => {
  moveTaskModal.classList.remove('show');
  currentTaskToMove = null;
});

// Save task move
saveMoveTaskBtn.addEventListener('click', async () => {
  if (currentTaskToMove && moveDateInput.value) {
    tasks = await window.taskAPI.moveTaskDate(currentTaskToMove, moveDateInput.value);
    moveTaskModal.classList.remove('show');
    currentTaskToMove = null;
    await loadTasks();
    updateActiveDateButton();
  }
});

// Move to previous day
movePrevDayBtn.addEventListener('click', () => {
  if (moveDateInput.value) {
    const currentDate = new Date(moveDateInput.value);
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    moveDateInput.value = prevDay.toISOString().split('T')[0];
  }
});

// Move to next day
moveNextDayBtn.addEventListener('click', () => {
  if (moveDateInput.value) {
    const currentDate = new Date(moveDateInput.value);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    moveDateInput.value = nextDay.toISOString().split('T')[0];
  }
});

// Open calendar modal
calendarBtn.addEventListener('click', () => {
  renderCalendar(currentMonth, currentYear);
  calendarModal.classList.add('show');
});

// Close calendar modal
closeCalendarModal.addEventListener('click', () => {
  calendarModal.classList.remove('show');
});

// Calendar navigation
prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

// Date navigation event listeners
yesterdayBtn.addEventListener('click', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];
  await navigateToDate(yesterdayFormatted);
});

todayBtn.addEventListener('click', async () => {
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  await navigateToDate(todayFormatted);
});

tomorrowBtn.addEventListener('click', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
  await navigateToDate(tomorrowFormatted);
});

// Make the current date element clickable to show the calendar
// currentDateElement.addEventListener('click', () => {
//   const currentDate = new Date(activeDate);
//   renderCalendar(currentDate.getMonth(), currentDate.getFullYear());
//   calendarModal.classList.add('show');
// });

// Navigate to a different date
async function navigateToDate(date) {
  activeDate = date;
  await window.taskAPI.setActiveDate(date);
  await loadTasks();
  updateActiveDateButton();
}

// Function to update the active date button
function updateActiveDateButton() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
  
  // Reset all buttons to inactive
  yesterdayBtn.classList.remove('active');
  todayBtn.classList.remove('active');
  tomorrowBtn.classList.remove('active');
  
  // Set the appropriate button to active
  if (activeDate === yesterdayFormatted) {
    yesterdayBtn.classList.add('active');
  } else if (activeDate === today) {
    todayBtn.classList.add('active');
  } else if (activeDate === tomorrowFormatted) {
    tomorrowBtn.classList.add('active');
  }
  
  // Update the current date display
  updateCurrentDateDisplay();
}

// Function to update the current date display
function updateCurrentDateDisplay() {
  const dateObj = new Date(activeDate);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = dateObj.toLocaleDateString('en-US', options);
  currentDateElement.textContent = formattedDate;
}

// Function to add a new task
async function addTask() {
  const taskText = newTaskInput.value.trim();
  
  if (taskText) {
    tasks = await window.taskAPI.addTask(taskText);
    newTaskInput.value = '';
    renderTasks();
  }
}

// Function to toggle task completion status
async function toggleTask(taskId) {
  tasks = await window.taskAPI.toggleTask(taskId);
  renderTasks();
}

// Function to delete a task
async function deleteTask(taskId) {
  try {
    tasks = await window.taskAPI.deleteTask(taskId);
    renderTasks();
  } catch (err) {
    console.error('Error deleting task:', err);
  }
}

// Function to edit a task
async function editTask(taskId, newText) {
  if (newText.trim()) {
    tasks = await window.taskAPI.editTask(taskId, newText);
    renderTasks();
  }
}

// Function to open move task dialog
function openMoveTaskDialog(taskId) {
  currentTaskToMove = taskId;
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    moveDateInput.value = task.date;
    moveTaskModal.classList.add('show');
  }
}

// Function to add a new category
async function addCategory() {
  const categoryName = newCategoryInput.value.trim();
  
  if (categoryName) {
    categories = await window.taskAPI.addCategory(categoryName);
    newCategoryInput.value = '';
    categoryModal.classList.remove('show');
    renderCategories();
    await setActiveCategory(categoryName);
  }
}

// Function to delete a category
async function deleteCategory(categoryName) {
  categories = await window.taskAPI.deleteCategory(categoryName);
  renderCategories();
  // If active category was deleted, we don't need to call setActiveCategory
  // as the main process already handled this
  const newActiveCategory = await window.taskAPI.getActiveCategory();
  if (activeCategory !== newActiveCategory) {
    await setActiveCategory(newActiveCategory);
  }
}

// Function to set the active category
async function setActiveCategory(category) {
  // Update the active category in the backend
  activeCategory = await window.taskAPI.setActiveCategory(category);
  
  // Update the UI to highlight the active category
  const categoryTabs = document.querySelectorAll('.category-tab');
  categoryTabs.forEach(tab => {
    if (tab.dataset.category === category) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Disable task creation form if "All" category is selected
  const newTaskInput = document.getElementById('new-task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  
  if (category === 'All') {
    newTaskInput.disabled = true;
    addTaskBtn.disabled = true;
    newTaskInput.placeholder = 'Select a specific category to add tasks...';
    categoryLabel.textContent = '';
    overallProgressContainer.classList.add('hidden');
  } else {
    newTaskInput.disabled = false;
    addTaskBtn.disabled = false;
    newTaskInput.placeholder = 'Add a new task...';
    categoryLabel.textContent = `${category}: \u00A0`; // Adding non-breaking space after the colon
    // Show overall progress when a specific category is selected
    overallProgressContainer.classList.remove('hidden');
    
    // Get all tasks for the current day to calculate overall progress
    // We use the current active date (stored in the activeDate variable)
    const allTasks = await window.taskAPI.getTasks();
    const tasksForCurrentDay = allTasks.filter(task => task.date === activeDate);
    const completedTasksForDay = tasksForCurrentDay.filter(task => task.completed).length;
    
    // Update overall progress bar for the current day
    updateOverallProgressBar(completedTasksForDay, tasksForCurrentDay.length);
  }
  
  // Get the tasks for the active category and render them
  tasks = await window.taskAPI.getTasksByCategory(activeCategory);
  renderTasks();
}

// Function to set the active date
async function setActiveDate(date) {
  activeDate = await window.taskAPI.setActiveDate(date);
  tasks = await window.taskAPI.getTasksByCategory(activeCategory);
  renderTasks();
}

// Function to load tasks from the store
async function loadTasks() {
  if (activeCategory) {
    tasks = await window.taskAPI.getTasksByCategory(activeCategory);
  } else {
    tasks = await window.taskAPI.getTasks();
  }
  renderTasks();
}

// Function to load categories from the store
async function loadCategories() {
  categories = await window.taskAPI.getCategories();
  renderCategories();
}

// Function to render categories in the UI
function renderCategories() {
  // Clear the category tabs
  categoryTabs.innerHTML = '';
  
  // Sort categories to ensure "All" is first, followed by others alphabetically
  const sortedCategories = [...categories].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return a.localeCompare(b);
  });
  
  // Create a container for draggable categories (not including "All")
  const draggableContainer = document.createElement('div');
  draggableContainer.className = 'draggable-categories';
  draggableContainer.style.display = 'flex';
  draggableContainer.style.flexGrow = '1';
  draggableContainer.style.overflowX = 'auto';
  
  // Add "All" category first (non-draggable)
  if (sortedCategories.includes('All')) {
    const allCategoryTab = createCategoryTab('All');
    categoryTabs.appendChild(allCategoryTab);
  }
  
  // Add the draggable container
  categoryTabs.appendChild(draggableContainer);
  
  // Add the rest of the categories to the draggable container
  sortedCategories.filter(category => category !== 'All').forEach(category => {
    const categoryTab = createCategoryTab(category, true);
    draggableContainer.appendChild(categoryTab);
  });
  
  // Setup drag and drop for the container
  setupContainerDragDrop(draggableContainer);
}

// Function to create a category tab
function createCategoryTab(category, draggable = false) {
  // Create category tab
  const categoryTab = document.createElement('div');
  categoryTab.className = `category-tab ${category === activeCategory ? 'active' : ''}`;
  categoryTab.dataset.category = category;
  
  if (draggable) {
    categoryTab.setAttribute('draggable', 'true');
  }
  
  // Create category name span
  const categoryName = document.createElement('span');
  categoryName.className = 'category-name';
  categoryName.textContent = category;
  
  // Create delete button (only for non-protected categories)
  const deleteBtn = document.createElement('span');
  deleteBtn.className = 'delete-category';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent category activation when deleting
    deleteCategory(category);
  });
  
  // Add click event to select this category
  categoryTab.addEventListener('click', () => {
    setActiveCategory(category);
  });
  
  // Append elements to category tab
  categoryTab.appendChild(categoryName);
  if (category !== 'All') {
    categoryTab.appendChild(deleteBtn);
  }
  
  return categoryTab;
}

// Function to setup drag and drop for the container
function setupContainerDragDrop(container) {
  let draggedElement = null;
  
  // Add event listeners to all draggable children
  Array.from(container.children).forEach(element => {
    if (element.getAttribute('draggable') === 'true') {
      // Drag Start
      element.addEventListener('dragstart', function(e) {
        console.log('Dragstart:', this.dataset.category);
        draggedElement = this;
        this.classList.add('dragging');
        
        // Required for Firefox
        e.dataTransfer.setData('text/plain', '');
        
        // Take a snapshot of the current category order
        window.currentOrder = Array.from(container.children).map(
          el => el.dataset.category
        );
      });
      
      // Drag End
      element.addEventListener('dragend', function() {
        console.log('Dragend:', this.dataset.category);
        this.classList.remove('dragging');
        draggedElement = null;
        
        // Get the new order and save it
        const newOrder = Array.from(container.children).map(
          el => el.dataset.category
        );
        
        console.log('New order:', newOrder);
        
        // Only save if the order actually changed
        if (JSON.stringify(window.currentOrder) !== JSON.stringify(newOrder)) {
          saveNewCategoryOrder(['All', ...newOrder]);
        }
      });
      
      // Drag Over
      element.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (!draggedElement || draggedElement === this) return;
        
        // Get the position of the dragged element and this element
        const draggingRect = draggedElement.getBoundingClientRect();
        const targetRect = this.getBoundingClientRect();
        
        // Compare the positions to determine if it should be moved before or after the target
        const position = (e.clientX - targetRect.left) / targetRect.width;
        
        if (position < 0.5) {
          container.insertBefore(draggedElement, this);
        } else {
          container.insertBefore(draggedElement, this.nextSibling);
        }
      });
    }
  });
}

// Function to save the new category order
async function saveNewCategoryOrder(newCategoryOrder) {
  console.log('Saving new category order:', newCategoryOrder);
  try {
    // Save to the store
    await window.taskAPI.setCategories(newCategoryOrder);
    // Update the local categories array
    categories = newCategoryOrder;
    console.log('Category order saved successfully');
  } catch (error) {
    console.error('Error saving category order:', error);
  }
}

// Function to render tasks in the UI
async function renderTasks() {
  // Clear the task list
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';
  
  // No tasks message if there are no tasks for the current date and category
  if (tasks.length === 0) {
    const noTasksMessage = document.createElement('li');
    noTasksMessage.className = 'no-tasks-message';
    noTasksMessage.textContent = 'No tasks for this date and category';
    taskList.appendChild(noTasksMessage);
    
    updateProgressBar(0, 0);
    return;
  }
  
  // Count completed and total tasks for the progress bar
  const completedTasks = tasks.filter(task => task.completed).length;
  updateProgressBar(completedTasks, tasks.length);
  
  // Sort tasks by completion status and then by priority (high to low)
  const sortedTasks = tasks.slice().sort((a, b) => {
    // First, sort by completion status (completed tasks at the bottom)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by priority (high to low)
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    const aPriority = a.priority || 'medium';
    const bPriority = b.priority || 'medium';
    
    return priorityOrder[aPriority] - priorityOrder[bPriority];
  });
  
  // Render each task
  sortedTasks.forEach(task => {
    // Create task item container
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.dataset.taskId = task.id;
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    // Create task content div (holds text and category tag)
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    // Create a container for tags (category and priority)
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'tags-container';
    tagsContainer.style.display = 'flex';
    tagsContainer.style.gap = '5px';
    
    // Create category tag (only display if in "All" view or if category doesn't match active category)
    if (activeCategory === 'All' || (task.category && task.category !== activeCategory)) {
      const categoryTag = document.createElement('span');
      categoryTag.className = 'category-tag category-tag-clickable';
      categoryTag.textContent = task.category || 'Uncategorized';
      
      // Add click handler to show category picker instead of just setting active category
      categoryTag.addEventListener('click', (e) => {
        e.stopPropagation();
        showCategoryPicker(e.target, task.id, task.category);
      });
      
      tagsContainer.appendChild(categoryTag);
    }
    
    // Create priority tag
    const priorityTag = document.createElement('span');
    priorityTag.className = 'category-tag priority-tag'; // Using the same style as category tag plus the priority specific class
    
    // Capitalize first letter of priority
    const priorityValue = task.priority || 'medium';
    const capitalizedPriority = priorityValue.charAt(0).toUpperCase() + priorityValue.slice(1);
    
    priorityTag.textContent = capitalizedPriority;
    priorityTag.addEventListener('click', (e) => {
      e.stopPropagation();
      showPriorityPicker(e.target, task.id);
    });
    tagsContainer.appendChild(priorityTag);
    
    // Add the tags container to task content
    taskContent.appendChild(tagsContainer);
    
    // Create task text with contenteditable
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;
    taskText.contentEditable = true;
    taskText.spellcheck = false;
    
    // Handle focus and blur events for editing
    taskText.addEventListener('focus', () => {
      if (!task.completed) {
        taskText.classList.add('editing');
        // Store original text in case editing is cancelled
        taskText.dataset.originalText = taskText.textContent;
      } else {
        // Don't allow editing completed tasks
        taskText.blur();
      }
    });
    
    taskText.addEventListener('blur', () => {
      taskText.classList.remove('editing');
      const newText = taskText.textContent.trim();
      const originalText = taskText.dataset.originalText;
      
      // Only update if text has changed
      if (newText !== originalText && newText !== '') {
        editTask(task.id, newText);
      } else if (newText === '') {
        // If the text is empty, revert to original
        taskText.textContent = originalText;
      }
    });
    
    // Handle key presses - Enter to save, Escape to cancel
    taskText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        taskText.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        taskText.textContent = taskText.dataset.originalText;
        taskText.blur();
      }
    });
    
    // Add the task text
    taskContent.appendChild(taskText);
    
    // Create task actions container
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    // Create dropdown for settings
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    
    // Create settings icon
    const settingsIcon = document.createElement('span');
    settingsIcon.className = 'settings-icon';
    settingsIcon.innerHTML = '&#8942;'; // Vertical ellipsis
    settingsIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(task.id);
    });
    
    // Create dropdown content
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-content';
    dropdownContent.id = `dropdown-${task.id}`;
    
    // Add Focus option
    const focusOption = document.createElement('a');
    focusOption.href = '#';
    focusOption.textContent = 'Focus';
    focusOption.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startFocus(task);
      closeAllDropdowns();
    });
    dropdownContent.appendChild(focusOption);
    
    // Add Move option
    const moveOption = document.createElement('a');
    moveOption.href = '#';
    moveOption.textContent = 'Move';
    moveOption.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMoveTaskDialog(task.id);
      closeAllDropdowns();
    });
    dropdownContent.appendChild(moveOption);
    
    // Add Move to Next Day option
    const moveToNextDayOption = document.createElement('a');
    moveToNextDayOption.href = '#';
    moveToNextDayOption.textContent = 'Move to Next Day';
    moveToNextDayOption.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await moveTaskToNextDay(task.id);
      closeAllDropdowns();
    });
    dropdownContent.appendChild(moveToNextDayOption);
    
    // Add Delete option
    const deleteOption = document.createElement('a');
    deleteOption.href = '#';
    deleteOption.textContent = 'Delete';
    deleteOption.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await deleteTask(task.id);
      closeAllDropdowns();
    });
    dropdownContent.appendChild(deleteOption);
    
    // Add Priority options
    const priorityOption = document.createElement('a');
    priorityOption.href = '#';
    priorityOption.textContent = 'Set Priority';
    dropdownContent.appendChild(priorityOption);
    
    // Low priority option
    const lowPriorityOption = document.createElement('a');
    lowPriorityOption.href = '#';
    lowPriorityOption.textContent = '   Low';
    lowPriorityOption.style.paddingLeft = '25px';
    lowPriorityOption.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await updateTaskPriority(task.id, 'low');
      closeAllDropdowns();
    });
    dropdownContent.appendChild(lowPriorityOption);
    
    // Medium priority option
    const mediumPriorityOption = document.createElement('a');
    mediumPriorityOption.href = '#';
    mediumPriorityOption.textContent = '   Medium';
    mediumPriorityOption.style.paddingLeft = '25px';
    mediumPriorityOption.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await updateTaskPriority(task.id, 'medium');
      closeAllDropdowns();
    });
    dropdownContent.appendChild(mediumPriorityOption);
    
    // High priority option
    const highPriorityOption = document.createElement('a');
    highPriorityOption.href = '#';
    highPriorityOption.textContent = '   High';
    highPriorityOption.style.paddingLeft = '25px';
    highPriorityOption.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await updateTaskPriority(task.id, 'high');
      closeAllDropdowns();
    });
    dropdownContent.appendChild(highPriorityOption);
    
    // Append dropdown elements
    dropdown.appendChild(settingsIcon);
    dropdown.appendChild(dropdownContent);
    
    // Add dropdown to actions
    taskActions.appendChild(dropdown);
    
    // Append elements to task item
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskContent);
    taskItem.appendChild(taskActions);
    
    // Append task item to task list
    taskList.appendChild(taskItem);
  });
  
  // Add click event to document to close dropdowns when clicking elsewhere
  document.addEventListener('click', closeAllDropdowns);
}

// Function to toggle dropdown visibility
function toggleDropdown(taskId) {
  // Close all other dropdowns first
  closeAllDropdowns();
  
  // Toggle the current dropdown
  const dropdown = document.getElementById(`dropdown-${taskId}`);
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Function to close all dropdowns
function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown-content');
  dropdowns.forEach(dropdown => {
    if (dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  });
}

// Function to update progress bar
function updateProgressBar(completed, total) {
  completedCount.textContent = completed;
  totalCount.textContent = total;
  
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
  progressBar.style.width = `${progressPercentage}%`;
}

// Function to update overall progress bar
function updateOverallProgressBar(completed, total) {
  overallCompletedCount.textContent = completed;
  overallTotalCount.textContent = total;
  
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
  overallProgressBar.style.width = `${progressPercentage}%`;
}

// Open summary modal and generate task summary
summarizeBtn.addEventListener('click', async () => {
  summaryModal.classList.add('show');
  summaryLoading.style.display = 'flex';
  summaryContainer.style.display = 'none';
  summaryText.value = '';
  
  try {
    const result = await window.taskAPI.generateTaskSummary();
    summaryLoading.style.display = 'none';
    summaryContainer.style.display = 'flex';
    summaryText.value = result;
    summaryText.focus();
  } catch (error) {
    summaryLoading.style.display = 'none';
    summaryContainer.style.display = 'flex';
    summaryText.value = 'Error generating summary: ' + error.message;
  }
});

// Close summary modal
closeSummaryModal.addEventListener('click', () => {
  summaryModal.classList.remove('show');
});

// Copy summary to clipboard
copySummaryBtn.addEventListener('click', () => {
  // Select the text
  summaryText.select();
  
  // Copy to clipboard
  document.execCommand('copy');
  
  // Show feedback (temporarily change button text)
  const originalText = copySummaryBtn.textContent;
  copySummaryBtn.textContent = 'Copied!';
  
  // Reset button text after a short delay
  setTimeout(() => {
    copySummaryBtn.textContent = originalText;
  }, 2000);
});

// Add event listeners for Focus buttons
focusStartBtn.addEventListener('click', startTimer);
focusPauseBtn.addEventListener('click', pauseTimer);
focusResetBtn.addEventListener('click', resetTimer);
focusDoneBtn.addEventListener('click', doneFocus);
focusCancelBtn.addEventListener('click', cancelFocus);

// Add event listener for the focus timer to handle editing
focusTimer.addEventListener('blur', handleTimerEdit);
focusTimer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    focusTimer.blur();
  }
});

// Function to handle timer edit
function handleTimerEdit() {
  if (focusState.isRunning) {
    // Don't allow editing while timer is running
    updateTimerDisplay();
    return;
  }
  
  const timeText = focusTimer.textContent.trim();
  const timeMatch = timeText.match(/^(\d+):(\d+)$/);
  
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1], 10);
    const seconds = parseInt(timeMatch[2], 10);
    
    if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
      const newDuration = (minutes * 60) + seconds;
      if (newDuration > 0) {
        // Update the appropriate duration based on current mode
        if (focusState.isWorkMode) {
          focusState.workDuration = newDuration;
        } else {
          if (focusState.sessionCount > 0 && focusState.sessionCount % 4 === 0) {
            focusState.longBreakDuration = newDuration;
          } else {
            focusState.breakDuration = newDuration;
          }
        }
        
        // Update time remaining with the new duration
        focusState.timeRemaining = newDuration;
        updateTimerDisplay();
      } else {
        // Invalid duration, reset display
        updateTimerDisplay();
      }
    } else {
      // Invalid format, reset display
      updateTimerDisplay();
    }
  } else {
    // Invalid format, reset display
    updateTimerDisplay();
  }
}

// Function to start Focus for a specific task
function startFocus(task) {
  // Reset the timer state
  resetTimerState();
  
  // Set the task in the Focus modal
  focusState.taskId = task.id;
  focusTaskName.textContent = task.text;
  
  // Show the modal
  focusModal.classList.add('show');
}

// Function to close the Focus modal
function closeFocus() {
  focusModal.classList.remove('show');
  
  // If the timer is running, pause it
  if (focusState.isRunning) {
    pauseTimer();
  }
}

// Function to start the timer
function startTimer() {
  // Only start if not already running
  if (!focusState.isRunning) {
    focusState.isRunning = true;
    
    // Start the interval
    focusState.interval = setInterval(() => {
      // Decrement the time remaining
      focusState.timeRemaining--;
      
      // Update the display
      updateTimerDisplay();
      
      // Check if we've reached zero
      if (focusState.timeRemaining <= 0) {
        // Play notification sound
        playNotificationSound();
        
        // Increment session count if we just finished a work session
        if (focusState.isWorkMode) {
          focusState.sessionCount++;
          focusSessionCount.textContent = focusState.sessionCount;
          
          // Determine if we should take a long break (every 4 sessions)
          if (focusState.sessionCount % 4 === 0) {
            // Long break
            focusState.timeRemaining = focusState.longBreakDuration;
            focusModeIndicator.textContent = "Long Break";
          } else {
            // Regular break
            focusState.timeRemaining = focusState.breakDuration;
            focusModeIndicator.textContent = "Break Time";
          }
          focusState.isWorkMode = false;
        } else {
          // Switch back to work mode
          focusState.timeRemaining = focusState.workDuration;
          focusModeIndicator.textContent = "Work Time";
          focusState.isWorkMode = true;
        }
        
        // Update display with new time
        updateTimerDisplay();
      }
    }, 1000);
  }
}

// Function to play notification sound
function playNotificationSound() {
  // Reset the audio to the beginning (in case it was already playing)
  notificationSound.currentTime = 0;
  notificationSound.play().catch(error => {
    console.error("Error playing notification sound:", error);
  });
}

// Function to pause the timer
function pauseTimer() {
  if (focusState.isRunning) {
    clearInterval(focusState.interval);
    focusState.isRunning = false;
  }
}

// Function to reset the timer
function resetTimer() {
  // Pause the timer if it's running
  if (focusState.isRunning) {
    pauseTimer();
  }
  
  resetTimerState();
  updateTimerDisplay();
}

// Function to reset the timer state
function resetTimerState() {
  focusState.timeRemaining = focusState.workDuration;
  focusState.isWorkMode = true;
  focusModeIndicator.textContent = "Work Time";
}

// Function to update the timer display
function updateTimerDisplay() {
  const minutes = Math.floor(focusState.timeRemaining / 60);
  const seconds = focusState.timeRemaining % 60;
  
  // Format the time as MM:SS
  focusTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to mark task as done
function doneFocus() {
  // Mark task as completed
  toggleTask(focusState.taskId);
  
  // Close the Focus modal
  closeFocus();
}

// Function to cancel Focus
function cancelFocus() {
  // Close the Focus modal
  closeFocus();
}

// Function to render the calendar
async function renderCalendar(month, year) {
  calendarDays.innerHTML = '';
  currentMonthElement.textContent = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get all tasks for the current month for displaying indicators
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  const monthTasks = await window.taskAPI.getTasksByDateRange(startDate, endDate);
  
  // Create empty boxes for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    calendarDays.appendChild(emptyDay);
  }
  
  // Get today's date for highlighting current day
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  
  // Create calendar days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if this day has tasks
    const dayTasks = monthTasks.filter(task => task.date === dateString);
    const hasCompletedTasks = dayTasks.some(task => task.completed);
    const hasIncompleteTasks = dayTasks.some(task => !task.completed);
    
    // Add classes for styling
    if (hasCompletedTasks || hasIncompleteTasks) {
      dayElement.classList.add('has-tasks');
      if (hasCompletedTasks && !hasIncompleteTasks) {
        dayElement.classList.add('task-complete');
      }
    }
    
    // Mark current day
    if (dateString === todayFormatted) {
      dayElement.classList.add('current-day');
    }
    
    // Mark active day
    if (dateString === activeDate) {
      dayElement.classList.add('active-day');
    }
    
    // Create day number
    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    
    // Add click event to select date and close the calendar modal
    dayElement.addEventListener('click', async () => {
      await setActiveDate(dateString);
      updateActiveDateButton();
      calendarModal.classList.remove('show');
    });
    
    dayElement.appendChild(dayNumber);
    calendarDays.appendChild(dayElement);
  }
}

// Function to move a task to the next day
async function moveTaskToNextDay(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    const task = tasks[taskIndex];
    const currentDate = new Date(task.date);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayFormatted = nextDay.toISOString().split('T')[0];
    
    // Use the correct API method to move the task date
    await window.taskAPI.moveTaskDate(taskId, nextDayFormatted);
    
    // Reload tasks
    await loadTasks();
  }
}

// Function to update task priority
async function updateTaskPriority(taskId, priority) {
  await window.taskAPI.updateTaskPriority(taskId, priority);
  await loadTasks();
}

// Function to show priority picker
function showPriorityPicker(element, taskId) {
  // Remove any existing priority pickers
  document.querySelectorAll('.priority-picker').forEach(picker => picker.remove());
  
  // Create a priority picker container
  const priorityPicker = document.createElement('div');
  priorityPicker.className = 'priority-picker show';
  
  // Create priority options
  const lowPriorityOption = document.createElement('div');
  lowPriorityOption.className = 'priority-option';
  lowPriorityOption.textContent = 'Low';
  lowPriorityOption.addEventListener('click', async () => {
    await updateTaskPriority(taskId, 'low');
    priorityPicker.remove();
  });
  
  const mediumPriorityOption = document.createElement('div');
  mediumPriorityOption.className = 'priority-option';
  mediumPriorityOption.textContent = 'Medium';
  mediumPriorityOption.addEventListener('click', async () => {
    await updateTaskPriority(taskId, 'medium');
    priorityPicker.remove();
  });
  
  const highPriorityOption = document.createElement('div');
  highPriorityOption.className = 'priority-option';
  highPriorityOption.textContent = 'High';
  highPriorityOption.addEventListener('click', async () => {
    await updateTaskPriority(taskId, 'high');
    priorityPicker.remove();
  });
  
  // Append options to priority picker
  priorityPicker.appendChild(highPriorityOption); // High priority first
  priorityPicker.appendChild(mediumPriorityOption);
  priorityPicker.appendChild(lowPriorityOption);
  
  // Position the picker below the element
  const rect = element.getBoundingClientRect();
  priorityPicker.style.top = `${rect.bottom + 5}px`;
  priorityPicker.style.left = `${rect.left}px`;
  
  // Append priority picker to document body for proper positioning
  document.body.appendChild(priorityPicker);
  
  // Close picker when clicking outside
  document.addEventListener('click', function closePicker(e) {
    if (!priorityPicker.contains(e.target) && e.target !== element) {
      priorityPicker.remove();
      document.removeEventListener('click', closePicker);
    }
  });
}

// Function to show category picker
function showCategoryPicker(element, taskId, currentCategory) {
  // Remove any existing category pickers
  document.querySelectorAll('.category-picker').forEach(picker => picker.remove());
  
  // Create a category picker container
  const categoryPicker = document.createElement('div');
  categoryPicker.className = 'category-picker show';
  
  // Create category options
  categories.forEach(category => {
    const categoryOption = document.createElement('div');
    categoryOption.className = 'category-option';
    categoryOption.textContent = category;
    categoryOption.addEventListener('click', async () => {
      await window.taskAPI.updateTaskCategory(taskId, category);
      await loadTasks();
      categoryPicker.remove();
    });
    
    // Highlight the current category
    if (category === currentCategory) {
      categoryOption.classList.add('selected');
    }
    
    categoryPicker.appendChild(categoryOption);
  });
  
  // Position the picker below the element
  const rect = element.getBoundingClientRect();
  categoryPicker.style.top = `${rect.bottom + 5}px`;
  categoryPicker.style.left = `${rect.left}px`;
  
  // Append category picker to document body for proper positioning
  document.body.appendChild(categoryPicker);
  
  // Close picker when clicking outside
  document.addEventListener('click', function closePicker(e) {
    if (!categoryPicker.contains(e.target) && e.target !== element) {
      categoryPicker.remove();
      document.removeEventListener('click', closePicker);
    }
  });
}
