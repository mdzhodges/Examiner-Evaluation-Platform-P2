import express from "express";
import { RepresentativeAnswerModel } from "../../db/representative_answer.js";
import { ExaminerEvaluationModel } from "../../db/evaluation.js";
import { Examiner } from "../../db/examiner.js";
const router = express.Router();
const ALLOWED_GRADES = ["Correct", "Partially Correct", "Incorrect", "Hallucination"];
const TOTAL_QUESTIONS = 15;
const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;
router.get("/grades", (_, res) => {
    return res.status(200).json({ grades: ALLOWED_GRADES });
});
router.get("/login", async (req, res) => {
    try {
        const { username, timestamp } = req.query;
        if (!username) {
            return res.status(400).json({ message: "Name required" });
        }
        const now = timestamp ? new Date(timestamp) : new Date();
        if (!isBetween8And12EST(now)) {
            return res.status(403).json({ message: "Login not allowed at this time" });
        }
        const normalizedName = String(username).trim();
        let examiner = await Examiner.findOne({ examiner_name: normalizedName });
        if (examiner) {
            // Round/lockout handling
            if (examiner.current_round >= 2 && examiner.submission_time) {
                return res.status(403).json({ message: "All evaluation rounds completed." });
            }
            if (examiner.current_round === 1 && examiner.submission_time) {
                const nextRoundAt = new Date(examiner.submission_time.getTime() + TWO_WEEKS_MS);
                if (now < nextRoundAt) {
                    return res.status(403).json({
                        message: "Next evaluation round not yet available.",
                        nextRoundAt
                    });
                }
                examiner.current_round = 2;
                examiner.submission_time = null;
            }
            examiner.login_time = now;
            await examiner.save();
        }
        else {
            examiner = await Examiner.create({
                examiner_name: normalizedName,
                login_time: now,
                current_round: 1
            });
        }
        return res.status(200).json({
            message: "Login allowed",
            examiner_id: examiner._id,
            round: examiner.current_round,
            login_time: examiner.login_time
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
router.get("/getQuestions", async (_, res) => {
    try {
        const representativeAnswers = await RepresentativeAnswerModel.find({}).sort({ question_id: 1 });
        res.status(200).json({
            count: representativeAnswers.length,
            data: representativeAnswers
        });
    }
    catch (error) {
        console.error("Error fetching representative answers:", error);
        res.status(500).json({ error: "Failed to fetch representative answers" });
    }
});
router.get("/nextQuestion", async (req, res) => {
    try {
        const { examiner_id } = req.query;
        if (!examiner_id) {
            return res.status(400).json({ error: "examiner_id is required" });
        }
        const examiner = await Examiner.findById(examiner_id);
        if (!examiner) {
            return res.status(404).json({ error: "Examiner not found" });
        }
        const answered = await ExaminerEvaluationModel.find({ examiner_id, round: examiner.current_round }, { representative_answer_id: 1 });
        const answeredIds = answered.map((doc) => doc.representative_answer_id.toString());
        const questionSet = await RepresentativeAnswerModel.find({})
            .sort({ question_id: 1 })
            .limit(TOTAL_QUESTIONS);
        const next = questionSet.find((q) => !answeredIds.includes(q._id.toString()));
        if (!next) {
            return res.status(200).json({
                done: true,
                message: "All questions reviewed for this round.",
                round: examiner.current_round,
                total: questionSet.length
            });
        }
        return res.status(200).json({
            done: false,
            round: examiner.current_round,
            total: questionSet.length,
            question: next
        });
    }
    catch (error) {
        console.error("Error fetching next question:", error);
        return res.status(500).json({ error: "Failed to fetch next question" });
    }
});
export const createExaminerEvaluation = async (req, res) => {
    try {
        const { examiner_id, representative_answer_id, grade } = req.body;
        if (!examiner_id || !representative_answer_id || !grade) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        if (!ALLOWED_GRADES.includes(grade)) {
            return res.status(400).json({
                error: `Grade must be one of: ${ALLOWED_GRADES.join(", ")}`
            });
        }
        const examiner = await Examiner.findById(examiner_id);
        if (!examiner) {
            return res.status(404).json({ error: "Examiner not found" });
        }
        // lockout if already submitted this round
        if (examiner.submission_time) {
            return res.status(403).json({ error: "Submissions for this round are closed" });
        }
        const questionSet = await RepresentativeAnswerModel.find({})
            .sort({ question_id: 1 })
            .limit(TOTAL_QUESTIONS);
        const targetQuestion = questionSet.find((q) => q._id.toString() === String(representative_answer_id));
        if (!targetQuestion) {
            return res.status(400).json({ error: "Question not in current evaluation set" });
        }
        const round = examiner.current_round ?? 1;
        const existing = await ExaminerEvaluationModel.findOne({
            examiner_id,
            representative_answer_id,
            round
        });
        if (existing) {
            return res.status(409).json({
                error: "Evaluation already submitted for this examiner and answer"
            });
        }
        const evaluation = await ExaminerEvaluationModel.create({
            examiner_id,
            representative_answer_id,
            grade,
            round
        });
        // If the examiner has answered all questions in this round, stamp submission_time
        const answeredCount = await ExaminerEvaluationModel.countDocuments({ examiner_id, round });
        if (questionSet.length > 0 && answeredCount >= questionSet.length) {
            examiner.submission_time = new Date();
            await examiner.save();
        }
        return res.status(201).json(evaluation);
    }
    catch (err) {
        // Duplicate evaluation (unique compound index)
        if (err.code === 11000) {
            return res.status(409).json({
                error: "Evaluation already submitted for this examiner and answer"
            });
        }
        return res.status(500).json({
            error: "Failed to create examiner evaluation"
        });
    }
};
router.post("/examinerResponse", createExaminerEvaluation);
router.post("/submitGrade", createExaminerEvaluation);
function isBetween8And12EST(date = new Date()) {
    // Get the hour directly in Eastern time to avoid double-parsing and local timezone drift.
    const hour = Number(new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour12: false,
        hour: "numeric"
    }).format(date));
    return hour >= 8 && hour < 12;
}
export const createRepresentativeAnswer = async (req, res) => {
    try {
        const { question_id, question_text, cluster_id, representative_answer_text, cluster_frequency, model_contributions } = req.body;
        if (!question_id ||
            !question_text ||
            !cluster_id ||
            !representative_answer_text ||
            !cluster_frequency ||
            !model_contributions) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        const representativeAnswer = await RepresentativeAnswerModel.create({
            question_id,
            question_text,
            cluster_id,
            representative_answer_text,
            cluster_frequency,
            model_contributions
        });
        return res.status(201).json(representativeAnswer);
    }
    catch (error) {
        return res.status(500).json({
            error: error
        });
    }
};
router.post("/addAnswer", createRepresentativeAnswer);
export default router;
