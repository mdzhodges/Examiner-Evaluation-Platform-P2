import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppHeader from "./components/header";
import LoginPage from "./LoginPage";
import QuestionsPage from "./QuestionsPage";
import ProtectedRoute from "./ProtectedRoute";
import { HashRouter } from "react-router-dom";


type LoginSuccess = {
    examinerId: string;
    username: string;
    round: number;
};

const App = () => {
    const [examinerId, setExaminerId] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [round, setRound] = useState<number>(1);

    const handleLoginSuccess = ({ examinerId, username, round }: LoginSuccess) => {
        setExaminerId(examinerId);
        setUsername(username);
        setRound(round);
    };

    return (
        <HashRouter>
            <AppHeader />
            <div className="page">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <LoginPage
                                examinerId={examinerId}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        }
                    />
                    <Route
                        path="/questions"
                        element={
                            <ProtectedRoute isAuthenticated={!!examinerId}>
                                <QuestionsPage
                                    examinerId={examinerId}
                                    username={username}
                                    round={round}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </HashRouter>
    );
};

export default App;
