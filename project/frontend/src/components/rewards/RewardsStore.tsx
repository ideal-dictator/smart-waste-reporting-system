import React, { useState } from 'react';
import {
  ShoppingBag,
  Star,
  Gift,
  Coins,
  Package,
  CheckCircle,
  Sparkles,
  Award,
  TreePine,
  Bike,
  Coffee,
  ShoppingCart,
  X
} from 'lucide-react';

interface RewardsStoreProps {
  user: any;
  onUpdatePoints?: (newPoints: number) => void;
}

const RewardsStore: React.FC<RewardsStoreProps> = ({ user, onUpdatePoints }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const storeItems = [
    {
      id: 'eco_badge_bronze',
      name: 'Bronze Eco Warrior Badge',
      description: 'Show your commitment to the environment with this prestigious digital badge',
      points: 50,
      category: 'badges',
      icon: Star,
      color: 'from-orange-400 to-orange-600',
      available: true,
      popular: false
    },
    {
      id: 'eco_badge_silver',
      name: 'Silver Environmental Guardian',
      description: 'Advanced environmental steward recognition badge',
      points: 150,
      category: 'badges',
      icon: Star,
      color: 'from-gray-300 to-gray-500',
      available: true,
      popular: true
    },
    {
      id: 'eco_badge_gold',
      name: 'Gold Climate Champion',
      description: 'Elite status for dedicated environmental warriors',
      points: 300,
      category: 'badges',
      icon: Award,
      color: 'from-yellow-400 to-yellow-600',
      available: true,
      popular: true
    },
    {
      id: 'plant_sapling',
      name: 'Free Plant Sapling Package',
      description: 'Get 3 native plant saplings delivered to your home with planting guide',
      points: 200,
      category: 'physical',
      icon: TreePine,
      color: 'from-green-400 to-green-600',
      available: true,
      popular: true
    },
    {
      id: 'eco_bicycle_kit',
      name: 'Eco Bicycle Accessory Kit',
      description: 'Complete cycling kit with water bottle, reflectors, and repair tools',
      points: 500,
      category: 'physical',
      icon: Bike,
      color: 'from-blue-400 to-blue-600',
      available: true,
      popular: false
    },
    {
      id: 'reusable_coffee_set',
      name: 'Premium Reusable Coffee Set',
      description: 'Bamboo coffee cup with travel lid and reusable straw set',
      points: 250,
      category: 'physical',
      icon: Coffee,
      color: 'from-amber-400 to-amber-600',
      available: true,
      popular: true
    },
    {
      id: 'discount_10',
      name: '10% Discount Voucher',
      description: 'Use at any of our 50+ partner eco-friendly stores',
      points: 80,
      category: 'coupons',
      icon: Gift,
      color: 'from-pink-400 to-pink-600',
      available: true,
      popular: false
    },
    {
      id: 'discount_25',
      name: '25% Mega Discount',
      description: 'Premium discount voucher for sustainable product stores',
      points: 180,
      category: 'coupons',
      icon: Gift,
      color: 'from-red-400 to-red-600',
      available: true,
      popular: false
    },
    {
      id: 'free_delivery',
      name: 'Free Delivery Pass (3 months)',
      description: 'Free delivery on all eco-friendly product orders',
      points: 120,
      category: 'coupons',
      icon: ShoppingCart,
      color: 'from-teal-400 to-teal-600',
      available: true,
      popular: true
    },
    {
      id: 'eco_tote_bag',
      name: 'Designer Eco Tote Bag',
      description: 'Limited edition sustainable shopping bag from recycled ocean plastic',
      points: 280,
      category: 'physical',
      icon: Package,
      color: 'from-cyan-400 to-cyan-600',
      available: true,
      popular: false
    },
    {
      id: 'bamboo_cutlery',
      name: 'Bamboo Cutlery Travel Set',
      description: 'Portable bamboo cutlery set with carrying case',
      points: 150,
      category: 'physical',
      icon: Package,
      color: 'from-lime-400 to-lime-600',
      available: true,
      popular: false
    },
    {
      id: 'recognition_certificate',
      name: 'Official Recognition Certificate',
      description: 'Signed certificate of environmental contribution for your achievements',
      points: 200,
      category: 'certificates',
      icon: Award,
      color: 'from-purple-400 to-purple-600',
      available: true,
      popular: false
    },
    {
      id: 'eco_hero_certificate',
      name: 'Eco Hero Certificate',
      description: 'Premium certificate with city mayor signature and frame',
      points: 400,
      category: 'certificates',
      icon: Award,
      color: 'from-indigo-400 to-indigo-600',
      available: true,
      popular: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBag },
    { id: 'badges', name: 'Digital Badges', icon: Star },
    { id: 'physical', name: 'Physical Rewards', icon: Package },
    { id: 'coupons', name: 'Vouchers & Coupons', icon: Gift },
    { id: 'certificates', name: 'Certificates', icon: CheckCircle }
  ];

  const filteredItems = selectedCategory === 'all'
    ? storeItems
    : storeItems.filter(item => item.category === selectedCategory);

  const handlePurchaseClick = (item: any) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (selectedItem && user.rewardPoints >= selectedItem.points) {
      const newPoints = user.rewardPoints - selectedItem.points;
      onUpdatePoints?.(newPoints);
      setPurchaseSuccess(selectedItem.name);
      setShowPurchaseModal(false);
      setTimeout(() => setPurchaseSuccess(null), 4000);
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto p-6">
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse-slow mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Rewards Store</h1>
          <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse-slow ml-3" />
        </div>
        <p className="text-xl text-gray-600 mb-6">
          Redeem your eco-points for amazing rewards and make a difference!
        </p>
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-4 rounded-2xl inline-block animate-glow shadow-lg hover:scale-105 transition-transform">
          <div className="flex items-center space-x-3">
            <Coins className="h-6 w-6 animate-float" />
            <div className="text-left">
              <p className="text-sm opacity-90">Available Points</p>
              <p className="text-3xl font-bold">{user.rewardPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 animate-slide-up">
        {categories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 animate-fade-in-up ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <category.icon className="h-5 w-5" />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Success Message */}
      {purchaseSuccess && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-2xl p-6 mb-8 text-center animate-zoom-in shadow-lg">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3 animate-bounce" />
          <p className="text-green-800 font-bold text-xl mb-2">
            Purchase Successful! 🎉
          </p>
          <p className="text-green-700">
            You have redeemed: <span className="font-semibold">{purchaseSuccess}</span>
          </p>
          <p className="text-green-600 text-sm mt-2">
            Check your profile for your new reward!
          </p>
        </div>
      )}

      {/* Store Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up hover-lift relative overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {item.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>POPULAR</span>
              </div>
            )}

            <div className={`bg-gradient-to-br ${item.color} rounded-xl p-6 mb-4 text-white text-center hover:scale-110 transition-transform duration-300`}>
              <item.icon className="h-12 w-12 mx-auto animate-float" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 min-h-[3rem]">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-4 min-h-[3rem]">{item.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg">
                <Coins className="h-5 w-5 text-yellow-600 animate-pulse-slow" />
                <span className="font-bold text-xl text-yellow-700">{item.points}</span>
              </div>

              {user.rewardPoints >= item.points ? (
                <div className="text-green-600 text-sm font-medium flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Available</span>
                </div>
              ) : (
                <div className="text-gray-400 text-sm font-medium">
                  Need {item.points - user.rewardPoints} more
                </div>
              )}
            </div>

            <button
              onClick={() => handlePurchaseClick(item)}
              disabled={user.rewardPoints < item.points}
              className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                user.rewardPoints >= item.points
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {user.rewardPoints >= item.points ? (
                <span className="flex items-center justify-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Redeem Now</span>
                </span>
              ) : (
                'Insufficient Points'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-zoom-in">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Confirm Purchase</h2>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className={`bg-gradient-to-br ${selectedItem.color} rounded-xl p-6 mb-4 text-white text-center`}>
                <selectedItem.icon className="h-16 w-16 mx-auto mb-3 animate-bounce-slow" />
                <h3 className="text-xl font-bold">{selectedItem.name}</h3>
              </div>

              <p className="text-gray-600 mb-6">{selectedItem.description}</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Item Cost:</span>
                  <span className="font-bold text-lg flex items-center space-x-1">
                    <Coins className="h-5 w-5 text-yellow-600" />
                    <span>{selectedItem.points} points</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-bold text-lg text-green-600">{user.rewardPoints} points</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">After Purchase:</span>
                  <span className="font-bold text-xl text-blue-600">
                    {user.rewardPoints - selectedItem.points} points
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-105"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsStore;
