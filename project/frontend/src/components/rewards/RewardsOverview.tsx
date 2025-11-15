import React from 'react';
import { 
  Star, 
  TrendingUp, 
  Calendar,
  Gift,
  Target,
  Zap,
  Award,
  Coins
} from 'lucide-react';

interface RewardsOverviewProps {
  user: any;
}

const RewardsOverview: React.FC<RewardsOverviewProps> = ({ user }) => {
  const recentActivities = [
    {
      id: 1,
      action: 'Report Submitted',
      points: 10,
      date: '2024-01-15',
      description: 'Plastic waste report in Connaught Place'
    },
    {
      id: 2,
      action: 'Daily Login',
      points: 5,
      date: '2024-01-15',
      description: 'Streak bonus included'
    },
    {
      id: 3,
      action: 'Report Validated',
      points: 20,
      date: '2024-01-14',
      description: 'Your report was successfully resolved'
    },
    {
      id: 4,
      action: 'Achievement Unlocked',
      points: 25,
      date: '2024-01-13',
      description: 'Eco Warrior badge earned'
    }
  ];

  const weeklyGoals = [
    {
      name: 'Submit 3 Reports',
      progress: 67,
      current: 2,
      target: 3,
      reward: 50,
      icon: Target
    },
    {
      name: 'Login 5 Days',
      progress: 80,
      current: 4,
      target: 5,
      reward: 25,
      icon: Calendar
    },
    {
      name: 'Earn 100 Points',
      progress: 45,
      current: 45,
      target: 100,
      reward: 30,
      icon: Star
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Rewards Overview</h1>
        <p className="text-gray-600">
          Track your environmental contributions and earn rewards
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-lg transition-shadow">
          <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900">{user.rewardPoints}</p>
          <p className="text-sm text-gray-600">Total Points</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-lg transition-shadow">
          <Zap className="h-8 w-8 text-orange-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900">{user.streakCount || 7}</p>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-lg transition-shadow">
          <Award className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900">6</p>
          <p className="text-sm text-gray-600">Badges Earned</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-lg transition-shadow">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-900">#5</p>
          <p className="text-sm text-gray-600">Leaderboard Rank</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map(activity => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{activity.action}</h3>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      +{activity.points} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Weekly Goals</h2>
          </div>
          <div className="p-6 space-y-6">
            {weeklyGoals.map((goal, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <goal.icon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{goal.name}</span>
                  </div>
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    +{goal.reward} pts
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{goal.current}/{goal.target}</span>
                  <span className="text-sm text-gray-600">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Points Breakdown */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Points Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">230</p>
            <p className="text-sm text-gray-600">From Reports</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">35</p>
            <p className="text-sm text-gray-600">From Streaks</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">150</p>
            <p className="text-sm text-gray-600">From Achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsOverview;