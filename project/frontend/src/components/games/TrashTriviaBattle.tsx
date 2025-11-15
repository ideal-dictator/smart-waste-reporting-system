import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Clock, Users, Award, ArrowLeft, Target, Star } from 'lucide-react';

interface TrashTriviaBattleProps {
  onBack: () => void;
  user: any;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  points: number;
}

interface Player {
  name: string;
  score: number;
  avatar: string;
  streak: number;
}

const TrashTriviaBattle: React.FC<TrashTriviaBattleProps> = ({ onBack, user }) => {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [player, setPlayer] = useState<Player>({
    name: user?.name || 'Player 1',
    score: 0,
    avatar: user?.picture || 'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=150',
    streak: 0
  });
  const [opponent, setOpponent] = useState<Player>({
    name: 'EcoWarrior',
    score: 0,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    streak: 0
  });

  const questions: Question[] = [
    {
      id: 1,
      question: "How long does it take for a plastic bottle to decompose?",
      options: ["50 years", "100 years", "450 years", "1000 years"],
      correctAnswer: 2,
      category: "Plastic",
      points: 100
    },
    {
      id: 2,
      question: "Which bin should you throw banana peels in?",
      options: ["Plastic", "Organic", "E-waste", "Metal"],
      correctAnswer: 1,
      category: "Sorting",
      points: 100
    },
    {
      id: 3,
      question: "What percentage of plastic waste is actually recycled globally?",
      options: ["9%", "25%", "50%", "75%"],
      correctAnswer: 0,
      category: "Facts",
      points: 150
    },
    {
      id: 4,
      question: "Which of these items is NOT recyclable?",
      options: ["Glass bottle", "Pizza box with grease", "Aluminum can", "Newspaper"],
      correctAnswer: 1,
      category: "Recycling",
      points: 150
    },
    {
      id: 5,
      question: "How many times can aluminum be recycled?",
      options: ["Once", "5 times", "10 times", "Infinite times"],
      correctAnswer: 3,
      category: "Metals",
      points: 200
    }
  ];

  useEffect(() => {
    if (gameState === 'playing' && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, showResult, currentQuestion]);

  const handleTimeout = () => {
    // Simulate opponent answer
    const opponentAnswered = Math.random() > 0.3;
    if (opponentAnswered) {
      const opponentAnswer = Math.floor(Math.random() * 4);
      if (opponentAnswer === questions[currentQuestion].correctAnswer) {
        setOpponent(prev => ({
          ...prev,
          score: prev.score + questions[currentQuestion].points,
          streak: prev.streak + 1
        }));
      }
    }

    setShowResult(true);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(15);
      } else {
        setGameState('finished');
      }
    }, 3000);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      const bonusPoints = Math.floor(timeLeft * 10);
      const streakBonus = player.streak * 50;
      const totalPoints = questions[currentQuestion].points + bonusPoints + streakBonus;

      setPlayer(prev => ({
        ...prev,
        score: prev.score + totalPoints,
        streak: prev.streak + 1
      }));
    } else {
      setPlayer(prev => ({ ...prev, streak: 0 }));
    }

    // Simulate opponent answer
    setTimeout(() => {
      const opponentAnswer = Math.random() > 0.4 ? questions[currentQuestion].correctAnswer : Math.floor(Math.random() * 4);
      if (opponentAnswer === questions[currentQuestion].correctAnswer) {
        const opponentBonus = Math.floor((timeLeft - 2) * 10);
        setOpponent(prev => ({
          ...prev,
          score: prev.score + questions[currentQuestion].points + opponentBonus,
          streak: prev.streak + 1
        }));
      } else {
        setOpponent(prev => ({ ...prev, streak: 0 }));
      }
    }, 500);

    setShowResult(true);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(15);
      } else {
        setGameState('finished');
      }
    }, 3000);
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setPlayer(prev => ({ ...prev, score: 0, streak: 0 }));
    setOpponent(prev => ({ ...prev, score: 0, streak: 0 }));
    setTimeLeft(15);
  };

  const renderLobby = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Games</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Trash Trivia Battle</h1>
            <p className="text-gray-600">Challenge opponents in real-time eco quiz battles!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center space-x-4 mb-4">
                <img src={player.avatar} alt="Player" className="w-16 h-16 rounded-full border-4 border-blue-500" />
                <div>
                  <h3 className="font-bold text-gray-800">{player.name}</h3>
                  <p className="text-sm text-gray-600">You</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Star className="h-5 w-5" />
                <span className="font-semibold">Ready to play!</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center space-x-4 mb-4">
                <img src={opponent.avatar} alt="Opponent" className="w-16 h-16 rounded-full border-4 border-purple-500" />
                <div>
                  <h3 className="font-bold text-gray-800">{opponent.name}</h3>
                  <p className="text-sm text-gray-600">Opponent</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <Users className="h-5 w-5" />
                <span className="font-semibold">AI Challenger</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-yellow-50 p-4 rounded-xl text-center">
              <Target className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">5 Questions</p>
              <p className="text-sm text-gray-600">Test your eco knowledge</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">15 Seconds</p>
              <p className="text-sm text-gray-600">Per question</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">Streak Bonus</p>
              <p className="text-sm text-gray-600">+50 pts per streak</p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg"
          >
            Start Battle!
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-t-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <img src={player.avatar} alt="Player" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                <div>
                  <p className="font-bold text-gray-800">{player.name}</p>
                  <p className="text-sm text-blue-600 font-semibold">{player.score} pts</p>
                  {player.streak > 0 && (
                    <p className="text-xs text-orange-600 flex items-center">
                      <Zap className="h-3 w-3 mr-1" /> {player.streak}x streak
                    </p>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">Question {currentQuestion + 1}/{questions.length}</p>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <Clock className={`h-5 w-5 ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-600'}`} />
                  <span className={`font-bold text-xl ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-bold text-gray-800">{opponent.name}</p>
                  <p className="text-sm text-purple-600 font-semibold">{opponent.score} pts</p>
                  {opponent.streak > 0 && (
                    <p className="text-xs text-orange-600 flex items-center justify-end">
                      <Zap className="h-3 w-3 mr-1" /> {opponent.streak}x streak
                    </p>
                  )}
                </div>
                <img src={opponent.avatar} alt="Opponent" className="w-10 h-10 rounded-full border-2 border-purple-500" />
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-b-2xl shadow-2xl p-8">
            <div className="mb-6">
              <span className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                {question.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{question.question}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-xl text-left font-semibold transition-all transform hover:scale-105 ${
                      showCorrect
                        ? 'bg-green-500 text-white shadow-lg'
                        : showWrong
                        ? 'bg-red-500 text-white shadow-lg'
                        : isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    } ${selectedAnswer !== null && !showCorrect && !showWrong ? 'opacity-50' : ''}`}
                  >
                    <span className="flex items-center justify-between">
                      <span>{option}</span>
                      {showCorrect && <span className="text-2xl">✓</span>}
                      {showWrong && <span className="text-2xl">✗</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <p className="text-center text-gray-700">
                  {selectedAnswer === question.correctAnswer
                    ? `🎉 Correct! +${question.points} points ${timeLeft > 10 ? '+ Speed Bonus!' : ''}`
                    : `❌ Wrong! The correct answer is: ${question.options[question.correctAnswer]}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFinished = () => {
    const playerWon = player.score > opponent.score;
    const tie = player.score === opponent.score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
              playerWon ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-400 to-gray-600'
            }`}>
              {playerWon ? <Trophy className="h-12 w-12 text-white" /> : <Award className="h-12 w-12 text-white" />}
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {tie ? "It's a Tie!" : playerWon ? 'Victory!' : 'Defeat!'}
            </h1>
            <p className="text-gray-600 mb-8">
              {playerWon ? 'Congratulations! You won the battle!' : tie ? 'Great game! Both players tied!' : 'Better luck next time!'}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl ${playerWon ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-yellow-400' : 'bg-gray-50'}`}>
                <img src={player.avatar} alt="Player" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-500" />
                <p className="font-bold text-gray-800 mb-1">{player.name}</p>
                <p className="text-3xl font-bold text-blue-600">{player.score}</p>
                <p className="text-sm text-gray-600">points</p>
              </div>

              <div className={`p-6 rounded-xl ${!playerWon && !tie ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-400' : 'bg-gray-50'}`}>
                <img src={opponent.avatar} alt="Opponent" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-purple-500" />
                <p className="font-bold text-gray-800 mb-1">{opponent.name}</p>
                <p className="text-3xl font-bold text-purple-600">{opponent.score}</p>
                <p className="text-sm text-gray-600">points</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Rewards Earned</h3>
              <div className="flex justify-center items-center space-x-6">
                <div>
                  <p className="text-3xl font-bold text-green-600">+{Math.floor(player.score / 10)}</p>
                  <p className="text-sm text-gray-600">Eco Points</p>
                </div>
                {playerWon && (
                  <div>
                    <p className="text-3xl">🏆</p>
                    <p className="text-sm text-gray-600">Victory Badge</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {gameState === 'lobby' && renderLobby()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'finished' && renderFinished()}
    </>
  );
};

export default TrashTriviaBattle;
