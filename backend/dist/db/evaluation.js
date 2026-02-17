import { Schema, model } from "mongoose";
const ExaminerEvaluationSchema = new Schema({
    examiner_id: {
        type: Schema.Types.ObjectId,
        ref: "Examiner",
        required: true,
        index: true
    },
    representative_answer_id: {
        type: Schema.Types.ObjectId,
        ref: "RepresentativeAnswer",
        required: true,
        index: true
    },
    grade: {
        type: String,
        required: true,
        enum: ["Correct", "Partially Correct", "Incorrect", "Hallucination"]
    },
    submitted_at: {
        type: Date,
        default: () => new Date()
    },
    round: {
        type: Number,
        required: true,
        min: 1,
        max: 2
    }
}, {
    collection: "examiner_evaluations"
});
ExaminerEvaluationSchema.index({ examiner_id: 1, representative_answer_id: 1, round: 1 }, { unique: true, name: "unique_examiner_question_per_round" });
export const ExaminerEvaluationModel = model("ExaminerEvaluation", ExaminerEvaluationSchema);
