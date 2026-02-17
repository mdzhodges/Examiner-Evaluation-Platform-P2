import { Schema, model } from "mongoose";
const ExaminerSchema = new Schema({
    examiner_name: {
        type: String,
        required: true,
        index: true
    },
    login_time: {
        type: Date,
        default: null
    },
    submission_time: {
        type: Date,
        default: null
    },
    current_round: {
        type: Number,
        default: 1,
        min: 1,
        max: 2
    }
}, {
    collection: "Examiner"
});
export const Examiner = model("Examiner", ExaminerSchema);
