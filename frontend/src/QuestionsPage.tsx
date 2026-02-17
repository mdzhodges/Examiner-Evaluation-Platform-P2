import Questions from "./components/questions";

type QuestionsPageProps = {
    examinerId: string;
    username: string;
    round: number;
};

const QuestionsPage = ({ examinerId, username, round }: QuestionsPageProps) => {
    return (
        <Questions
            examinerId={examinerId}
            username={username}
            round={round}
        />
    );
};

export default QuestionsPage;
