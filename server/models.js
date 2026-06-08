const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    reg_no: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, default: '' },
    date_of_birth: { type: Date },
    current_semester: { type: Number, default: 1 },
    onboarding_complete: { type: Boolean, default: false }
});

const ResultSchema = new mongoose.Schema({
    reg_no: { type: String, required: true },
    semester: { type: Number, required: true },
    subject_name: { type: String },
    grade: { type: String },
    credits: { type: Number },
    grade_points: { type: Number }
});

ResultSchema.index({ reg_no: 1, semester: 1 });

const SemesterSummarySchema = new mongoose.Schema({
    reg_no: { type: String, required: true },
    semester: { type: Number, required: true },
    gpa: { type: Number, default: 0.00 },
    total_credits: { type: Number, default: 0 }
});

SemesterSummarySchema.index({ reg_no: 1, semester: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Result = mongoose.model('Result', ResultSchema);
const SemesterSummary = mongoose.model('SemesterSummary', SemesterSummarySchema);

module.exports = { User, Result, SemesterSummary };
