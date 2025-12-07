import React, { useState, useRef } from 'react';
import { UserProfile, DEFAULT_PROFILE } from '../types';
import { Sliders, DollarSign, Target, Briefcase, TrendingUp, Wallet, PieChart, Upload, FileText, X, Globe, Sparkles } from 'lucide-react';

interface Props {
  onGenerate: (profile: UserProfile) => void;
  isLoading: boolean;
}

const InputForm: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal: string) => {
    setProfile(prev => {
      const goals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals };
    });
  };

  const handleGeoToggle = (geo: string) => {
    setProfile(prev => {
      const geographicFocus = prev.geographicFocus.includes(geo)
        ? prev.geographicFocus.filter(g => g !== geo)
        : [...prev.geographicFocus, geo];
      return { ...prev, geographicFocus };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                // Add a header so the AI knows which file this block came from
                resolve(typeof text === 'string' ? `\n--- START OF IMPORT: ${file.name} ---\n${text}\n--- END OF IMPORT ---\n` : '');
            };
            reader.readAsText(file);
        });
    };

    const promises = Array.from(files).map(readFile);
    const contents = await Promise.all(promises);
    const combinedContent = contents.join('\n');

    setProfile(prev => ({
        ...prev,
        currentPortfolio: prev.currentPortfolio 
            ? `${prev.currentPortfolio}\n${combinedContent}`
            : combinedContent
    }));

    // Reset input to allow re-uploading the same files if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-sky-500 outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const iconInputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-white focus:ring-1 focus:ring-sky-500 outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            Legacy Profile Setup
          </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Personal & Goals */}
        <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Demographics</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Current Age</label>
                    <input 
                    type="number" 
                    value={profile.age} 
                    onChange={(e) => handleChange('age', e.target.value)}
                    className={inputClass}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Retirement Age</label>
                    <input 
                    type="number" 
                    value={profile.retirementAge} 
                    onChange={(e) => handleChange('retirementAge', e.target.value)}
                    className={inputClass}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tax Filing Status</label>
                <select 
                value={profile.taxFilingStatus} 
                onChange={(e) => handleChange('taxFilingStatus', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-sky-500 outline-none text-sm"
                >
                <option value="single">Single</option>
                <option value="married_joint">Married Filing Jointly</option>
                <option value="head_household">Head of Household</option>
                </select>
            </div>
            
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Annual Income</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-3 h-3 text-slate-500" />
                    <input 
                    type="number" 
                    value={profile.annualIncome} 
                    onChange={(e) => handleChange('annualIncome', e.target.value)}
                    className={iconInputClass}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Monthly New Contribution</label>
                <div className="relative">
                    <TrendingUp className="absolute left-3 top-2.5 w-3 h-3 text-slate-500" />
                    <input 
                    type="number" 
                    value={profile.monthlyContribution} 
                    onChange={(e) => handleChange('monthlyContribution', e.target.value)}
                    className={iconInputClass}
                    />
                </div>
            </div>
        </div>

        {/* Right Column: Assets & Risk */}
        <div className="space-y-6">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Liquidity & Capital</h3>
           
           <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-sky-400 mb-1">Cash / Savings (Liquidity)</label>
                    <div className="relative">
                        <Wallet className="absolute left-3 top-2.5 w-3 h-3 text-slate-500" />
                        <input 
                        type="number" 
                        value={profile.cash} 
                        onChange={(e) => handleChange('cash', e.target.value)}
                        className={iconInputClass}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-blue-400 mb-1">Brokerage (Taxable Equity)</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 w-3 h-3 text-slate-500" />
                        <input 
                        type="number" 
                        value={profile.brokerageBalance} 
                        onChange={(e) => handleChange('brokerageBalance', e.target.value)}
                        className={iconInputClass}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-amber-400 mb-1">Roth / 401k (Tax-Free Growth)</label>
                    <div className="relative">
                        <PieChart className="absolute left-3 top-2.5 w-3 h-3 text-slate-500" />
                        <input 
                        type="number" 
                        value={profile.rothBalance} 
                        onChange={(e) => handleChange('rothBalance', e.target.value)}
                        className={iconInputClass}
                        />
                    </div>
                </div>
           </div>

            <div className="pt-2">
                <label className="block text-xs font-medium text-slate-400 mb-2">Risk Tolerance</label>
                <div className="grid grid-cols-2 gap-2">
                {['conservative', 'moderate', 'aggressive', 'growth_maximalist'].map((level) => (
                    <button
                    key={level}
                    onClick={() => handleChange('riskTolerance', level)}
                    className={`py-2 px-2 text-xs rounded-lg border transition-all capitalize ${
                        profile.riskTolerance === level
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                    >
                    {level.replace('_', ' ')}
                    </button>
                ))}
                </div>
            </div>
        </div>
      </div>
      
      {/* Portfolio Import Section */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Existing Portfolio Import</h3>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                     <p className="text-xs text-slate-400">
                        Paste your holdings or upload CSV exports from Fidelity, Robinhood, or Schwab.
                     </p>
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 transition-colors"
                     >
                        <Upload className="w-3 h-3" />
                        Upload Files
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".csv,.txt"
                        className="hidden"
                        multiple
                     />
                </div>
                <div className="relative">
                    <textarea 
                        value={profile.currentPortfolio}
                        onChange={(e) => handleChange('currentPortfolio', e.target.value)}
                        placeholder="Example:
AAPL 50 shares
VTI $15,000
100 shares of MSFT"
                        className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:ring-1 focus:ring-sky-500 outline-none resize-none font-mono"
                    />
                    {profile.currentPortfolio && (
                         <button 
                            onClick={() => handleChange('currentPortfolio', '')}
                            className="absolute top-2 right-2 p-1 bg-slate-800 rounded text-slate-500 hover:text-white"
                         >
                            <X className="w-3 h-3" />
                         </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Bottom: Goals & Geo */}
      <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-3">Legacy Goals (Select all that apply)</label>
            <div className="flex flex-wrap gap-2">
            {['Beat Inflation', 'Max Dividends', 'Tax Efficiency', 'Early Retirement', 'Speculative Growth', 'Real Estate', 'Crypto Exposure'].map((goal) => (
                <button
                key={goal}
                onClick={() => handleGoalToggle(goal)}
                className={`py-1.5 px-3 text-xs rounded-full border transition-all ${
                    profile.goals.includes(goal)
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
                >
                {goal}
                </button>
            ))}
            </div>
        </div>
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-3 flex items-center gap-2"><Globe className="w-3 h-3" /> Geographic Focus</label>
            <div className="flex flex-wrap gap-2">
            {['US Focused', 'Europe', 'Asia (Developed)', 'Emerging Markets', 'Global Diversification'].map((geo) => (
                <button
                key={geo}
                onClick={() => handleGeoToggle(geo)}
                className={`py-1.5 px-3 text-xs rounded-full border transition-all ${
                    profile.geographicFocus.includes(geo)
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
                >
                {geo}
                </button>
            ))}
            </div>
        </div>
      </div>


      <div className="mt-8">
        <button
          onClick={() => onGenerate(profile)}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            isLoading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating Analysis...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Build My Legacy Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;
