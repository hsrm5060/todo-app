const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

// Routes
router.route('/')
    .get(getTasks)      // GET /api/tasks - عرض كل المهام
    .post(createTask);  // POST /api/tasks - إضافة مهمة

router.route('/:id')
    .get(getTask)       // GET /api/tasks/:id - عرض مهمة واحدة
    .put(updateTask)    // PUT /api/tasks/:id - تعديل مهمة
    .delete(deleteTask); // DELETE /api/tasks/:id - حذف مهمة

module.exports = router;
