
import React, { useMemo, useState } from 'react';
import { useAppStore } from './store';
import { PropertySwitcher } from './components/PropertySwitcher';
import { SettlementTable } from './components/SettlementTable';
import { DigitalTenantList } from './components/DigitalTenantList';
import { ExpenseManager } from './components/ExpenseManager';
import { UnitManager } from './components/UnitManager';
import { PropertyManager } from './components/PropertyManager';
import { SetupWizard } from './components/SetupWizard';
import { PropertyOnboarding } from './components/PropertyOnboarding';
import { SettingsManager } from './components/SettingsManager';
import { calculateSettlement } from './services/calculationEngine';
import { 
  LayoutDashboard, 
  Users, 
  ReceiptEuro, 
  Settings, 
  PieChart, 
  Download,
  AlertTriangle,
  Upload,
  Building2,
  List,
  ArrowRight,
  Menu,
  X,
  CalendarDays,
  Globe,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileText,
  MousePointer2,
  Search,
  TrendingUp,
  Activity,
  Split
} from 'lucide-react';
import { InvoiceScanner } from './components/InvoiceScanner';

const WelcomeView: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const t = useAppStore(state => state.t);
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Elegant Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 from-indigo-600 via-violet-500 to-indigo-600"></div>
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-violet-50/40 rounded-full blur-[120px] -z-10"></div>

            <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-24 items-center relative z-10 py-12">
                {/* Left Column: Value Prop */}
                <div className="space-y-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 transition-transform group-hover:scale-105">
                                <Building2 size={32} />
                            </div>
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">beyoniq</span>
                        </div>
                        <LanguageSwitcher />
                    </div>
                    
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                            <Sparkles size={12} /> {t('app.welcome.badge')}
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tight">
                            {t('app.welcomeTitle')}
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                            {t('app.welcomeSlogan')}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <FeatureItem icon={<Zap size={18} className="text-amber-500" />} text={t('app.welcome.feature_ai')} />
                        <FeatureItem icon={<ShieldCheck size={18} className="text-emerald-500" />} text={t('app.welcome.feature_legal')} />
                        <FeatureItem icon={<Split size={18} className="text-indigo-500" />} text={t('app.welcome.feature_split')} />
                        <FeatureItem icon={<FileText size={18} className="text-rose-500" />} text={t('app.welcome.feature_pdf')} />
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={onStart}
                            className="group w-full sm:w-auto px-12 py-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-black rounded-[2rem] shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                        >
                            {t('app.startNow')} <ArrowRight size={26} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Right Column: Layered UI Composition */}
                <div className="hidden lg:block relative h-[600px]">
                    {/* Main Background Card (Dashboard Preview) */}
                    <div className="absolute top-0 right-0 w-[540px] bg-slate-50 border border-slate-200 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-12 duration-1000">
                        <div className="p-8 border-b border-slate-200 bg-white flex justify-between items-center">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('app.welcome.mock_dashboard')}</div>
                        </div>
                        <div className="p-10 space-y-10">
                            <div className="space-y-4">
                                <div className="h-6 w-48 bg-slate-900 rounded-full"></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('app.welcome.mock_allocatable')}</div>
                                        <div className="text-2xl font-black text-slate-900 tracking-tight">€ 4.290,50</div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('app.welcome.mock_units')}</div>
                                        <div className="text-2xl font-black text-slate-900 tracking-tight">12 {t('app.welcome.mock_active')}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
                                    <div className="h-4 w-4 bg-slate-200 rounded"></div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { n: 'Müller, Julia', s: t('app.welcome.mock_paid'), c: 'bg-emerald-100 text-emerald-700' },
                                        { n: 'Schmidt, Max', s: t('app.welcome.mock_pending'), c: 'bg-amber-100 text-amber-700' },
                                        { n: 'Property Tax', s: t('app.welcome.mock_ocr'), c: 'bg-indigo-100 text-indigo-700' }
                                    ].map((row, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/50 border border-slate-100 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                                                <span className="text-sm font-bold text-slate-800">{row.n}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${row.c}`}>
                                                {row.s}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Settlement Card */}
                    <div className="absolute -left-12 top-20 w-72 bg-white p-6 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 animate-in slide-in-from-left duration-700 delay-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('app.welcome.mock_share')}</div>
                                <div className="text-sm font-black text-slate-900">{t('app.welcome.mock_owner')}</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-medium">{t('app.welcome.mock_vacancy')}</span>
                                <span className="text-xs font-black text-slate-900">€ 84,20</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-2/3"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating AI Scan Badge */}
                    <div className="absolute -left-4 bottom-20 bg-indigo-600 p-6 rounded-[2rem] shadow-2xl shadow-indigo-200 text-white flex items-center gap-5 animate-in slide-in-from-bottom duration-1000 delay-500">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Zap size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">AI Scanner</div>
                            <div className="text-sm font-black">98.4% {t('app.welcome.mock_accuracy')}</div>
                        </div>
                    </div>

                    {/* Security Badge Accent */}
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 flex items-center gap-4 animate-in zoom-in duration-500 delay-700">
                         <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                            <ShieldCheck size={24} />
                         </div>
                         <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('app.welcome.mock_secure')}</div>
                            <div className="text-sm font-black text-slate-900">{t('app.welcome.mock_bgb')}</div>
                         </div>
                    </div>

                    {/* Analysis Badge Accent */}
                    <div className="absolute bottom-10 right-10 bg-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 flex items-center gap-4 animate-in slide-in-from-right duration-700 delay-1000">
                         <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white">
                            <PieChart size={24} />
                         </div>
                         <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('app.welcome.mock_analysis')}</div>
                            <div className="text-sm font-black text-slate-900">{t('app.welcome.mock_realtime')}</div>
                         </div>
                    </div>
                </div>
            </div>
            
            <footer className="mt-auto text-slate-400 text-sm font-bold tracking-tight pb-12">
                {t('app.copyright')}
            </footer>
        </div>
    );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-50 cursor-default">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
            {icon}
        </div>
        <span className="text-sm font-bold text-slate-700 tracking-tight">{text}</span>
    </div>
);

const WelcomeStep = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="flex items-start gap-5 p-6 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div>
            <h4 className="font-black text-slate-900 text-lg tracking-tight">{title}</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

const LanguageSwitcher = () => {
  const { language, setLanguage } = useAppStore();
  return (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
      <button 
        onClick={() => setLanguage('de')}
        className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${language === 'de' ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
      >
        DE
      </button>
      <button 
        onClick={() => setLanguage('en')}
        className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
      >
        EN
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const { 
    properties, units, tenants, tenancies, expenses, occupancyHistory,
    selectedPropertyId, getFormattedPrice, openWizard, accountingYear, setAccountingYear, t
  } = useAppStore();

  const [showImport, setShowImport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'expenses' | 'tenants' | 'units' | 'settings'>('overview');

  const activeProperty = properties.find(p => p.id === selectedPropertyId);

  const { results, ownerVacancyShare } = useMemo(() => {
    if (!activeProperty) return { results: [], ownerVacancyShare: 0 };
    return calculateSettlement(
        activeProperty,
        units.filter(u => u.property_id === activeProperty.id),
        tenancies,
        expenses,
        tenants,
        occupancyHistory,
        accountingYear
    );
  }, [activeProperty, units, tenancies, expenses, tenants, occupancyHistory, accountingYear]);

  const totalCosts = expenses
    .filter(e => e.property_id === selectedPropertyId)
    .filter(e => new Date(e.period_start).getFullYear() <= accountingYear && new Date(e.period_end).getFullYear() >= accountingYear)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'overview': return `${t('app.accountingYear')} ${accountingYear}`;
      case 'properties': return t('app.properties');
      case 'expenses': return t('app.expenses');
      case 'tenants': return t('app.tenants');
      case 'units': return t('app.units');
      case 'settings': return t('app.settings');
      default: return 'beyoniq';
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
      setActiveTab(tab);
      setIsMobileMenuOpen(false);
  };

  if (properties.length === 0) {
      return (
        <>
            <PropertyOnboarding />
            <WelcomeView onStart={openWizard} />
        </>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      <PropertyOnboarding />
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`
        w-80 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-indigo-100">b</div>
               <span className="font-black text-2xl tracking-tighter text-slate-900">beyoniq</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-slate-900">
               <X size={28} />
           </button>
        </div>
        
        <div className="p-6">
            <PropertySwitcher />
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
            <SidebarItem icon={<LayoutDashboard size={22} />} label={t('app.overview')} active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} />
            <SidebarItem icon={<List size={22} />} label={t('app.properties')} active={activeTab === 'properties'} onClick={() => handleTabChange('properties')} />
            
            <div className="pt-10 pb-4 px-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Management</div>
            <SidebarItem icon={<Building2 size={22} />} label={t('app.units')} active={activeTab === 'units'} onClick={() => handleTabChange('units')} />
            <SidebarItem icon={<Users size={22} />} label={t('app.tenants')} active={activeTab === 'tenants'} onClick={() => handleTabChange('tenants')} />
            <SidebarItem icon={<ReceiptEuro size={22} />} label={t('app.expenses')} active={activeTab === 'expenses'} onClick={() => handleTabChange('expenses')} />
            <SidebarItem icon={<PieChart size={22} />} label={t('app.reports')} />
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-6">
            <div className="flex justify-between items-center px-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('app.settings')}</span>
            </div>
            <SidebarItem icon={<Settings size={22} />} label={t('app.settings')} active={activeTab === 'settings'} onClick={() => handleTabChange('settings')} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sm:px-12 sticky top-0 z-30">
            <div className="flex items-center gap-5">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2.5 hover:bg-slate-100 rounded-xl text-slate-500">
                    <Menu size={28} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-slate-900 truncate tracking-tight leading-none">
                        {getHeaderTitle()}
                    </h1>
                    {activeProperty && activeTab === 'overview' && (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-2">
                            <Building2 size={12} className="text-indigo-500" /> {activeProperty.name}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {activeProperty && (
                    <div className="hidden sm:flex items-center gap-3 bg-slate-100 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-inner">
                        <CalendarDays size={18} className="text-slate-400" />
                        <select 
                            value={accountingYear}
                            onChange={(e) => setAccountingYear(Number(e.target.value))}
                            className="bg-transparent text-sm font-black text-slate-700 outline-none cursor-pointer"
                        >
                            <option value={2027}>2027</option>
                            <option value={2026}>2026</option>
                            <option value={2025}>2025</option>
                        </select>
                    </div>
                )}

                {activeProperty && (
                    <button 
                        onClick={() => setShowImport(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-base font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
                    >
                        <Upload size={20} /> <span className="hidden sm:inline">{t('app.scanInvoices')}</span>
                    </button>
                )}
            </div>
        </header>

        <div className="p-8 sm:p-12 flex-1 overflow-auto flex flex-col space-y-10">
            {activeTab === 'properties' ? (
                <PropertyManager />
            ) : !activeProperty ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 max-w-md mx-auto text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-10 shadow-2xl border border-slate-100">
                        <Building2 size={56} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{t('app.noProperty')}</h3>
                    <p className="text-base font-medium text-slate-500 mb-12">{t('app.noPropertyDesc')}</p>
                    <button 
                        onClick={() => setActiveTab('properties')} 
                        className="w-full bg-indigo-600 px-10 py-4 rounded-[1.25rem] text-white font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                        {t('app.goToProperties')}
                    </button>
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && <SetupWizard />}

                    {activeTab === 'overview' && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <KPICard title={t('app.totalCosts')} value={getFormattedPrice(totalCosts)} icon={<ReceiptEuro size={28} />} trend="+1.2%" color="bg-indigo-600 text-white shadow-indigo-200" />
                            <KPICard title={t('app.allocatable')} value={getFormattedPrice(totalCosts - ownerVacancyShare)} icon={<CheckCircle2 size={28} />} color="bg-emerald-500 text-white shadow-emerald-100" />
                            <KPICard title={t('app.vacancyOwner')} value={getFormattedPrice(ownerVacancyShare)} icon={<AlertTriangle size={28} />} color="bg-rose-500 text-white shadow-rose-100" />
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('app.settlementOverview')} {accountingYear}</h2>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Detailierte Aufstellung</p>
                                </div>
                                <button className="px-6 py-3 text-xs font-black text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-2xl flex items-center gap-3 transition-all">
                                    <Download size={18} /> <span className="hidden sm:inline">{t('app.exportPdf')}</span>
                                </button>
                            </div>
                            <SettlementTable data={results} />
                        </div>
                    </div>
                    )}

                    {activeTab === 'units' && <UnitManager />}
                    {activeTab === 'tenants' && <DigitalTenantList />}
                    {activeTab === 'expenses' && <ExpenseManager onImportClick={() => setShowImport(true)} />}
                    {activeTab === 'settings' && <SettingsManager />}
                </>
            )}
        </div>
      </main>

      {showImport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300 p-6">
            <div className="bg-white w-full h-full md:h-[85vh] md:w-[700px] md:rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/20">
                <InvoiceScanner onClose={() => setShowImport(false)} />
            </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-5 py-4 text-base font-bold rounded-2xl transition-all ${
            active 
            ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 translate-x-2' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
        <span className={`${active ? 'text-white' : 'text-slate-400'}`}>{icon}</span>
        {label}
    </button>
);

const KPICard = ({ title, value, icon, trend, color }: any) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 flex items-start justify-between premium-card cursor-default">
        <div className="space-y-6">
            <div className="space-y-1.5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
            </div>
            {trend && (
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black shadow-sm border border-emerald-100">
                    {trend} vs. VJ
                </span>
            )}
        </div>
        <div className={`p-5 rounded-[1.5rem] shadow-2xl ${color}`}>
            {icon}
        </div>
    </div>
);

export default App;
