import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AIProfilePage from './pages/AIProfilePage'; // kept for collector/admin if needed
import AIChatbotPage from './pages/AIChatbotPage';
import RewardsPage from './pages/RewardsPage';
import PaymentPage from './pages/PaymentPage';
import AdminPage from './pages/AdminPage';
import TaxCollectorPage from './pages/TaxCollectorPage';
import {
  LayoutDashboard, Trophy, CreditCard, LogOut, Landmark,
  Bell, User, BrainCircuit, ShieldAlert, ShieldCheck,
  Briefcase, ShieldCheck as ShieldIcon, Building2, Settings2, BotMessageSquare
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared header building block (keeps DRY across three shells)
// ─────────────────────────────────────────────────────────────────────────────
function AppHeader({ tabs, activeTab, setActiveTab, user, logout, rolePill }) {
  const isDefaulter = user?.status === 'Defaulter';

  return (
    <header className="bg-[#1A1A1A] border-b border-[#333333] sticky top-0 z-50 shadow-md w-full">
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div
            className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
            onClick={() => setActiveTab(tabs[0].id)}
          >
            <div className="w-9 h-9 bg-mustard rounded-xl flex items-center justify-center shadow-md shadow-mustard/20">
              <Landmark className="w-5 h-5 text-civic-black" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-white text-lg tracking-tight">CivTax</span>
              <span className="font-extrabold text-mustard text-lg ml-0.5">AI</span>
            </div>
          </div>

          {/* Role context pill */}
          {rolePill && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold flex-shrink-0 bg-white/5 border-white/10 text-gray-300">
              {rolePill.icon}
              <span>{rolePill.label}</span>
            </div>
          )}

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-mustard/20 text-mustard border border-mustard/40 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-mustard' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Citizen-specific compliance badge */}
            {user?.role === 'citizen' && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold border ${
                  isDefaulter
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-green-500/20 text-green-400 border-green-500/40'
                }`}
              >
                {isDefaulter
                  ? <ShieldAlert className="w-3.5 h-3.5" />
                  : <ShieldIcon className="w-3.5 h-3.5" />}
                <span>{user?.status || 'Compliant'}</span>
              </div>
            )}

            <button className="relative w-9 h-9 bg-[#252525] border border-[#333333] rounded-xl flex items-center justify-center hover:border-mustard transition-colors">
              <Bell className="w-4 h-4 text-gray-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-mustard text-civic-black font-extrabold rounded-full text-[9px] flex items-center justify-center">2</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 bg-[#252525] border border-[#333333] rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 bg-mustard/20 text-mustard rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-200 truncate max-w-[120px]">{user?.name}</span>
            </div>

            <button
              onClick={logout}
              className="w-9 h-9 bg-[#252525] border border-[#333333] rounded-xl flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

function MobileNav({ tabs, activeTab, setActiveTab }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#333333] z-50 px-2 py-1 shadow-2xl">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
                isActive ? 'text-mustard font-bold' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-mustard' : 'text-gray-400'}`} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 1 — Citizen Module  (Dashboard · AI Profile · Rewards · Pay Tax)
// Zero collector or admin elements present
// ─────────────────────────────────────────────────────────────────────────────
const CITIZEN_TABS = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'aichat',    label: 'AI Assistant', icon: BotMessageSquare },
  { id: 'rewards',   label: 'Rewards',     icon: Trophy },
  { id: 'payment',   label: 'Pay Tax',     icon: CreditCard },
];

function CitizenApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />;
      case 'aichat':    return <AIChatbotPage />;
      case 'rewards':   return <RewardsPage />;
      case 'payment':   return <PaymentPage />;
      default:          return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white selection:bg-mustard selection:text-civic-black overflow-x-hidden">
      <AppHeader
        tabs={CITIZEN_TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
        rolePill={{ icon: <User className="w-3 h-3" />, label: 'Citizen Portal' }}
      />
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {renderPage()}
      </main>
      <MobileNav tabs={CITIZEN_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 2 — Municipal Tax Collector Module
// Revenue analytics · Collection aging · Defaulter queue only
// No citizen self-pay logic, no admin config panels
// ─────────────────────────────────────────────────────────────────────────────
const COLLECTOR_TABS = [
  { id: 'collector', label: 'Collection Dashboard', icon: Briefcase },
];

function CollectorApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('collector');

  return (
    <div className="min-h-screen w-full bg-[#0C0E12] text-white selection:bg-amber-500 selection:text-black overflow-x-hidden">
      <AppHeader
        tabs={COLLECTOR_TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
        rolePill={{ icon: <Building2 className="w-3 h-3" />, label: 'Municipal Tax Collector' }}
      />
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
        <TaxCollectorPage />
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 3 — Admin Module  (Config · Officer Mgmt · Ward Mgmt · Monitoring)
// Completely decoupled from citizen and collector UI views
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_TABS = [
  { id: 'admin', label: 'Admin Control Centre', icon: Settings2 },
];

function AdminApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="min-h-screen w-full bg-[#0C0E12] text-white selection:bg-amber-500 selection:text-black overflow-x-hidden">
      <AppHeader
        tabs={ADMIN_TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
        rolePill={{ icon: <ShieldCheck className="w-3 h-3" />, label: 'System Admin' }}
      />
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
        <AdminPage />
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Router — mounts the correct isolated workspace based on role
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, userRole } = useAuth();

  // Pre-login gate: always show the role-selection landing page
  if (!isAuthenticated) return <LoginPage />;

  // Strict role → workspace dispatch  (complete unmount/remount on role change)
  if (userRole === 'collector') return <CollectorApp />;
  if (userRole === 'admin')     return <AdminApp />;

  // Default: citizen workspace
  return <CitizenApp />;
}
