import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Users, Droplet, Calendar, LogOut, Menu, X,
  UserPlus, Activity, TrendingUp, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { donorService, bloodService, driveService } from '../services/api';
import DonorsPage from './DonorsPage';
import BloodInventoryPage from './BloodInventoryPage';
import DrivesPage from './DrivesPage';
import AdminsPage from './AdminsPage';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [donors, setDonors] = useState([]);
  const [bloodInventory, setBloodInventory] = useState([]);
  const [drives, setDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [donorsData, bloodData, drivesData] = await Promise.all([
        donorService.getAll(),
        bloodService.getAll(),
        driveService.getAll(),
      ]);
      setDonors(donorsData);
      setBloodInventory(bloodData);
      setDrives(drivesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const OverviewTab = () => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    const inventoryByGroup = bloodGroups.map(group => {
      const units = bloodInventory.filter(b => b.blood_group === group);
      const totalAmount = units.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
      return { group, amount: totalAmount, units: units.length };
    });

    const totalBloodVolume = bloodInventory.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
    
    const recentDonors = donors
      .sort((a, b) => b.donor_id - a.donor_id)
      .slice(0, 5);

    const upcomingDrives = drives
      .filter(d => new Date(d.drive_date) >= new Date())
      .sort((a, b) => new Date(a.drive_date) - new Date(b.drive_date))
      .slice(0, 5);

    // Check for low blood levels and expiring blood
    const lowStockGroups = inventoryByGroup.filter(g => g.amount < 5);
    const expiringBlood = bloodInventory.filter(b => {
      const daysUntilExpiry = Math.ceil((new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    });

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Donors</p>
                <h3 className="text-4xl font-bold mt-2">{donors.length}</h3>
                <p className="text-red-100 text-xs mt-2">Registered donors</p>
              </div>
              <div className="w-16 h-16 bg-red-400 bg-opacity-30 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Blood Units</p>
                <h3 className="text-4xl font-bold mt-2">{bloodInventory.length}</h3>
                <p className="text-pink-100 text-xs mt-2">Available units</p>
              </div>
              <div className="w-16 h-16 bg-pink-400 bg-opacity-30 rounded-full flex items-center justify-center">
                <Droplet className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Volume</p>
                <h3 className="text-4xl font-bold mt-2">{totalBloodVolume.toFixed(1)}L</h3>
                <p className="text-purple-100 text-xs mt-2">In stock</p>
              </div>
              <div className="w-16 h-16 bg-purple-400 bg-opacity-30 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Drives</p>
                <h3 className="text-4xl font-bold mt-2">{drives.length}</h3>
                <p className="text-indigo-100 text-xs mt-2">Organized</p>
              </div>
              <div className="w-16 h-16 bg-indigo-400 bg-opacity-30 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(lowStockGroups.length > 0 || expiringBlood.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lowStockGroups.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-2">Low Stock Alert</h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      The following blood groups are running low:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lowStockGroups.map(g => (
                        <span key={g.group} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-semibold">
                          {g.group}: {g.amount.toFixed(1)}L
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {expiringBlood.length > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-orange-800 mb-2">Expiring Soon</h4>
                    <p className="text-sm text-orange-700">
                      {expiringBlood.length} blood unit{expiringBlood.length > 1 ? 's' : ''} expiring within 7 days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blood Inventory by Group */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Blood Inventory by Group</h3>
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventoryByGroup.map(({ group, amount, units }) => (
              <div 
                key={group} 
                className={`border-2 rounded-lg p-4 hover:shadow-md transition ${
                  amount < 5 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-red-500'
                }`}
              >
                <div className="text-3xl font-bold text-red-600">{group}</div>
                <div className="text-gray-600 mt-2 font-semibold">{amount.toFixed(1)}L</div>
                <div className="text-sm text-gray-500">{units} units</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Donors</h3>
            {recentDonors.length > 0 ? (
              <div className="space-y-3">
                {recentDonors.map(donor => (
                  <div key={donor.donor_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <p className="font-semibold text-gray-800">{donor.name}</p>
                      <p className="text-sm text-gray-600">{donor.department} • {donor.branch}</p>
                    </div>
                    <div className="text-center">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                        {donor.blood_group}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{donor.amount_donated}L</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No donors yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Drives</h3>
            {upcomingDrives.length > 0 ? (
              <div className="space-y-3">
                {upcomingDrives.map(drive => (
                  <div key={drive.drive_id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{drive.venue}</p>
                        <p className="text-sm text-gray-600 mt-1">{drive.campus}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(drive.drive_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                      {drive.total_amount && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{drive.total_amount}L</p>
                          <p className="text-xs text-gray-500">Collected</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming drives</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <span className="text-lg font-bold text-gray-800">Blood Bank</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-gray-600 mx-auto">
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'donors', label: 'Donors', icon: Users },
            { id: 'blood', label: 'Blood Inventory', icon: Droplet },
            { id: 'drives', label: 'Drives', icon: Calendar },
            ...(isAdmin() ? [{ id: 'admins', label: 'Admins', icon: UserPlus }] : [])
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium">{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <div className={`${isSidebarOpen ? 'p-4' : 'p-2'} bg-gray-50 rounded-lg mb-3`}>
            {isSidebarOpen ? (
              <>
                <p className="text-xs text-gray-500 mb-1">Logged in as</p>
                <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.role}</p>
              </>
            ) : (
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mx-auto">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'donors' && 'Donor Management'}
              {activeTab === 'blood' && 'Blood Inventory'}
              {activeTab === 'drives' && 'Blood Drives'}
              {activeTab === 'admins' && 'Admin Management'}
            </h1>
            <p className="text-gray-600">
              {activeTab === 'overview' && 'Welcome to the Blood Bank Management System'}
              {activeTab === 'donors' && 'Manage and track blood donors'}
              {activeTab === 'blood' && 'Track and manage blood inventory'}
              {activeTab === 'drives' && 'Organize and manage blood donation drives'}
              {activeTab === 'admins' && 'Manage system administrators'}
            </p>
          </div>

          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'donors' && <DonorsPage onUpdate={fetchDashboardData} currentAdmin={user} />}
          {activeTab === 'blood' && <BloodInventoryPage onUpdate={fetchDashboardData} donors={donors} />}
          {activeTab === 'drives' && <DrivesPage onUpdate={fetchDashboardData} currentAdmin={user} />}
          {activeTab === 'admins' && isAdmin() && <AdminsPage />}
        </div>
      </main>
    </div>
  );
}