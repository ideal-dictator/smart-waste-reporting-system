import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Camera, Award, Trophy, Target, Star, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface SmartCitizenChallengeProps {
  onBack: () => void;
  user: any;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'report' | 'collect' | 'educate' | 'clean';
  points: number;
  progress: number;
  goal: number;
  completed: boolean;
  icon: string;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  earned: boolean;
  date?: string;
}

const SmartCitizenChallenge: React.FC<SmartCitizenChallengeProps> = ({ onBack, user }) => {
  const [view, setView] = useState<'overview' | 'missions' | 'leaderboard' | 'achievements'>('overview');
  const [weeklyPoints, setWeeklyPoints] = useState(450);
  const [totalReports, setTotalReports] = useState(12);
  const [rank, setRank] = useState(3);

  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'daily-report',
      title: 'Daily Reporter',
      description: 'Submit 3 waste reports today',
      type: 'report',
      points: 50,
      progress: 1,
      goal: 3,
      completed: false,
      icon: '📸',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'weekly-warrior',
      title: 'Weekly Eco Warrior',
      description: 'Report 15 overflowing bins this week',
      type: 'report',
      points: 200,
      progress: 8,
      goal: 15,
      completed: false,
      icon: '🗑️',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'categorizer',
      title: 'Master Categorizer',
      description: 'Correctly identify 10 waste types',
      type: 'educate',
      points: 100,
      progress: 10,
      goal: 10,
      completed: true,
      icon: '🎯',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'cleanup-crew',
      title: 'Cleanup Crew',
      description: 'Participate in community cleanup events',
      type: 'clean',
      points: 300,
      progress: 0,
      goal: 1,
      completed: false,
      icon: '🧹',
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Report waste for 7 consecutive days',
      type: 'report',
      points: 500,
      progress: 4,
      goal: 7,
      completed: false,
      icon: '🔥',
      color: 'from-red-400 to-red-600'
    },
    {
      id: 'educator',
      title: 'Eco Educator',
      description: 'Share 5 recycling tips with friends',
      type: 'educate',
      points: 150,
      progress: 2,
      goal: 5,
      completed: false,
      icon: '📚',
      color: 'from-teal-400 to-teal-600'
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-report',
      title: 'First Steps',
      description: 'Submit your first waste report',
      badge: '🌱',
      earned: true,
      date: '2025-09-28'
    },
    {
      id: 'ten-reports',
      title: 'Getting Started',
      description: 'Submit 10 waste reports',
      badge: '⭐',
      earned: true,
      date: '2025-10-02'
    },
    {
      id: 'eco-warrior',
      title: 'Eco Warrior',
      description: 'Submit 50 waste reports',
      badge: '🦸',
      earned: false
    },
    {
      id: 'perfect-week',
      title: 'Perfect Week',
      description: 'Complete all daily missions for 7 days',
      badge: '💎',
      earned: false
    },
    {
      id: 'community-hero',
      title: 'Community Hero',
      description: 'Help clean 100kg of waste',
      badge: '🏆',
      earned: false
    },
    {
      id: 'recycling-master',
      title: 'Recycling Master',
      description: 'Achieve 95% accuracy in waste sorting',
      badge: '♻️',
      earned: true,
      date: '2025-10-05'
    }
  ]);

  const leaderboardData = [
    { rank: 1, name: 'Sarah Green', points: 1250, avatar: '🦸‍♀️', reports: 45, city: 'Mumbai' },
    { rank: 2, name: 'Raj Kumar', points: 980, avatar: '🧑‍🚀', reports: 38, city: 'Delhi' },
    { rank: 3, name: user?.name || 'You', points: weeklyPoints, avatar: user?.avatar || '👤', reports: totalReports, city: 'Bangalore', isUser: true },
    { rank: 4, name: 'Priya Singh', points: 420, avatar: '🦹‍♀️', reports: 19, city: 'Chennai' },
    { rank: 5, name: 'Ahmed Ali', points: 380, avatar: '🧙‍♂️', reports: 17, city: 'Hyderabad' }
  ];

  const completeMission = (missionId: string) => {
    setMissions(prev =>
      prev.map(mission =>
        mission.id === missionId
          ? { ...mission, progress: mission.progress + 1, completed: mission.progress + 1 >= mission.goal }
          : mission
      )
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Smart Citizen Challenge</h2>
            <p className="text-green-100">Turn real-world actions into rewards!</p>
          </div>
          <div className="text-6xl">{user?.avatar || '🦸'}</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <Trophy className="h-8 w-8 mb-2 text-yellow-300" />
            <p className="text-3xl font-bold">{weeklyPoints}</p>
            <p className="text-sm text-green-100">Weekly Points</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <MapPin className="h-8 w-8 mb-2 text-blue-300" />
            <p className="text-3xl font-bold">{totalReports}</p>
            <p className="text-sm text-green-100">Total Reports</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <Star className="h-8 w-8 mb-2 text-purple-300" />
            <p className="text-3xl font-bold">#{rank}</p>
            <p className="text-sm text-green-100">City Rank</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => setView('missions')}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="h-10 w-10 text-blue-600" />
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Active Missions</h3>
          <p className="text-gray-600 mb-4">Complete challenges to earn points</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{missions.filter(m => !m.completed).length} active</span>
            <span className="text-blue-600 font-semibold">View All →</span>
          </div>
        </button>

        <button
          onClick={() => setView('leaderboard')}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-10 w-10 text-purple-600" />
            <span className="text-3xl">🏆</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Leaderboard</h3>
          <p className="text-gray-600 mb-4">See top eco-citizens in your city</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">You're rank #{rank}</span>
            <span className="text-purple-600 font-semibold">View All →</span>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Recent Achievements</h3>
          <button onClick={() => setView('achievements')} className="text-blue-600 font-semibold hover:text-blue-700">
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.filter(a => a.earned).slice(0, 4).map(achievement => (
            <div key={achievement.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl text-center">
              <div className="text-4xl mb-2">{achievement.badge}</div>
              <p className="text-sm font-bold text-gray-800">{achievement.title}</p>
              <p className="text-xs text-gray-600 mt-1">{achievement.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-white p-4 rounded-xl hover:shadow-md transition-all text-left">
            <Camera className="h-8 w-8 text-green-600 mb-2" />
            <p className="font-bold text-gray-800">Report Waste</p>
            <p className="text-sm text-gray-600">+10 points per report</p>
          </button>
          <button className="bg-white p-4 rounded-xl hover:shadow-md transition-all text-left">
            <MapPin className="h-8 w-8 text-blue-600 mb-2" />
            <p className="font-bold text-gray-800">Check Status</p>
            <p className="text-sm text-gray-600">Track your reports</p>
          </button>
          <button className="bg-white p-4 rounded-xl hover:shadow-md transition-all text-left">
            <Award className="h-8 w-8 text-purple-600 mb-2" />
            <p className="font-bold text-gray-800">Earn Badges</p>
            <p className="text-sm text-gray-600">Complete missions</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMissions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Active Missions</h2>
        <button
          onClick={() => setView('overview')}
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back
        </button>
      </div>

      <div className="grid gap-4">
        {missions.map(mission => (
          <div key={mission.id} className={`bg-white rounded-2xl shadow-lg p-6 ${mission.completed ? 'opacity-75' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className={`text-5xl`}>{mission.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{mission.title}</h3>
                  <p className="text-gray-600 mb-3">{mission.description}</p>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Progress: {mission.progress}/{mission.goal}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {mission.points} points
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`bg-gradient-to-r ${mission.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${(mission.progress / mission.goal) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {mission.completed ? (
                      <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed!</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => completeMission(mission.id)}
                        className={`bg-gradient-to-r ${mission.color} text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all`}
                      >
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">City Leaderboard</h2>
        <button
          onClick={() => setView('overview')}
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-1">This Week's Competition</p>
            <h3 className="text-2xl font-bold">Top Eco-Citizens</h3>
          </div>
          <Clock className="h-10 w-10 text-purple-200" />
        </div>
      </div>

      <div className="space-y-4">
        {leaderboardData.map((player, index) => (
          <div
            key={player.rank}
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all transform hover:scale-105 ${
              player.isUser ? 'border-4 border-green-400' : ''
            } ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`text-4xl font-bold ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-gray-400' :
                  index === 2 ? 'text-orange-600' :
                  'text-gray-600'
                }`}>
                  #{player.rank}
                </div>
                <div className="text-4xl">{player.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                    <span>{player.name}</span>
                    {player.isUser && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                        YOU
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{player.city}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{player.points}</p>
                <p className="text-sm text-gray-600">{player.reports} reports</p>
                {index === 0 && <p className="text-xs text-yellow-600 font-semibold mt-1">🏆 Top Citizen</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Achievements</h2>
        <button
          onClick={() => setView('overview')}
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-1">Your Progress</p>
            <h3 className="text-3xl font-bold">{achievements.filter(a => a.earned).length}/{achievements.length}</h3>
            <p className="text-blue-100">Badges Earned</p>
          </div>
          <Award className="h-16 w-16 text-blue-200" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`bg-white rounded-2xl shadow-lg p-6 ${
              achievement.earned ? 'border-4 border-green-400' : 'opacity-75'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`text-6xl ${!achievement.earned ? 'grayscale' : ''}`}>
                {achievement.badge}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{achievement.title}</h3>
                <p className="text-gray-600 mb-3">{achievement.description}</p>
                {achievement.earned ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600 font-semibold">
                      Earned on {achievement.date}
                    </span>
                  </div>
                ) : (
                  <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                    🔒 Locked
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Games</span>
        </button>

        {view === 'overview' && renderOverview()}
        {view === 'missions' && renderMissions()}
        {view === 'leaderboard' && renderLeaderboard()}
        {view === 'achievements' && renderAchievements()}
      </div>
    </div>
  );
};

export default SmartCitizenChallenge;
