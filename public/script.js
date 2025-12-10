// API Base URL - يعمل محلياً وعلى السيرفر
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/tasks' 
    : '/api/tasks';

// DOM Elements
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const themeToggle = document.getElementById('themeToggle');
const editModal = document.getElementById('editModal');
const editTaskId = document.getElementById('editTaskId');
const editTaskTitle = document.getElementById('editTaskTitle');
const editTaskDescription = document.getElementById('editTaskDescription');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');

// Stats Elements
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');

// State
let tasks = [];
let currentFilter = 'all';

// ==================== Toast Notifications ====================
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== Theme ====================
function loadTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
}

// ==================== Stats ====================
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    
    // Update progress bar
    updateProgress(total, completed);
}

// ==================== Progress Bar ====================
function updateProgress(total, completed) {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    if (total === 0) {
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
    } else {
        const percent = Math.round((completed / total) * 100);
        progressFill.style.width = percent + '%';
        progressPercent.textContent = percent + '%';
    }
}

// ==================== API Functions ====================

// Get all tasks
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            tasks = data.data;
            renderTasks();
            updateStats();
        }
    } catch (error) {
        showToast('خطأ في الاتصال بالسيرفر', 'error');
        console.error('Error:', error);
    }
}

// Add new task
async function addTask() {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    
    if (!title) {
        showToast('الرجاء إدخال عنوان المهمة', 'error');
        taskTitle.focus();
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });
        
        const data = await response.json();
        
        if (data.success) {
            tasks.unshift(data.data);
            renderTasks();
            updateStats();
            taskTitle.value = '';
            taskDescription.value = '';
            showToast('تمت إضافة المهمة بنجاح', 'success');
        } else {
            showToast(data.message || 'حدث خطأ', 'error');
        }
    } catch (error) {
        showToast('خطأ في الاتصال بالسيرفر', 'error');
        console.error('Error:', error);
    }
}


// Toggle task completion
async function toggleComplete(id) {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !task.completed })
        });
        
        const data = await response.json();
        
        if (data.success) {
            task.completed = data.data.completed;
            renderTasks();
            updateStats();
            showToast(task.completed ? 'تم إكمال المهمة ✓' : 'تم إلغاء الإكمال', 'success');
        }
    } catch (error) {
        showToast('خطأ في تحديث المهمة', 'error');
        console.error('Error:', error);
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            tasks = tasks.filter(t => t._id !== id);
            renderTasks();
            updateStats();
            showToast('تم حذف المهمة', 'success');
        }
    } catch (error) {
        showToast('خطأ في حذف المهمة', 'error');
        console.error('Error:', error);
    }
}

// Open edit modal
function openEditModal(id) {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    
    editTaskId.value = id;
    editTaskTitle.value = task.title;
    editTaskDescription.value = task.description || '';
    editModal.classList.add('show');
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('show');
    editTaskId.value = '';
    editTaskTitle.value = '';
    editTaskDescription.value = '';
}

// Save edited task
async function saveEdit() {
    const id = editTaskId.value;
    const title = editTaskTitle.value.trim();
    const description = editTaskDescription.value.trim();
    
    if (!title) {
        showToast('الرجاء إدخال عنوان المهمة', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const taskIndex = tasks.findIndex(t => t._id === id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = data.data;
            }
            renderTasks();
            closeEditModal();
            showToast('تم تحديث المهمة بنجاح', 'success');
        }
    } catch (error) {
        showToast('خطأ في تحديث المهمة', 'error');
        console.error('Error:', error);
    }
}

// ==================== Render Functions ====================
function renderTasks() {
    let filteredTasks = tasks;
    
    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    }
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task._id}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
            </div>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-actions">
                <button class="task-btn complete" onclick="toggleComplete('${task._id}')">
                    ${task.completed ? '↩️ إلغاء' : '✓ تم'}
                </button>
                <button class="task-btn edit" onclick="openEditModal('${task._id}')">
                    ✏️ تعديل
                </button>
                <button class="task-btn delete" onclick="deleteTask('${task._id}')">
                    🗑️ حذف
                </button>
            </div>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== Event Listeners ====================
addTaskBtn.addEventListener('click', addTask);

taskTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

themeToggle.addEventListener('click', toggleTheme);
saveEditBtn.addEventListener('click', saveEdit);
cancelEditBtn.addEventListener('click', closeEditModal);

editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// ==================== Initialize ====================
loadTheme();
fetchTasks();
