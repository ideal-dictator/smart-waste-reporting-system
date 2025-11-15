import React from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Target, 
  Zap,
  Star,
  Play,
  Users,
  Award
} from 'lucide-react';

interface GamesHubProps {
  onGameSelect: (gameId: string) => void;
  user: any;
}

const GamesHub: React.FC<GamesHubProps> = ({ onGameSelect, user }) => {
  const games = [
    {
      id: 'waste-sort-master',
      title: '🧩 Waste Sort Master',
      description: 'Drag & drop waste items into correct bins with timed rounds and streak bonuses',
      icon: Target,
      difficulty: 'Easy → Hard',
      points: '10-50 pts',
      color: 'bg-green-500',
      players: '2.1k played today',
      features: ['Drag & Drop', 'Timed Rounds', 'Daily Leaderboard']
    },
    {
      id: 'daily-eco-quiz',
      title: '🧠 Daily Eco Quiz',
      description: '5-question daily quiz with streak multipliers and facts of the day',
      icon: Trophy,
      difficulty: 'Easy → Expert',
      points: '25-60 pts',
      color: 'bg-blue-500',
      players: '1.8k played today',
      features: ['Daily Questions', 'Streak Bonuses', 'Fact of Day']
    },
    {
      id: 'trash-trivia-battle',
      title: '🚮 Trash Trivia Battle',
      description: 'Live 1v1 quiz competition with real-time battles and ranking boards',
      icon: Users,
      difficulty: 'Medium',
      points: '50-150 pts',
      color: 'bg-purple-500',
      players: '980 playing now',
      features: ['Multiplayer', '1v1 Battles', 'City Rankings']
    },
    {
      id: 'recycle-run',
      title: '🏃 Recycle Run',
      description: 'Endless runner! Collect recyclables, unlock superhero characters',
      icon: Zap,
      difficulty: 'Medium → Expert',
      points: '30-200 pts',
      color: 'bg-orange-500',
      players: '1.5k played today',
      features: ['6 Heroes', 'Power-ups', 'Leaderboards']
    },
    {
      id: 'smart-citizen-challenge',
      title: '🏆 Smart Citizen Challenge',
      description: 'Complete eco-missions, earn badges, climb city rankings',
      icon: Award,
      difficulty: 'All Levels',
      points: 'Real Rewards',
      color: 'bg-teal-500',
      players: '3.2k active',
      features: ['Real Reports', 'Weekly Missions', 'Achievements']
    }
  ];

  const achievements = [
    { name: 'Game Master', description: 'Play all games', progress: 67, reward: '50 pts' },
    { name: 'Quiz Champion', description: 'Score 100% in quiz', progress: 80, reward: '100 pts' },
    { name: 'Speed Matcher', description: 'Complete match game in under 30s', progress: 45, reward: '75 pts' },
    { name: 'Cleanup Expert', description: 'Reach level 5 in cleanup challenge', progress: 30, reward: '120 pts' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full animate-bounce-slow">
              <Gamepad2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Eco Games Hub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enhanced games with power-ups, levels, and bigger rewards! Welcome back, {user.name}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-lg transition-shadow">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{user.rewardPoints}</p>
            <p className="text-sm text-gray-600">Points Earned</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-lg transition-shadow">
            <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">23</p>
            <p className="text-sm text-gray-600">Games Won</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-lg transition-shadow">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">#12</p>
            <p className="text-sm text-gray-600">Leaderboard Rank</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-lg transition-shadow">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">7</p>
            <p className="text-sm text-gray-600">Achievements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Games List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Games</h2>
            <div className="space-y-6">
              {games.map((game, index) => (
                <div key={game.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4">
                        <div className={`${game.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                          <game.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {game.title}
                          </h3>
                          <p className="text-gray-600 mb-4">{game.description}</p>
                          
                          {/* Game Features */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {game.features.map((feature, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                {feature}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              game.difficulty.includes('Easy') ? 'bg-green-100 text-green-800' :
                              game.difficulty.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {game.difficulty}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{game.points}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{game.players}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onGameSelect(game.id)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 group-hover:scale-105"
                      >
                        <Play className="h-4 w-4" />
                        <span>Play Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Achievements</h3>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{achievement.reward}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs text-gray-500">{achievement.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Daily Challenge</h4>
                <p className="text-sm text-gray-600 mb-3">Play 3 games today to earn 50 bonus points!</p>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${i <= 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">1/3 completed</span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">🎮 New Features!</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Enhanced gameplay mechanics</li>
                  <li>• Power-ups and special abilities</li>
                  <li>• Progressive difficulty levels</li>
                  <li>• Bigger reward point earnings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesHub;