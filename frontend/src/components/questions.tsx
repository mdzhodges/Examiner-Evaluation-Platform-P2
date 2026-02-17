import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../config";

type FetchStatus = "idle" | "loading" | "success" | "error";

type Question = {
    _id: string;
    question_id: number;
    question_text: string;
    cluster_id: string | number;
    representative_answer_text: string;
    cluster_frequency: number;
    model_contributions: Record<string, number>;
};

type QuestionsProps = {
    username: string;
    examinerId: string;
    round: number;
};

const DEFAULT_GRADES = ["Correct", "Partially Correct", "Incorrect", "Hallucination"];

const Questions = ({ username, examinerId, round }: QuestionsProps) => {
    const [status, setStatus] = useState<FetchStatus>("idle");
    const [error, setError] = useState<string>("");
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [grades, setGrades] = useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>("");
    const [done, setDone] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);

    const displayName = username.trim() || "Examiner";

    useEffect(() => {
        let cancelled = false;
        const loadInitial = async () => {
            setStatus("loading");
            setError("");
            try {
                const [gradesRes, questionRes] = await Promise.allSettled([
                    fetch(apiUrl("/examiner/grades")),
                    fetch(`${apiUrl("/examiner/nextQuestion")}?examiner_id=${examinerId}`)
                ]);

                const gradesBody = gradesRes.status === "fulfilled"
                    ? await gradesRes.value.json().catch(() => ({}))
                    : {};

                const questionBody = questionRes.status === "fulfilled"
                    ? await questionRes.value.json().catch(() => ({}))
                    : {};

                if (gradesRes.status === "rejected" || (gradesRes.status === "fulfilled" && !gradesRes.value.ok)) {
                    console.warn("Grades endpoint unavailable, using defaults", gradesBody);
                }

                if (questionRes.status === "rejected" || (questionRes.status === "fulfilled" && !questionRes.value.ok)) {
                    throw new Error(questionBody.error ?? questionBody.message ?? "Failed to load question");
                }

                if (cancelled) return;

                setGrades(
                    Array.isArray(gradesBody.grades) && gradesBody.grades.length > 0
                        ? gradesBody.grades
                        : DEFAULT_GRADES
                );

                if (questionBody.done) {
                    setDone(true);
                    setTotal(questionBody.total ?? 0);
                    setCurrentQuestion(null);
                } else {
                    setCurrentQuestion(questionBody.question as Question);
                    setTotal(questionBody.total ?? 0);
                    setSelectedGrade("");
                    setDone(false);
                }

                setStatus("success");
            } catch (err) {
                if (cancelled) return;
                const fallback = err instanceof Error ? err.message : "Failed to load data";
                setStatus("error");
                setError(fallback);
            }
        };

        if (examinerId) {
            loadInitial();
        }

        return () => {
            cancelled = true;
        };
    }, [examinerId]);

    const onSubmitGrade = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!currentQuestion || !selectedGrade) {
            return;
        }

        setStatus("loading");
        setError("");
        try {
            const response = await fetch(apiUrl("/examiner/submitGrade"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    examiner_id: examinerId,
                    representative_answer_id: currentQuestion._id,
                    grade: selectedGrade
                })
            });

            const body = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(body.error ?? body.message ?? "Failed to submit grade");
            }

            const nextRes = await fetch(`${apiUrl("/examiner/nextQuestion")}?examiner_id=${examinerId}`);
            const nextBody = await nextRes.json().catch(() => ({}));
            if (!nextRes.ok) {
                throw new Error(nextBody.error ?? nextBody.message ?? "Failed to load next question");
            }

            if (nextBody.done) {
                setDone(true);
                setCurrentQuestion(null);
                setTotal(nextBody.total ?? total);
            } else {
                setCurrentQuestion(nextBody.question as Question);
                setSelectedGrade("");
                setTotal(nextBody.total ?? total);
            }

            setStatus("success");
        } catch (err) {
            const fallback = err instanceof Error ? err.message : "Failed to submit grade";
            setStatus("error");
            setError(fallback);
        }
    };

    return (
        <div className="card questions-card">
            <header>
                <h1>Round {round} Evaluation</h1>
                <p>Welcome {displayName}. Grade each response once; categories are shown below.</p>
            </header>

            {status === "loading" && <div className="status info-block">Working...</div>}
            {status === "error" && <div className="status error">{error}</div>}
            {done && (
                <div className="status success">
                    All {total || 15} questions reviewed for this round. Thank you!
                </div>
            )}

            {!done && currentQuestion && (
                <form className="question-form" onSubmit={onSubmitGrade}>
                    <div className="question-header">
                        <span className="pill pill-quiet">Question {currentQuestion.question_id}</span>
                        <span className="pill pill-live">Total: {total || 15}</span>
                    </div>
                    <h2 className="question-title">{currentQuestion.question_text}</h2>
                    <p className="question-answer">{currentQuestion.representative_answer_text}</p>

                    <div className="grade-group">
                        <div className="grade-label">Select a grade</div>
                        <div className="grade-options">
                            {(grades.length ? grades : DEFAULT_GRADES).map((grade) => (
                                <button
                                    key={grade}
                                    type="button"
                                    className={`grade-chip ${selectedGrade === grade ? "selected" : ""}`}
                                    onClick={() => setSelectedGrade(grade)}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="submit-btn"
                        type="submit"
                        disabled={!selectedGrade || status === "loading"}
                    >
                        Submit grade
                    </button>
                </form>
            )}
        </div>
    );
};

export default Questions;
