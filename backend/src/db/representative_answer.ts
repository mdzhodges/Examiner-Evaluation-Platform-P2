import { Schema, model, Types } from "mongoose";

export interface RepresentativeAnswer {
    question_id: number;
    question_text: string;
    cluster_id: string;
    representative_answer_text: string;
    cluster_frequency: number;
    model_contributions: {
        model_count: string;
        run_count: number;
    };

    created_at: Date;
}

const RepresentativeAnswerSchema = new Schema<RepresentativeAnswer>(
    {
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
                type: String,
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
    },
    {
        collection: "representative_answers"
    }
);

export const RepresentativeAnswerModel = model<RepresentativeAnswer>(
    "RepresentativeAnswer",
    RepresentativeAnswerSchema
);
