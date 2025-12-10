const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ملف تخزين المهام
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());

// خدمة ملفات الواجهة الأمامية
app.use(express.static(path.join(__dirname, 'public')));

// قراءة المهام من الملف
function readTasks() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// حفظ المهام في الملف
function saveTasks(tasks) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// إنشاء ID فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== API Routes ====================

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎉 مرحباً بك في API إدارة المهام',
        endpoints: {
            'GET /api/tasks': 'عرض جميع المهام',
            'POST /api/tasks': 'إضافة مهمة جديدة',
            'PUT /api/tasks/:id': 'تعديل مهمة',
            'DELETE /api/tasks/:id': 'حذف مهمة'
        }
    });
});

// عرض جميع المهام
app.get('/api/tasks', (req, res) => {
    const tasks = readTasks();
    res.json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// إضافة مهمة جديدة
app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;
    
    if (!title || title.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'عنوان المهمة مطلوب'
        });
    }
    
    const tasks = readTasks();
    
    const newTask = {
        _id: generateId(),
        title: title.trim(),
        description: description ? description.trim() : '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks(tasks);
    
    res.status(201).json({
        success: true,
        message: 'تمت إضافة المهمة بنجاح',
        data: newTask
    });
});

// تعديل مهمة
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t._id === id);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'المهمة غير موجودة'
        });
    }
    
    if (title !== undefined) {
        if (title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'عنوان المهمة لا يمكن أن يكون فارغاً'
            });
        }
        tasks[taskIndex].title = title.trim();
    }
    
    if (description !== undefined) {
        tasks[taskIndex].description = description.trim();
    }
    
    if (completed !== undefined) {
        tasks[taskIndex].completed = completed;
    }
    
    saveTasks(tasks);
    
    res.json({
        success: true,
        message: 'تم تحديث المهمة بنجاح',
        data: tasks[taskIndex]
    });
});

// حذف مهمة
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    
    let tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t._id === id);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'المهمة غير موجودة'
        });
    }
    
    tasks = tasks.filter(t => t._id !== id);
    saveTasks(tasks);
    
    res.json({
        success: true,
        message: 'تم حذف المهمة بنجاح'
    });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log(`   السيرفر يعمل على البورت ${PORT}`);
    console.log('🚀 ================================');
    console.log('');
    console.log(`📡 API: http://localhost:${PORT}/api/tasks`);
    console.log('');
});
