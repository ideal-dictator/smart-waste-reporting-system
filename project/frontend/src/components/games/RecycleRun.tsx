import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Heart, Star, Zap, Trophy, Play, Pause, RotateCcw } from 'lucide-react';

interface RecycleRunProps {
  onBack: () => void;
  user: any;
}

interface Character {
  id: string;
  name: string;
  avatar: string;
  color: string;
  unlocked: boolean;
  cost: number;
}

interface WasteItem {
  id: number;
  type: 'correct' | 'wrong';
  emoji: string;
  name: string;
  x: number;
  y: number;
  lane: number;
}

interface PowerUp {
  id: string;
  name: string;
  emoji: string;
  effect: string;
}

const RecycleRun: React.FC<RecycleRunProps> = ({ onBack, user }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [playerLane, setPlayerLane] = useState(1);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [speed, setSpeed] = useState(3);
  const [distance, setDistance] = useState(0);
  const [powerUps, setPowerUps] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(0);

  const characters: Character[] = [
    { id: 'eco-hero', name: 'Eco Hero', avatar: '🦸', color: 'from-green-400 to-emerald-600', unlocked: true, cost: 0 },
    { id: 'recycler', name: 'Recycler', avatar: '♻️', color: 'from-blue-400 to-cyan-600', unlocked: true, cost: 0 },
    { id: 'captain-planet', name: 'Captain Planet', avatar: '🌍', color: 'from-teal-400 to-green-600', unlocked: false, cost: 1000 },
    { id: 'trash-ninja', name: 'Trash Ninja', avatar: '🥷', color: 'from-purple-400 to-pink-600', unlocked: false, cost: 1500 },
    { id: 'iron-recycler', name: 'Iron Recycler', avatar: '🦾', color: 'from-red-400 to-orange-600', unlocked: false, cost: 2000 },
    { id: 'green-lantern', name: 'Green Lantern', avatar: '💚', color: 'from-lime-400 to-green-600', unlocked: false, cost: 2500 }
  ];

  const correctWaste = [
    { emoji: '🗑️', name: 'Recyclable Waste' },
    { emoji: '♻️', name: 'Recycling Symbol' },
    { emoji: '🥫', name: 'Aluminum Can' },
    { emoji: '📄', name: 'Paper' },
    { emoji: '🍌', name: 'Organic Waste' },
    { emoji: '🧃', name: 'Carton' }
  ];

  const wrongWaste = [
    { emoji: '💀', name: 'Toxic Waste' },
    { emoji: '☢️', name: 'Radioactive' },
    { emoji: '🔥', name: 'Hazard' },
    { emoji: '⚠️', name: 'Warning' },
    { emoji: '💩', name: 'Contaminated' }
  ];

  const powerUpsList: PowerUp[] = [
    { id: 'shield', name: 'Shield', emoji: '🛡️', effect: 'Protection from 1 hit' },
    { id: 'magnet', name: 'Magnet', emoji: '🧲', effect: 'Auto-collect items' },
    { id: 'boost', name: 'Speed Boost', emoji: '⚡', effect: '2x score multiplier' }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(() => {
        setDistance(prev => prev + 1);

        if (Math.random() < 0.3) {
          const lane = Math.floor(Math.random() * 3);
          const isCorrect = Math.random() > 0.4;
          const wastePool = isCorrect ? correctWaste : wrongWaste;
          const waste = wastePool[Math.floor(Math.random() * wastePool.length)];

          setWasteItems(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: isCorrect ? 'correct' : 'wrong',
            emoji: waste.emoji,
            name: waste.name,
            x: lane,
            y: 0,
            lane
          }]);
        }

        setWasteItems(prev =>
          prev.map(item => ({ ...item, y: item.y + speed }))
            .filter(item => item.y < 100)
        );

        if (distance % 500 === 0 && distance > 0) {
          setSpeed(prev => prev + 0.5);
        }
      }, 100);

      return () => clearInterval(gameLoop);
    }
  }, [gameState, distance, speed]);

  useEffect(() => {
    wasteItems.forEach(item => {
      if (item.y >= 80 && item.y <= 95 && item.lane === playerLane) {
        if (item.type === 'correct') {
          const points = 10 + (streak * 2);
          setScore(prev => prev + points);
          setStreak(prev => prev + 1);
        } else {
          if (!powerUps.includes('shield')) {
            setHealth(prev => {
              const newHealth = prev - 1;
              if (newHealth <= 0) {
                setGameState('gameover');
                if (score > highScore) setHighScore(score);
              }
              return newHealth;
            });
          } else {
            setPowerUps(prev => prev.filter(p => p !== 'shield'));
          }
          setStreak(0);
        }
        setWasteItems(prev => prev.filter(w => w.id !== item.id));
      }
    });
  }, [wasteItems, playerLane, score, powerUps, streak, highScore]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    if (e.key === 'ArrowLeft' && playerLane > 0) {
      setPlayerLane(prev => prev - 1);
    } else if (e.key === 'ArrowRight' && playerLane < 2) {
      setPlayerLane(prev => prev + 1);
    } else if (e.key === ' ') {
      setGameState('paused');
    }
  }, [gameState, playerLane]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(3);
    setPlayerLane(1);
    setWasteItems([]);
    setSpeed(3);
    setDistance(0);
    setPowerUps([]);
    setStreak(0);
  };

  const moveLeft = () => {
    if (playerLane > 0) setPlayerLane(prev => prev - 1);
  };

  const moveRight = () => {
    if (playerLane < 2) setPlayerLane(prev => prev + 1);
  };

  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-600 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Games</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-2">🏃 Recycle Run</h1>
            <p className="text-gray-600 text-lg">Endless runner game - Collect recyclables, avoid hazards!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl text-center">
              <Trophy className="h-10 w-10 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{highScore}</p>
              <p className="text-sm text-gray-600">High Score</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl text-center">
              <Star className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{characters.filter(c => c.unlocked).length}/{characters.length}</p>
              <p className="text-sm text-gray-600">Characters Unlocked</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl text-center">
              <Zap className="h-10 w-10 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{user?.ecoPoints || 0}</p>
              <p className="text-sm text-gray-600">Eco Points</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Your Hero</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {characters.map((char, index) => (
                <button
                  key={char.id}
                  onClick={() => char.unlocked && setSelectedCharacter(index)}
                  disabled={!char.unlocked}
                  className={`p-6 rounded-xl transition-all transform hover:scale-105 ${
                    selectedCharacter === index
                      ? `bg-gradient-to-br ${char.color} text-white shadow-xl border-4 border-yellow-400`
                      : char.unlocked
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="text-5xl mb-2">{char.avatar}</div>
                  <p className="font-bold">{char.name}</p>
                  {!char.unlocked && (
                    <p className="text-xs mt-1">🔒 {char.cost} points</p>
                  )}
                  {selectedCharacter === index && (
                    <div className="mt-2 text-yellow-300 font-bold">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Power-Ups</h3>
            <div className="grid grid-cols-3 gap-4">
              {powerUpsList.map(powerUp => (
                <div key={powerUp.id} className="text-center">
                  <div className="text-3xl mb-1">{powerUp.emoji}</div>
                  <p className="text-xs font-semibold text-gray-700">{powerUp.name}</p>
                  <p className="text-xs text-gray-600">{powerUp.effect}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-center">How to Play</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="font-semibold text-green-600">Collect ♻️</p>
                <p className="text-gray-600">Recyclables for points</p>
              </div>
              <div>
                <p className="font-semibold text-red-600">Avoid ☢️</p>
                <p className="text-gray-600">Hazards lose health</p>
              </div>
              <div>
                <p className="font-semibold text-blue-600">Build Streaks</p>
                <p className="text-gray-600">For bonus points</p>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-bold text-xl hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <Play className="h-6 w-6" />
            <span>Start Running!</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-t-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-blue-600">{score}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-600 text-center">Health</p>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`h-6 w-6 ${i < health ? 'text-red-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 text-center">Distance</p>
                <p className="text-xl font-bold text-gray-800">{Math.floor(distance / 10)}m</p>
              </div>

              {streak > 0 && (
                <div className="bg-orange-100 px-3 py-2 rounded-lg">
                  <p className="text-xs text-orange-600">Streak</p>
                  <p className="text-xl font-bold text-orange-600 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />{streak}x
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setGameState('paused')}
              className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
            >
              <Pause className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {powerUps.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {powerUps.map(powerUp => {
                const pu = powerUpsList.find(p => p.id === powerUp);
                return (
                  <div key={powerUp} className="bg-purple-100 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                    <span>{pu?.emoji}</span>
                    <span className="text-purple-700 font-semibold">{pu?.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-b from-green-100 to-green-300 rounded-b-2xl shadow-2xl overflow-hidden relative" style={{ height: '600px' }}>
          {/* Road lanes */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2].map(lane => (
              <div key={lane} className="flex-1 border-r-2 border-dashed border-white opacity-50" />
            ))}
          </div>

          {/* Waste items */}
          {wasteItems.map(item => (
            <div
              key={item.id}
              className="absolute text-4xl transition-all duration-100"
              style={{
                left: `${(item.lane * 33.33) + 10}%`,
                top: `${item.y}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {item.emoji}
            </div>
          ))}

          {/* Player character */}
          <div
            className="absolute text-6xl transition-all duration-200"
            style={{
              left: `${(playerLane * 33.33) + 10}%`,
              top: '85%',
              transform: 'translateX(-50%)'
            }}
          >
            {characters[selectedCharacter].avatar}
          </div>

          {/* Mobile controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 md:hidden">
            <button
              onClick={moveLeft}
              className="bg-white bg-opacity-80 p-4 rounded-full shadow-lg active:scale-95"
            >
              <span className="text-2xl">←</span>
            </button>
            <button
              onClick={moveRight}
              className="bg-white bg-opacity-80 p-4 rounded-full shadow-lg active:scale-95"
            >
              <span className="text-2xl">→</span>
            </button>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-xl p-3 text-center text-sm text-gray-600">
          Use ← → arrow keys to move (Desktop) or tap buttons (Mobile)
        </div>
      </div>
    </div>
  );

  const renderPaused = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-600 py-12 px-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Paused</h2>
        <p className="text-gray-600 mb-6">Take a breather!</p>

        <div className="bg-blue-50 p-4 rounded-xl mb-6">
          <p className="text-sm text-gray-600 mb-1">Current Score</p>
          <p className="text-4xl font-bold text-blue-600">{score}</p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => setGameState('playing')}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all"
          >
            Resume Game
          </button>
          <button
            onClick={() => {
              setGameState('menu');
              if (score > highScore) setHighScore(score);
            }}
            className="bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-600 py-12 px-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">💥</div>
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Game Over!</h2>
        <p className="text-gray-600 mb-6">Better luck next time!</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Score</p>
            <p className="text-3xl font-bold text-blue-600">{score}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">High Score</p>
            <p className="text-3xl font-bold text-purple-600">{highScore}</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl mb-6">
          <p className="text-sm text-gray-600 mb-1">Distance Traveled</p>
          <p className="text-2xl font-bold text-green-600">{Math.floor(distance / 10)}m</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl mb-6">
          <p className="font-bold text-gray-800 mb-2">Rewards Earned</p>
          <p className="text-3xl font-bold text-green-600">+{Math.floor(score / 10)} Eco Points</p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Try Again</span>
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'paused' && renderPaused()}
      {gameState === 'gameover' && renderGameOver()}
    </>
  );
};

export default RecycleRun;
