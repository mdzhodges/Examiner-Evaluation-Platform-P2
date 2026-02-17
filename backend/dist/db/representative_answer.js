import { Schema, model } from "mongoose";
const RepresentativeAnswerSchema = new Schema({
    question_id: {
        type: Number,
        required: true,
        index: true
    },
    question_text: {
        type: String,
        required: true
    },
    cluster_id: {
        type: String,
        required: true,
        index: true
    },
    representative_answer_text: {
        type: String,
        required: true
    },
    cluster_frequency: {
        type: Number,
        required: true,
        min: 1
    },
    // NEVER exposed to examiners
    model_contributions: {
        model_count: {
            type: Number,
            required: true
        },
        run_count: {
            type: Number,
            required: true
        }
    },
    created_at: {
        type: Date,
        default: () => new Date()
    }
}, {
    collection: "representative_answers"
});
export const RepresentativeAnswerModel = model("RepresentativeAnswer", RepresentativeAnswerSchema);
