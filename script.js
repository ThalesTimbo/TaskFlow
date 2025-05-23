// Task Management System
class TaskManager {
    constructor() {
        this.tasks = [];
        this.editingTaskId = null;
        this.loadTasks();
        this.initEventListeners();
        this.renderTasks();
        this.updateCategoryFilter();
        
        // Hide preloader after 1 second
        setTimeout(() => {
            document.getElementById('preloader').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('preloader').style.display = 'none';
            }, 500);
        }, 1000);
    }

    initEventListeners() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Edit form submission
        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTask();
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', () => this.renderTasks());
        document.getElementById('categoryFilter').addEventListener('change', () => this.renderTasks());
        document.getElementById('statusFilter').addEventListener('change', () => this.renderTasks());

        // Mobile menu
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            const controls = document.getElementById('headerControls');
            controls.classList.toggle('active');
        });
    }

    addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const category = document.getElementById('taskCategory').value.trim() || 'Geral';
        const description = document.getElementById('taskDescription').value.trim();

        if (!title) {
            this.showToast('Por favor, insira um título para a tarefa.', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            category,
            description,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateCategoryFilter();
        this.clearForm();
        this.showToast('Tarefa adicionada com sucesso!', 'success');
    }

    updateTask() {
        const title = document.getElementById('editTaskTitle').value.trim();
        const category = document.getElementById('editTaskCategory').value.trim() || 'Geral';
        const description = document.getElementById('editTaskDescription').value.trim();
        const status = document.getElementById('editTaskStatus').value;

        if (!title) {
            this.showToast('Por favor, insira um título para a tarefa.', 'error');
            return;
        }

        const taskIndex = this.tasks.findIndex(task => task.id === this.editingTaskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title,
                category,
                description,
                status
            };

            this.saveTasks();
            this.renderTasks();
            this.updateCategoryFilter();
            this.closeEditModal();
            this.showToast('Tarefa atualizada com sucesso!', 'success');
        }
    }

    deleteTask(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.updateCategoryFilter();
            this.showToast('Tarefa excluída com sucesso!', 'success');
        }
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            if (task.status === 'pending') {
                task.status = 'in-progress';
            } else if (task.status === 'in-progress') {
                task.status = 'completed';
            } else {
                task.status = 'pending';
            }
            this.saveTasks();
            this.renderTasks();
            this.showToast('Status da tarefa atualizado!', 'success');
        }
    }

    openEditModal(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            this.editingTaskId = id;
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editTaskCategory').value = task.category;
            document.getElementById('editTaskDescription').value = task.description;
            document.getElementById('editTaskStatus').value = task.status;
            document.getElementById('editModal').classList.add('active');
        }
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        this.editingTaskId = null;
    }

    getFilteredTasks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        return this.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                                task.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || task.category === categoryFilter;
            const matchesStatus = !statusFilter || task.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }

    renderTasks() {
        const tasksGrid = document.getElementById('tasksGrid');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #b0b0c3;">
                    <i class="fas fa-tasks" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>Nenhuma tarefa encontrada</h3>
                    <p>Adicione uma nova tarefa ou ajuste os filtros.</p>
                </div>
            `;
            return;
        }

        tasksGrid.innerHTML = filteredTasks.map(task => this.createTaskCard(task)).join('');
    }

    createTaskCard(task) {
        const statusMap = {
            'pending': { text: 'Pendente', class: 'status-pending' },
            'in-progress': { text: 'Em andamento', class: 'status-in-progress' },
            'completed': { text: 'Concluída', class: 'status-completed' }
        };

        const status = statusMap[task.status];
        const formattedDate = new Date(task.createdAt).toLocaleDateString('pt-BR');

        return `
            <div class="task-card ${task.status === 'completed' ? 'completed' : task.status === 'in-progress' ? 'in-progress' : ''}">
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-category">${task.category}</span>
                    </div>
                </div>
                
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                
                <div class="task-meta">
                    <div class="task-status">
                        <span class="status-dot ${status.class}"></span>
                        <span>${status.text}</span>
                    </div>
                    <span>${formattedDate}</span>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-small" onclick="taskManager.toggleTaskStatus(${task.id})" title="Alterar Status">
                        <i class="fas fa-check-circle"></i>
                    </button>
                    <button class="btn btn-small" onclick="taskManager.openEditModal(${task.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="taskManager.deleteTask(${task.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = [...new Set(this.tasks.map(task => task.category))];
        
        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        categoryFilter.value = currentValue;
    }

    clearForm() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskCategory').value = '';
        document.getElementById('taskDescription').value = '';
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        } else {
            // Sample tasks for first-time users
            this.tasks = [
                {
                    id: 1,
                    title: 'Concluir apresentação do projeto',
                    category: 'Trabalho',
                    description: 'Finalizar slides e preparar demonstração para a reunião de segunda-feira.',
                    status: 'in-progress',
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 2,
                    title: 'Estudar React Hooks',
                    category: 'Estudos',
                    description: 'Revisar useState, useEffect e custom hooks.',
                    status: 'pending',
                    createdAt: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    id: 3,
                    title: 'Comprar ingredientes para jantar',
                    category: 'Pessoal',
                    description: '',
                    status: 'completed',
                    createdAt: new Date(Date.now() - 259200000).toISOString()
                }
            ];
        }
    }
}

// Initialize the application
let taskManager;

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        taskManager.closeEditModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        taskManager.closeEditModal();
    }
});

// Global functions for modal
function closeEditModal() {
    taskManager.closeEditModal();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});

// Add some smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add touch swipe support for mobile task cards
let startX, startY;

document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!startX || !startY) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = startX - endX;
    const deltaY = startY - endY;

    // If swipe is more horizontal than vertical and long enough
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            // Add a subtle animation feedback
            taskCard.style.transform = deltaX > 0 ? 'translateX(-10px)' : 'translateX(10px)';
            setTimeout(() => {
                taskCard.style.transform = '';
            }, 200);
        }
    }

    startX = startY = null;
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + N for new task (focus on title input)
    if (e.altKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('taskTitle').focus();
    }
    
    // Alt + S for search
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// Add auto-save functionality for form inputs
const autoSaveInputs = ['taskTitle', 'taskCategory', 'taskDescription'];
autoSaveInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
        // Load saved value
        const savedValue = sessionStorage.getItem(`autosave_${inputId}`);
        if (savedValue && savedValue.trim()) {
            input.value = savedValue;
        }

        // Save on input
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                sessionStorage.setItem(`autosave_${inputId}`, input.value);
            } else {
                sessionStorage.removeItem(`autosave_${inputId}`);
            }
        });

        // Clear on form submit
        document.getElementById('taskForm').addEventListener('submit', () => {
            sessionStorage.removeItem(`autosave_${inputId}`);
        });
    }
});

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    if (taskManager) {
        taskManager.showToast('Ocorreu um erro inesperado. Tente recarregar a página.', 'error');
    }
});

// Add performance monitoring
window.addEventListener('load', () => {
    if ('performance' in window) {
        const loadTime = performance.now();
        console.log(`TaskFlow loaded in ${Math.round(loadTime)}ms`);
    }
});

// Service Worker registration (for future PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Placeholder for future service worker implementation
        console.log('Service Worker support detected');
    });
}

// Add drag and drop functionality for task reordering
let draggedElement = null;

document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('task-card')) {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
    }
});

document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('task-card')) {
        e.target.style.opacity = '';
        draggedElement = null;
    }
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedElement && e.target.classList.contains('task-card')) {
        // Future implementation: reorder tasks
        console.log('Task reordering will be implemented here');
    }
});

// Add focus management for accessibility
document.addEventListener('keydown', (e) => {
    // Tab navigation enhancement
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
});

// Add theme persistence (for future dark/light mode toggle)
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
console.log('User prefers dark scheme:', prefersDarkScheme.matches);

// Add print styles optimization
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
}); 