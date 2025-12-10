const Task = require('../models/Task');

// @desc    الحصول على جميع المهام
// @route   GET /api/tasks
// @access  Public
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المهام',
            error: error.message
        });
    }
};

// @desc    الحصول على مهمة واحدة
// @route   GET /api/tasks/:id
// @access  Public
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'المهمة غير موجودة'
            });
        }
        
        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المهمة',
            error: error.message
        });
    }
};

// @desc    إضافة مهمة جديدة
// @route   POST /api/tasks
// @access  Public
exports.createTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        // التحقق من البيانات
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'عنوان المهمة مطلوب'
            });
        }
        
        const task = await Task.create({
            title: title.trim(),
            description: description ? description.trim() : ''
        });
        
        res.status(201).json({
            success: true,
            message: 'تمت إضافة المهمة بنجاح',
            data: task
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'خطأ في إضافة المهمة',
            error: error.message
        });
    }
};

// @desc    تحديث مهمة
// @route   PUT /api/tasks/:id
// @access  Public
exports.updateTask = async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        
        let task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'المهمة غير موجودة'
            });
        }
        
        // تحديث الحقول
        if (title !== undefined) {
            if (title.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'عنوان المهمة لا يمكن أن يكون فارغاً'
                });
            }
            task.title = title.trim();
        }
        
        if (description !== undefined) {
            task.description = description.trim();
        }
        
        if (completed !== undefined) {
            task.completed = completed;
        }
        
        await task.save();
        
        res.status(200).json({
            success: true,
            message: 'تم تحديث المهمة بنجاح',
            data: task
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المهمة',
            error: error.message
        });
    }
};

// @desc    حذف مهمة
// @route   DELETE /api/tasks/:id
// @access  Public
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'المهمة غير موجودة'
            });
        }
        
        await task.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'تم حذف المهمة بنجاح',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المهمة',
            error: error.message
        });
    }
};
