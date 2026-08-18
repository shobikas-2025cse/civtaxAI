import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AIProfilePage from './pages/AIProfilePage';
import AIChatbotPage from './pages/AIChatbotPage';
import RewardsPage from './pages/RewardsPage';
import PaymentPage from './pages/PaymentPage';
import AdminPage from './pages/AdminPage';
import TaxCollectorPage from './pages/TaxCollectorPage';
import LanguageSelector from './components/LanguageSelector';
import {
  LayoutDashboard, Trophy, CreditCard, LogOut, Landmark,
  Bell, User, BrainCircuit, ShieldAlert, ShieldCheck,
  Briefcase, ShieldCheck as ShieldIcon, Building2, Settings2, BotMessageSquare
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared header building block
// ─────────────────────────────────────────────────────────────────────────────
function AppHeader({ tabs, activeTab, setActiveTab, user, logout, rolePill }) {
  const { t } = useTranslation();
  const isDefaulter = user?.status === 'Defaulter';

  return (
    <header className="bg-[#12141A] border-b border-[#262B38] sticky top-0 z-50 shadow-xl shadow-black/25 w-full">
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div
            className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
            onClick={() => setActiveTab(tabs[0].id)}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#FFDC69] to-[#D1A000] rounded-xl flex items-center justify-center shadow-lg shadow-[#E5B80B]/25">
              <Landmark className="w-5 h-5 text-black" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-white text-lg tracking-tight">CivTax</span>
              <span className="font-extrabold text-[#E5B80B] text-lg ml-0.5">AI</span>
            </div>
          </div>

          {/* Role context pill */}
          {rolePill && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold flex-shrink-0 bg-[#181C26] border-[#2A3040] text-gray-200 shadow-sm">
              {rolePill.icon}
              <span>{rolePill.labelKey ? t(rolePill.labelKey) : rolePill.label}</span>
            </div>
          )}

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E5B80B] text-black shadow-md shadow-[#E5B80B]/25 font-black'
                      : 'text-gray-300 hover:text-white hover:bg-[#1C202B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Citizen-specific compliance badge */}
            {user?.role === 'citizen' && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold border ${
                  isDefaulter
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}
              >
                {isDefaulter
                  ? <ShieldAlert className="w-3.5 h-3.5" />
                  : <ShieldIcon className="w-3.5 h-3.5" />}
                <span>{isDefaulter ? t('dashboard.defaulter') : t('dashboard.compliant')}</span>
              </div>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            <button className="relative w-9 h-9 bg-[#181C26] border border-[#2A3040] rounded-xl flex items-center justify-center hover:border-[#E5B80B] transition-colors cursor-pointer">
              <Bell className="w-4 h-4 text-gray-200" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E5B80B] text-black font-extrabold rounded-full text-[9px] flex items-center justify-center">2</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 bg-[#181C26] border border-[#2A3040] rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 bg-[#E5B80B]/20 text-[#E5B80B] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-100 truncate max-w-[130px]">{user?.name}</span>
            </div>

            <button
              onClick={logout}
              className="w-9 h-9 bg-[#181C26] border border-[#2A3040] rounded-xl flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
              title={t('nav.logout')}
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
  const { t } = useTranslation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#12141A] border-t border-[#262B38] z-50 px-2 py-1 shadow-2xl">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
                isActive ? 'text-[#E5B80B] font-bold' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#E5B80B]' : 'text-gray-400'}`} />
              <span className="text-[10px] font-medium leading-none">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 1 — Citizen Module
// ─────────────────────────────────────────────────────────────────────────────
const CITIZEN_TABS = [
  { id: 'dashboard', labelKey: 'nav.dashboard',   icon: LayoutDashboard },
  { id: 'aichat',    labelKey: 'nav.aiAssistant', icon: BotMessageSquare },
  { id: 'rewards',   labelKey: 'nav.rewards',     icon: Trophy },
  { id: 'payment',   labelKey: 'nav.payTax',      icon: CreditCard },
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
    <div className="min-h-screen w-full app-theme-bg text-white selection:bg-[#E5B80B] selection:text-black overflow-x-hidden">
      <AppHeader
        tabs={CITIZEN_TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
        rolePill={{ icon: <User className="w-3 h-3 text-[#E5B80B]" />, labelKey: 'nav.citizenPortal' }}
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
// ─────────────────────────────────────────────────────────────────────────────
const COLLECTOR_TABS = [
  { id: 'collector', labelKey: 'nav.collectionDashboard', icon: Briefcase },
];

function CollectorApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('collector');

  return (
    <div className="min-h-screen w-full app-theme-bg text-white selection:bg-[#E5B80B] selection:text-black overflow-x-hidden">
      <AppHeader
        tabs={COLLECTOR_TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
        rolePill={{ icon: <Building2 className="w-3 h-3 text-[#E5B80B]" />, labelKey: 'nav.taxCollector' }}
      />
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
        <TaxCollectorPage />
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 3 — Admin Module
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_TABS = [
  { id: 'admin', labelKey: 'nav.adminControlCentre', icon: Settings2 },
];

function AdminApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="min-h-screen w-full app-theme-bg text-white selection:bg-[#E5B80B] selection:text-black overflow-x-hidden">
      <AppHeader
        tabs={ADMIN_TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
        rolePill={{ icon: <ShieldCheck className="w-3 h-3 text-[#E5B80B]" />, labelKey: 'nav.systemAdmin' }}
      />
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
        <AdminPage />
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Router
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) return <LoginPage />;

  if (userRole === 'collector') return <CollectorApp />;
  if (userRole === 'admin')     return <AdminApp />;

  return <CitizenApp />;
}
