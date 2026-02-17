import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiUrl } from "./config";
import Login from "./components/login";

type Status = "idle" | "loading" | "success" | "error";

type LoginPageProps = {
    examinerId: string;
    onLoginSuccess: (payload: { examinerId: string; username: string; round: number }) => void;
};

const LoginPage = ({ examinerId, onLoginSuccess }: LoginPageProps) => {
    const [username, setUsername] = useState<string>("");
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string>("");
    const [loginTime, setLoginTime] = useState<string>("");

    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedName = username.trim();
        if (!trimmedName) {
            setStatus("error");
            setMessage("Please enter your name.");
            return;
        }

        setStatus("loading");
            setMessage("");

        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const params = new URLSearchParams({
                username: trimmedName,
                timezone
            });
            const url = `${apiUrl("/examiner/login")}?${params.toString()}`;
            const response = await fetch(url, {
                method: "GET"
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(body.message ?? "Login failed");
            }

            const nextExaminerId = body.examiner_id ?? "";
            const nextRound = body.round ?? 1;
            const nextLoginTime = body.login_time ?? "";

            setStatus("success");
            setMessage(body.message ?? "Login allowed");
            setLoginTime(nextLoginTime);
            setUsername(trimmedName);

            onLoginSuccess({
                examinerId: nextExaminerId,
                username: trimmedName,
                round: nextRound
            });

            navigate("/questions", { replace: true });
        } catch (error) {
            const fallback = error instanceof Error ? error.message : "Login failed";
            setStatus("error");
            setMessage(fallback);
        }
    };

    if (examinerId) {
        return <Navigate to="/questions" replace />;
    }

    const canSubmit = username.trim().length > 0 && status !== "loading";

    return (
        <Login
            username={username}
            status={status}
            message={message}
            loginTime={loginTime}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            onUsernameChange={setUsername}
        />
    );
};

export default LoginPage;
