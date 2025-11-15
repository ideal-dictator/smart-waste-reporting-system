import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trophy, Clock, Zap, RotateCcw, Target } from 'lucide-react';

interface CleanupChallengeGameProps {
  onBack: () => void;
  user: any;
}

interface WasteItem {
  id: number;
  x: number;
  y: number;
  type: string;
  emoji: string;
  points: number;
  collected: boolean;
  size: 'small' | 'medium' | 'large';
  speed?: number;
}

const CleanupChallengeGame: React.FC<CleanupChallengeGameProps> = ({ onBack, user }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
  const [collectedItems, setCollectedItems] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(100);
  const [specialItems, setSpecialItems] = useState<WasteItem[]>([]);
  const [powerUps, setPowerUps] = useState({
    speedBoost: 0,
    magnetism: 0,
    energyRestore: 1
  });

  const wasteTypes = [
    { type: 'plastic', emoji: '🍼', points: 10, size: 'medium' },
    { type: 'organic', emoji: '🍎', points: 8, size: 'small' },
    { type: 'paper', emoji: '📄', points: 6, size: 'small' },
    { type: 'metal', emoji: '🥤', points: 12, size: 'medium' },
    { type: 'glass', emoji: '🫙', points: 15, size: 'large' },
    { type: 'ewaste', emoji: '📱', points: 20, size: 'medium' },
    { type: 'hazardous', emoji: '☢️', points: 30, size: 'large' },
    { type: 'bonus', emoji: '💎', points: 50, size: 'small' }
  ];

  const generateWasteItems = useCallback(() => {
    const items: WasteItem[] = [];
    const itemCount = 12 + (level * 3); // More items as level increases
    
    for (let i = 0; i < itemCount; i++) {
      const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
      items.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        type: wasteType.type,
        emoji: wasteType.emoji,
        points: wasteType.points,
        collected: false,
        size: wasteType.size,
        speed: wasteType.type === 'bonus' ? 0.5 : 0 // Bonus items move slowly
      });
    }
    setWasteItems(items);
    
    // Add special moving items at higher levels
    if (level >= 3) {
      const specialCount = Math.floor(level / 2);
      const special: WasteItem[] = [];
      for (let i = 0; i < specialCount; i++) {
        special.push({
          id: 1000 + i,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          type: 'bonus',
          emoji: '⭐',
          points: 25,
          collected: false,
          size: 'small',
          speed: 1
        });
      }
      setSpecialItems(special);
    }
  }, [level]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameEnded(true);
    }
  }, [gameStarted, timeLeft, gameEnded]);

  // Move special items
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const moveInterval = setInterval(() => {
      setSpecialItems(prev => prev.map(item => {
        if (item.collected || !item.speed) return item;
        
        return {
          ...item,
          x: Math.max(5, Math.min(95, item.x + (Math.random() - 0.5) * item.speed * 10)),
          y: Math.max(5, Math.min(95, item.y + (Math.random() - 0.5) * item.speed * 10))
        };
      }));
    }, 200);
    
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameEnded]);
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameEnded) return;
      
      const baseSpeed = 3;
      const speed = powerUps.speedBoost > 0 ? baseSpeed * 1.5 : baseSpeed;
      
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            newY = Math.max(0, prev.y - speed);
            setEnergy(prev => Math.max(0, prev - 1));
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            newY = Math.min(95, prev.y + speed);
            setEnergy(prev => Math.max(0, prev - 1));
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            newX = Math.max(0, prev.x - speed);
            setEnergy(prev => Math.max(0, prev - 1));
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            newX = Math.min(95, prev.x + speed);
            setEnergy(prev => Math.max(0, prev - 1));
            break;
        }
        
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameEnded]);

  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const allItems = [...wasteItems, ...specialItems];
    const magnetRange = powerUps.magnetism > 0 ? 8 : 5;
    
    allItems.forEach(item => {
      if (!item.collected) {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - item.x, 2) + 
          Math.pow(playerPosition.y - item.y, 2)
        );
        
        if (distance < magnetRange) {
          collectItem(item.id);
        }
      }
    });
  }, [playerPosition, wasteItems, specialItems, gameStarted, gameEnded, powerUps.magnetism]);

  useEffect(() => {
    // Level up every 15 items
    if (collectedItems > 0 && collectedItems % 15 === 0) {
      setLevel(prev => prev + 1);
      setTimeLeft(prev => prev + 15); // Bonus time
      setPowerUps(prev => ({
        speedBoost: prev.speedBoost + 1,
        magnetism: prev.magnetism + 1,
        energyRestore: prev.energyRestore + 1
      }));
    }
  }, [collectedItems]);
  const collectItem = (itemId: number) => {
    let collectedItem: WasteItem | undefined;
    
    // Check regular items
    setWasteItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId && !item.collected) {
          collectedItem = item;
          return { ...item, collected: true };
        }
        return item;
      });
      return updated;
    });
    
    // Check special items
    setSpecialItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId && !item.collected) {
          collectedItem = item;
          return { ...item, collected: true };
        }
        return item;
      });
      return updated;
    });
    
    if (collectedItem) {
      const comboBonus = combo * 2;
      const sizeBonus = collectedItem.size === 'large' ? 5 : collectedItem.size === 'medium' ? 2 : 0;
      const totalPoints = collectedItem.points + comboBonus + sizeBonus;
      
      setScore(prev => prev + totalPoints);
      setCollectedItems(prev => prev + 1);
      setCombo(prev => prev + 1);
      setShowCombo(true);
      
      // Restore energy for collecting items
      setEnergy(prev => Math.min(100, prev + 5));
      
      setTimeout(() => setShowCombo(false), 1000);
      
      // Add new waste item
      const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
      const newItem: WasteItem = {
        id: Date.now(),
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        type: wasteType.type,
        emoji: wasteType.emoji,
        points: wasteType.points,
        collected: false,
        size: wasteType.size,
        speed: wasteType.type === 'bonus' ? 0.5 : 0
      };
      
      setWasteItems(prev => [...prev, newItem]);
    }
  };

  const usePowerUp = (type: string) => {
    if (powerUps[type as keyof typeof powerUps] <= 0) return;
    
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type as keyof typeof prev] - 1
    }));
    
    switch (type) {
      case 'speedBoost':
        setTimeout(() => {}, 10000); // Effect handled in movement logic
        break;
      case 'magnetism':
        setTimeout(() => {}, 8000); // Effect handled in collection logic
        break;
      case 'energyRestore':
        setEnergy(100);
        break;
    }
  };
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(120);
    setCollectedItems(0);
    setCombo(0);
    setPlayerPosition({ x: 50, y: 50 });
    setLevel(1);
    setEnergy(100);
    setSpecialItems([]);
    setPowerUps({ speedBoost: 0, magnetism: 0, energyRestore: 1 });
    generateWasteItems();
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(120);
    setCollectedItems(0);
    setCombo(0);
    setWasteItems([]);
    setSpecialItems([]);
    setPlayerPosition({ x: 50, y: 50 });
    setLevel(1);
    setEnergy(100);
    setPowerUps({ speedBoost: 0, magnetism: 0, energyRestore: 1 });
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🧹</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Virtual Cleanup Challenge</h1>
            <p className="text-gray-600 mb-8">
              Navigate the virtual environment, collect waste, level up, and use power-ups strategically!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="font-semibold">2 Minutes</p>
                <p className="text-sm text-gray-600">Time Limit</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="font-semibold">Energy System</p>
                <p className="text-sm text-gray-600">Manage stamina</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold">Power-ups</p>
                <p className="text-sm text-gray-600">Special abilities</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">🎮 Enhanced Features:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Energy system - movement costs energy</li>
                <li>• Level progression with more items</li>
                <li>• Moving bonus items for extra points</li>
                <li>• Power-ups: Speed Boost, Magnetism, Energy Restore</li>
                <li>• Different waste sizes affect collection difficulty</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    const efficiency = Math.round((collectedItems / 90) * 100);
    const earnedPoints = Math.floor(score / 8); // Convert game score to reward points
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Challenge Complete!</h1>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">{score}</p>
                <p className="text-sm text-gray-600">Points</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">{collectedItems}</p>
                <p className="text-sm text-gray-600">Items Collected</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-600">{level}</p>
                <p className="text-sm text-gray-600">Level Reached</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600">{earnedPoints}</p>
                <p className="text-sm text-gray-600">Reward Points</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                <p className="font-medium">🎉 Fantastic cleanup, {user.name}!</p>
                <p className="text-sm">You earned {earnedPoints} reward points and reached level {level}!</p>
              </div>
              
              {efficiency >= 80 && (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
                  🌟 Outstanding! You're a cleanup champion!
                </div>
              )}
              {efficiency >= 60 && efficiency < 80 && (
                <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4">
                  👍 Great work! Keep up the environmental effort!
                </div>
              )}
              {efficiency < 60 && (
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
                  💪 Good start! Practice makes perfect!
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-2"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="font-bold text-purple-600">{score}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-600">Collected: </span>
              <span className="font-bold text-green-600">{collectedItems}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <Clock className="h-4 w-4 inline mr-1 text-red-500" />
              <span className="font-bold text-red-600">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Energy Bar and Power-ups */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Energy: {energy}%</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => usePowerUp('speedBoost')}
                disabled={powerUps.speedBoost <= 0}
                className="bg-blue-100 hover:bg-blue-200 disabled:opacity-50 text-blue-800 px-3 py-1 rounded text-sm font-medium"
              >
                🚀 Speed ({powerUps.speedBoost})
              </button>
              <button
                onClick={() => usePowerUp('magnetism')}
                disabled={powerUps.magnetism <= 0}
                className="bg-purple-100 hover:bg-purple-200 disabled:opacity-50 text-purple-800 px-3 py-1 rounded text-sm font-medium"
              >
                🧲 Magnet ({powerUps.magnetism})
              </button>
              <button
                onClick={() => usePowerUp('energyRestore')}
                disabled={powerUps.energyRestore <= 0 || energy >= 80}
                className="bg-green-100 hover:bg-green-200 disabled:opacity-50 text-green-800 px-3 py-1 rounded text-sm font-medium"
              >
                ⚡ Energy ({powerUps.energyRestore})
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                energy > 60 ? 'bg-green-500' : energy > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${energy}%` }}
            ></div>
          </div>
        </div>
        {/* Game Area */}
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl shadow-lg relative overflow-hidden" style={{ height: '500px' }}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="border border-green-200"></div>
              ))}
            </div>
          </div>
          
          {/* Player */}
          <div
            className={`absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-100 z-10 shadow-lg ${
              powerUps.speedBoost > 0 ? 'animate-pulse' : ''
            } ${energy < 20 ? 'opacity-60' : ''}`}
            style={{
              left: `${playerPosition.x}%`,
              top: `${playerPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            🧹
          </div>
          
          {/* Magnetism Effect */}
          {powerUps.magnetism > 0 && (
            <div
              className="absolute border-2 border-purple-400 border-dashed rounded-full opacity-50 pointer-events-none"
              style={{
                left: `${playerPosition.x}%`,
                top: `${playerPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '16%',
                height: '16%'
              }}
            />
          )}
          
          {/* Waste Items */}
          {wasteItems.map(item => (
            !item.collected && (
              <div
                key={item.id}
                className={`absolute flex items-center justify-center text-lg transition-all duration-200 hover:scale-110 ${
                  item.size === 'large' ? 'w-8 h-8 text-xl' : 
                  item.size === 'medium' ? 'w-6 h-6 text-lg' : 
                  'w-4 h-4 text-sm'
                }`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {item.emoji}
              </div>
            )
          ))}
          
          {/* Special Moving Items */}
          {specialItems.map(item => (
            !item.collected && (
              <div
                key={item.id}
                className="absolute w-6 h-6 flex items-center justify-center text-lg transition-all duration-200 animate-pulse"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {item.emoji}
              </div>
            )
          ))}
          
          {/* Combo Display */}
          {showCombo && combo > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-lg animate-bounce z-20">
              {combo}x COMBO!
            </div>
          )}
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-800">Use arrow keys or WASD to move</p>
            <p className="text-xs text-gray-600">Collect waste • Watch your energy • Use power-ups!</p>
          </div>
          
          {/* Level Progress */}
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-800">Level {level}</p>
            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((collectedItems % 15) / 15) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600">{collectedItems % 15}/15 to next level</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanupChallengeGame;