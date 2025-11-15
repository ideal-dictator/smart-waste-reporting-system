import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface EcoQuizGameProps {
  onBack: () => void;
  user: any;
}

const EcoQuizGame: React.FC<EcoQuizGameProps> = ({ onBack, user }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [perfectAnswers, setPerfectAnswers] = useState(0);

  const questions = [
    {
      question: "How long does it take for a plastic bottle to decompose?",
      options: ["1-5 years", "10-50 years", "100-450 years", "1000+ years"],
      correct: 2,
      explanation: "Plastic bottles take 100-450 years to decompose, which is why recycling is so important!",
      hint: "Think about how long plastic has been around vs how much we see in nature",
      difficulty: 2
    },
    {
      question: "Which of these items should NOT go in regular recycling?",
      options: ["Glass bottles", "Pizza boxes with grease", "Aluminum cans", "Newspapers"],
      correct: 1,
      explanation: "Greasy pizza boxes contaminate other recyclables and should go in compost or trash.",
      hint: "Contamination is a big problem in recycling - what would make other items dirty?",
      difficulty: 2
    },
    {
      question: "What percentage of the world's plastic waste is actually recycled?",
      options: ["50%", "30%", "15%", "Less than 10%"],
      correct: 3,
      explanation: "Less than 10% of plastic waste is recycled globally, highlighting the need for better waste management.",
      hint: "The reality is much worse than most people think",
      difficulty: 3
    },
    {
      question: "Which waste management method is most environmentally friendly?",
      options: ["Landfilling", "Incineration", "Reduce and Reuse", "Ocean dumping"],
      correct: 2,
      explanation: "Reducing consumption and reusing items prevents waste from being created in the first place.",
      hint: "Prevention is better than cure - what stops waste from existing?",
      difficulty: 1
    },
    {
      question: "How much food waste is generated globally each year?",
      options: ["500 million tons", "1.3 billion tons", "2.1 billion tons", "3.5 billion tons"],
      correct: 1,
      explanation: "About 1.3 billion tons of food is wasted annually, contributing significantly to greenhouse gases.",
      hint: "It's more than the weight of all cars produced in a year",
      difficulty: 3
    },
    {
      question: "Which material can be recycled indefinitely without losing quality?",
      options: ["Paper", "Plastic", "Glass", "Cardboard"],
      correct: 2,
      explanation: "Glass can be recycled endlessly without losing quality, making it one of the most sustainable materials.",
      hint: "This material is made from sand and can return to its original form",
      difficulty: 2
    },
    {
      question: "What is the main component of electronic waste?",
      options: ["Plastic", "Metal", "Glass", "Rare earth elements"],
      correct: 1,
      explanation: "E-waste contains valuable metals like gold, silver, and copper that can be recovered and reused.",
      hint: "What makes electronics conductive and valuable to recycle?",
      difficulty: 2
    },
    {
      question: "How long does it take for an aluminum can to decompose?",
      options: ["50-80 years", "200-500 years", "80-100 years", "1000+ years"],
      correct: 0,
      explanation: "Aluminum cans take 50-80 years to decompose, but they can be recycled infinitely!",
      hint: "Aluminum is a metal that degrades faster than plastic but slower than organic matter",
      difficulty: 2
    }
  ];

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !showResult && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [gameStarted, timeLeft, showResult, gameEnded]);

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(20); // Increased time per question
    setHintsUsed(0);
    setShowHint(false);
    setPerfectAnswers(0);
  };

  const handleTimeUp = () => {
    setAnswers([...answers, false]);
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const useHint = () => {
    if (hintsUsed >= 2 || showHint) return;
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
  };
  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    const question = questions[currentQuestion];
    
    if (isCorrect) {
      let points = 25; // Base points
      
      // Time bonus
      if (timeLeft > 15) points += 10; // Perfect timing
      else if (timeLeft > 10) points += 5; // Good timing
      
      // Difficulty bonus
      points += question.difficulty * 5;
      
      // No hint bonus
      if (!showHint) {
        points += 5;
        setPerfectAnswers(prev => prev + 1);
      }
      
      setScore(score + points);
    }
    
    setAnswers([...answers, isCorrect]);
    setShowResult(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(20);
      setShowHint(false);
    } else {
      setGameEnded(true);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(20);
    setAnswers([]);
    setHintsUsed(0);
    setShowHint(false);
    setPerfectAnswers(0);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Eco Knowledge Quiz</h1>
            <p className="text-gray-600 mb-8">
              Test your environmental knowledge with hints, time bonuses, and difficulty levels!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">20s</div>
                <p className="text-sm text-gray-600">Per Question</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <p className="text-sm text-gray-600">Hints Available</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">🎯 Scoring System:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Base points: 25 per correct answer</li>
                <li>• Time bonus: +10 for quick answers</li>
                <li>• Difficulty bonus: +5 to +15 points</li>
                <li>• No hint bonus: +5 points</li>
              </ul>
            </div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    const percentage = Math.round((score / (questions.length * 25)) * 100);
    const correctAnswers = answers.filter(Boolean).length;
    const earnedPoints = Math.floor(score / 5); // Convert quiz score to reward points
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h1>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">{score}</p>
                <p className="text-sm text-gray-600">Points</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600">{correctAnswers}/{questions.length}</p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">{perfectAnswers}</p>
                <p className="text-sm text-gray-600">Perfect Answers</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-600">{earnedPoints}</p>
                <p className="text-sm text-gray-600">Reward Points</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                <p className="font-medium">🎉 Well done, {user.name}!</p>
                <p className="text-sm">You earned {earnedPoints} reward points! {hintsUsed === 0 && 'Perfect - no hints used!'}</p>
              </div>
              
              {percentage >= 80 && (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
                  🌟 Excellent! You're an eco-expert!
                </div>
              )}
              {percentage >= 60 && percentage < 80 && (
                <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4">
                  👍 Good job! Keep learning about the environment!
                </div>
              )}
              {percentage < 60 && (
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
                  📚 Keep studying! Every bit of knowledge helps our planet!
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600">Question: </span>
              <span className="font-bold text-blue-600">{currentQuestion + 1}/{questions.length}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600">Score: </span>
              <span className="font-bold text-green-600">{score}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600">Hints: </span>
              <span className="font-bold text-purple-600">{2 - hintsUsed}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <Clock className="h-4 w-4 inline mr-1 text-red-500" />
              <span className="font-bold text-red-600">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Hint Button */}
        <div className="text-center mb-4">
          <button
            onClick={useHint}
            disabled={hintsUsed >= 2 || showHint || showResult}
            className="bg-purple-100 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-purple-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            💡 Use Hint ({2 - hintsUsed} left)
          </button>
        </div>
        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                question.difficulty === 1 ? 'bg-green-100 text-green-800' :
                question.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty === 1 ? 'Easy' : question.difficulty === 2 ? 'Medium' : 'Hard'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              +{25 + (question.difficulty * 5)} base points
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {question.question}
          </h2>
          
          {showHint && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-purple-800 font-medium">💡 Hint: {question.hint}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-lg border-2 text-left font-medium transition-all duration-300 hover:scale-105 ${
                  showResult
                    ? index === question.correct
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : selectedAnswer === index
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    : selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && index === question.correct && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && selectedAnswer === index && index !== question.correct && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {showResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">💡 {question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcoQuizGame;