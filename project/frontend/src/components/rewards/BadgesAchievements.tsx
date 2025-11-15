import React from 'react';
import { 
  Award, 
  Star, 
  Trophy,
  Target,
  Zap,
  Crown,
  Shield,
  Flame
} from 'lucide-react';

interface BadgesAchievementsProps {
  user: any;
}

const BadgesAchievements: React.FC<BadgesAchievementsProps> = ({ user }) => {
  const badges = [
    {
      id: 'first_report',
      name: 'First Reporter',
      description: 'Submitted your first waste report',
      icon: Star,
      color: 'bg-blue-500',
      earned: true,
      earnedDate: '2024-01-10'
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      description: 'Submitted 10 waste reports',
      icon: Shield,
      color: 'bg-green-500',
      earned: true,
      earnedDate: '2024-01-15'
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintained a 30-day login streak',
      icon: Flame,
      color: 'bg-orange-500',
      earned: false,
      progress: 67
    },
    {
      id: 'clean_city_hero',
      name: 'Clean City Hero',
      description: 'Submitted 50 waste reports',
      icon: Crown,
      color: 'bg-purple-500',
      earned: false,
      progress: 40
    }
  ];

  const achievements = [
    {
      id: 'first_reporter',
      name: 'Getting Started',
      description: 'Submit your first waste report',
      points: 10,
      icon: Target,
      completed: true,
      completedDate: '2024-01-10'
    },
    {
      id: 'community_helper',
      name: 'Community Helper',
      description: 'Help resolve 5 waste issues',
      points: 50,
      icon: Award,
      completed: true,
      completedDate: '2024-01-12'
    },
    {
      id: 'environmental_champion',
      name: 'Environmental Champion',
      description: 'Earn 1000 reward points',
      points: 100,
      icon: Trophy,
      completed: false,
      progress: 78
    },
    {
      id: 'speed_reporter',
      name: 'Speed Reporter',
      description: 'Submit 3 reports in one day',
      points: 75,
      icon: Zap,
      completed: false,
      progress: 33
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Badges & Achievements</h1>
        <p className="text-gray-600">
          Track your progress and unlock rewards for environmental contributions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Badges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map(badge => (
              <div key={badge.id} className={`p-4 rounded-lg border-2 ${
                badge.earned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className={`${badge.color} p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center ${
                    badge.earned ? '' : 'opacity-50'
                  }`}>
                    <badge.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  
                  {badge.earned ? (
                    <div className="text-green-600 text-sm font-medium">
                      ✓ Earned on {badge.earnedDate}
                    </div>
                  ) : (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${badge.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{badge.progress}% complete</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Achievements</h2>
          <div className="space-y-4">
            {achievements.map(achievement => (
              <div key={achievement.id} className={`p-4 rounded-lg border ${
                achievement.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    achievement.completed ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <achievement.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        +{achievement.points} pts
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    
                    {achievement.completed ? (
                      <div className="text-green-600 text-sm font-medium">
                        ✓ Completed on {achievement.completedDate}
                      </div>
                    ) : (
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{achievement.progress}% complete</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold">{badges.filter(b => b.earned).length}/{badges.length}</p>
              <p className="text-green-100">Badges Earned</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{achievements.filter(a => a.completed).length}/{achievements.length}</p>
              <p className="text-green-100">Achievements</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{user.rewardPoints}</p>
              <p className="text-green-100">Total Points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesAchievements;