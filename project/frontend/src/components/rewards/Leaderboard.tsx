import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Star,
  TrendingUp,
  Users,
  Crown
} from 'lucide-react';
import { getLeaderboard } from '../../utils/api';

interface LeaderboardProps {
  user: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPeriod]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeaderboard(selectedPeriod);
      if (response.success && response.data) {
        const leaderboard = response.data.leaderboard || [];
        // Mark current user
        const markedLeaderboard = leaderboard.map((entry: any) => ({
          ...entry,
          rank: entry.rank || 0,
          name: entry.name || 'Unknown',
          points: entry.rewardPoints || 0,
          reports: entry.totalReports || 0,
          streak: entry.streakCount || 0,
          badges: entry.badges || 0,
          achievements: entry.achievements || 0,
          avatar: user?.picture || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
          isCurrentUser: entry._id?.toString() === user?.id?.toString() || entry._id?.toString() === user?._id?.toString()
        }));
        setLeaderboardData(markedLeaderboard);
        setCurrentUserRank(response.data.currentUserRank || null);
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { id: 'all', name: 'All Time' },
    { id: 'month', name: 'This Month' },
    { id: 'week', name: 'This Week' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Leaderboard</h1>
        <p className="text-gray-600">
          See how you rank among environmental champions in your community
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg border p-1 flex">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPeriod === period.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {period.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
        </div>
      ) : (
        <>
          {/* Your Rank Card */}
          {currentUserRank && (
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white mb-8">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Your Current Rank</h2>
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-4xl font-bold">#{currentUserRank}</div>
                  <div>
                    <p className="text-lg font-semibold">{user.rewardPoints || 0} points</p>
                    <p className="text-green-100">Keep going to reach top 3!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No leaderboard data available</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Top Contributors</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {leaderboardData.map((entry) => (
                  <div key={entry.rank || entry._id} className={`p-6 hover:bg-gray-50 transition-colors ${
                    entry.isCurrentUser ? 'bg-green-50 border-l-4 border-green-500' : ''
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150';
                        }}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-semibold ${entry.isCurrentUser ? 'text-green-800' : 'text-gray-900'}`}>
                              {entry.name} {entry.isCurrentUser && '(You)'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{entry.points} pts</span>
                              </span>
                              <span>{entry.reports} reports</span>
                              <span>{entry.streak} day streak</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-900">{entry.badges} badges</span>
                            </div>
                            {entry.rank <= 3 && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Top Contributor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6 text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{leaderboardData.length}</p>
          <p className="text-sm text-gray-600">Active Contributors</p>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {leaderboardData.length > 0 
              ? Math.round((leaderboardData.filter((u: any) => u.reports > 0).length / leaderboardData.length) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-600">Active Contributors</p>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {leaderboardData.reduce((sum: number, u: any) => sum + (u.points || 0), 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Points Earned</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;