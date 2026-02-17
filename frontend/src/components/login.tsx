import { FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

type LoginProps = {
    username: string;
    status: Status;
    message: string;
    loginTime?: string;
    canSubmit: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onUsernameChange: (value: string) => void;
};




const Login = ({
    username,
    status,
    message,
    loginTime,
    canSubmit,
    onSubmit,
    onUsernameChange
}: LoginProps) => {


    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        onUsernameChange(e.target.value);
    };

    return (
        <div className="card">
            <header>
                <h1>Examiner Login</h1>
                <p>Enter your name to access the evaluation platform.</p>
            </header>

            <form className="login-form" onSubmit={onSubmit}>
                <label className="label" htmlFor="username">
                    Name <span className="hint">Required</span>
                </label>
                <input
                    id="username"
                    className="input"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Name"
                    value={username}
                    onChange={handleChange}
                />

                <button className="submit-btn" type="submit" disabled={!canSubmit}>
                    {status === "loading" ? "Signing in..." : "Sign in"}
                </button>
            </form>

            {status === "success" && <div className="status success">{message}</div>}
            {status === "error" && <div className="status error">{message}</div>}

            <div className="info">
                <div><strong>Login window:</strong> 8:00am–12:00pm</div>
                {loginTime && <div><strong>Login time:</strong> {new Date(loginTime).toLocaleString()}</div>}
            </div>
        </div>
    );
};

export default Login;
