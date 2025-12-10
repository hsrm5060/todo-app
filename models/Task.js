const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'عنوان المهمة مطلوب'],
        trim: true,
        maxlength: [100, 'العنوان يجب أن لا يتجاوز 100 حرف']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'الوصف يجب أن لا يتجاوز 500 حرف'],
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
