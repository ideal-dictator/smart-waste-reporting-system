import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, Star, RotateCcw } from 'lucide-react';

interface WasteMatchGameProps {
  onBack: () => void;
  user: any;
}

const WasteMatchGame: React.FC<WasteMatchGameProps> = ({ onBack, user }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [itemsMatched, setItemsMatched] = useState(0);
  const [powerUps, setPowerUps] = useState({
    timeFreeze: 1,
    doublePoints: 1,
    skipItem: 1
  });
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState(1);

  const wasteItems = [
    { name: 'Plastic Bottle', category: 'Plastic', image: '🍼', points: 10, difficulty: 1 },
    { name: 'Apple Core', category: 'Organic', image: '🍎', points: 10, difficulty: 1 },
    { name: 'Old Phone', category: 'E-Waste', image: '📱', points: 15, difficulty: 2 },
    { name: 'Syringe', category: 'Medical', image: '💉', points: 20, difficulty: 3 },
    { name: 'Glass Jar', category: 'Glass', image: '🫙', points: 10, difficulty: 1 },
    { name: 'Aluminum Can', category: 'Metal', image: '🥤', points: 10, difficulty: 1 },
    { name: 'Banana Peel', category: 'Organic', image: '🍌', points: 10, difficulty: 1 },
    { name: 'Laptop', category: 'E-Waste', image: '💻', points: 15, difficulty: 2 },
    { name: 'Medicine Bottle', category: 'Medical', image: '💊', points: 20, difficulty: 3 },
    { name: 'Plastic Bag', category: 'Plastic', image: '🛍️', points: 10, difficulty: 1 },
    { name: 'Broken Glass', category: 'Glass', image: '🔍', points: 12, difficulty: 2 },
    { name: 'Battery', category: 'E-Waste', image: '🔋', points: 18, difficulty: 3 },
    { name: 'Food Scraps', category: 'Organic', image: '🥬', points: 8, difficulty: 1 },
    { name: 'Plastic Wrap', category: 'Plastic', image: '📦', points: 12, difficulty: 2 },
    { name: 'Steel Can', category: 'Metal', image: '🥫', points: 11, difficulty: 1 }
  ];

  const categories = [
    { name: 'Organic', color: 'bg-green-500 hover:bg-green-600', emoji: '🌱', description: 'Biodegradable waste' },
    { name: 'Plastic', color: 'bg-blue-500 hover:bg-blue-600', emoji: '♻️', description: 'Recyclable plastics' },
    { name: 'E-Waste', color: 'bg-purple-500 hover:bg-purple-600', emoji: '⚡', description: 'Electronic devices' },
    { name: 'Medical', color: 'bg-red-500 hover:bg-red-600', emoji: '🏥', description: 'Medical waste' },
    { name: 'Glass', color: 'bg-yellow-500 hover:bg-yellow-600', emoji: '🔆', description: 'Glass materials' },
    { name: 'Metal', color: 'bg-gray-500 hover:bg-gray-600', emoji: '🔩', description: 'Metal objects' }
  ];

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => {
        if (activePowerUp !== 'timeFreeze') {
          setTimeLeft(timeLeft - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameEnded(true);
    }
  }, [gameStarted, timeLeft, gameEnded, activePowerUp]);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      generateNewItem();
    }
  }, [gameStarted]);

  useEffect(() => {
    // Level up every 10 items
    if (itemsMatched > 0 && itemsMatched % 10 === 0) {
      setLevel(prev => prev + 1);
      setTimeLeft(prev => prev + 10); // Bonus time for leveling up
      setFeedback(`🎉 Level ${level + 1}! +10 seconds bonus!`);
    }
  }, [itemsMatched]);
  const generateNewItem = () => {
    // Filter items by current level difficulty
    const availableItems = wasteItems.filter(item => item.difficulty <= level);
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    setCurrentItem(randomItem);
    setFeedback(null);
  };

  const usePowerUp = (powerUpType: string) => {
    if (powerUps[powerUpType as keyof typeof powerUps] <= 0) return;
    
    setPowerUps(prev => ({
      ...prev,
      [powerUpType]: prev[powerUpType as keyof typeof prev] - 1
    }));
    
    switch (powerUpType) {
      case 'timeFreeze':
        setActivePowerUp('timeFreeze');
        setTimeout(() => setActivePowerUp(null), 5000);
        setFeedback('⏰ Time Frozen for 5 seconds!');
        break;
      case 'doublePoints':
        setMultiplier(2);
        setTimeout(() => setMultiplier(1), 10000);
        setFeedback('✨ Double Points for 10 seconds!');
        break;
      case 'skipItem':
        generateNewItem();
        setFeedback('⏭️ Item Skipped!');
        break;
    }
  };
  const handleCategorySelect = (categoryName: string) => {
    if (!currentItem || gameEnded) return;

    const isCorrect = currentItem.category === categoryName;
    const basePoints = isCorrect ? currentItem.points + (streak * 2) : 0;
    const finalPoints = Math.floor(basePoints * multiplier);
    
    if (isCorrect) {
      setScore(score + finalPoints);
      setStreak(streak + 1);
      setItemsMatched(prev => prev + 1);
      setFeedback(`Correct! +${finalPoints} points ${multiplier > 1 ? '(2x Bonus!)' : ''}`);
    } else {
      setStreak(0);
      setFeedback(`Wrong! It should be ${currentItem.category}`);
    }

    setTimeout(() => {
      generateNewItem();
    }, 1500);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(90); // Increased time for more engaging gameplay
    setStreak(0);
    setGameEnded(false);
    setLevel(1);
    setItemsMatched(0);
    setMultiplier(1);
    setActivePowerUp(null);
    setPowerUps({ timeFreeze: 1, doublePoints: 1, skipItem: 1 });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(90);
    setStreak(0);
    setLevel(1);
    setItemsMatched(0);
    setCurrentItem(null);
    setFeedback(null);
    setMultiplier(1);
    setActivePowerUp(null);
    setPowerUps({ timeFreeze: 1, doublePoints: 1, skipItem: 1 });
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Waste Match Challenge</h1>
            <p className="text-gray-600 mb-8">
              Match waste items to their correct disposal categories! Level up to unlock harder items and earn more points!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold">90 Seconds</p>
                <p className="text-sm text-gray-600">Time Limit</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="font-semibold">Streak Bonus</p>
                <p className="text-sm text-gray-600">+2 pts per streak</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Trophy className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="font-semibold">Power-ups</p>
                <p className="text-sm text-gray-600">Special abilities</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">🎮 New Features:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Level up every 10 correct matches</li>
                <li>• Power-ups: Time Freeze, Double Points, Skip Item</li>
                <li>• Increasing difficulty with rare waste types</li>
                <li>• Bonus time rewards for leveling up</li>
              </ul>
            </div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    const finalScore = score;
    const accuracy = itemsMatched > 0 ? Math.round((streak / itemsMatched) * 100) : 0;
    const earnedPoints = Math.floor(finalScore / 10); // Convert game score to reward points
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Game Over!</h1>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">{finalScore}</p>
                <p className="text-sm text-gray-600">Final Score</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600">{itemsMatched}</p>
                <p className="text-sm text-gray-600">Items Matched</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">{level}</p>
                <p className="text-sm text-gray-600">Level Reached</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-600">{earnedPoints}</p>
                <p className="text-sm text-gray-600">Reward Points</p>
              </div>
            </div>

            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
              <p className="font-medium">🎉 Great job, {user.name}!</p>
              <p className="text-sm">You earned {earnedPoints} reward points for your performance!</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Play Again</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="text-sm text-gray-600">Level: </span>
              <span className="font-bold text-purple-600">{level}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600">Score: </span>
              <span className="font-bold text-green-600">{score}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600">Streak: </span>
              <span className="font-bold text-blue-600">{streak}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <Clock className="h-4 w-4 inline mr-1 text-red-500" />
              <span className={`font-bold ${activePowerUp === 'timeFreeze' ? 'text-blue-600' : 'text-red-600'}`}>
                {timeLeft}s {activePowerUp === 'timeFreeze' && '❄️'}
              </span>
            </div>
          </div>
        </div>

        {/* Power-ups */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Power-ups</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => usePowerUp('timeFreeze')}
              disabled={powerUps.timeFreeze <= 0}
              className="flex-1 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-blue-800 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              ❄️ Freeze Time ({powerUps.timeFreeze})
            </button>
            <button
              onClick={() => usePowerUp('doublePoints')}
              disabled={powerUps.doublePoints <= 0}
              className="flex-1 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed text-yellow-800 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              ✨ 2x Points ({powerUps.doublePoints})
            </button>
            <button
              onClick={() => usePowerUp('skipItem')}
              disabled={powerUps.skipItem <= 0}
              className="flex-1 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-purple-800 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              ⏭️ Skip Item ({powerUps.skipItem})
            </button>
          </div>
        </div>
        {/* Current Item */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sort this item: 
            {multiplier > 1 && <span className="text-yellow-600 ml-2">✨ 2x POINTS!</span>}
          </h2>
          {currentItem && (
            <div className="mb-6">
              <div className="text-8xl mb-4 animate-bounce-slow">{currentItem.image}</div>
              <h3 className="text-2xl font-bold text-gray-900">{currentItem.name}</h3>
              <p className="text-sm text-gray-600 mt-2">
                Difficulty: {currentItem.difficulty === 1 ? 'Easy' : currentItem.difficulty === 2 ? 'Medium' : 'Hard'}
              </p>
            </div>
          )}
          
          {feedback && (
            <div className={`p-3 rounded-lg mb-4 animate-slide-down ${
              feedback.includes('Level') ? 'bg-purple-100 text-purple-800' :
              feedback.includes('Power') ? 'bg-blue-100 text-blue-800' :
              feedback.includes('Correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {feedback}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategorySelect(category.name)}
              className={`${category.color} text-white p-6 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{category.emoji}</div>
              <div className="font-bold">{category.name}</div>
              <div className="text-xs opacity-80 mt-1">{category.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WasteMatchGame;