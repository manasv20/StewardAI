import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import StrategyView from './components/StrategyView';
import { UserProfile, InvestmentPlan } from './types';
import { generateInvestmentStrategy, verifyApiKey } from './services/geminiService';
import ApiKeyModal from './components/ApiKeyModal';
import { Shield, TrendingUp, BarChart3, Lock, ShieldCheck, Sun, Zap, AlertTriangle, KeyRound } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [plan, setPlan] = useState<Partial<InvestmentPlan> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('steward_ai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeySave = (key: string) => {
    localStorage.setItem('steward_ai_api_key', key);
    setApiKey(key);
  };
  
  const handleApiKeyClear = () => {
    localStorage.removeItem('steward_ai_api_key');
    setApiKey(null);
    resetApp();
  };

  const handleGenerate = async (profile: UserProfile) => {
    if (!apiKey) {
        setError("API Key is not set. Please configure your API Key.");
        return;
    }
    setLoading(true);
    setError(null);
    setPlan({}); // Initialize with empty object to show skeleton loaders

    try {
      const finalPlan = await generateInvestmentStrategy(profile, apiKey);
      setPlan(finalPlan);
    } catch (err) {
      let errorMessage = "An unexpected error occurred while generating your analysis.";
      if (err instanceof Error) {
         // Check for a more specific auth error, although upfront validation should prevent this.
        if (err.message.includes('[400 bad request]')) {
            errorMessage = "Your API Key seems to be invalid. Please reset and enter a valid key.";
        } else {
            errorMessage = `An error occurred: ${err.message}`;
        }
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const resetApp = () => {
    setPlan(null);
    setError(null);
    setLoading(false);
  };
  
  if (!apiKey) {
    return <ApiKeyModal onSave={handleApiKeySave} onVerify={verifyApiKey} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 p-1.5 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Steward<span className="text-sky-500">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
             <button onClick={handleApiKeyClear} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-400 transition-colors">
                <KeyRound className="w-3 h-3"/>
                Reset API Key
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Intro Text */}
        {!plan && !loading && (
          <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Build a Durable, Lasting Legacy.
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              True wealth isn't built by chasing market noise. It's forged through discipline, patience, and a commitment to timeless principles. Steward AI is your digital wealth advisor, crafting a personalized strategy designed to compound intelligently for generations.
            </p>
            
            {/* Analysis Pillars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-sky-400 text-sm mb-1 flex items-center gap-1.5"><TrendingUp className="w-3 h-3"/>Compounding</h3>
                <p className="text-xs text-slate-400">Harnessing the most powerful force in finance.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-sky-400 text-sm mb-1 flex items-center gap-1.5"><Zap className="w-3 h-3"/>Tax Efficiency</h3>
                <p className="text-xs text-slate-400">Keeping more of what you earn is paramount.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-sky-400 text-sm mb-1 flex items-center gap-1.5"><BarChart3 className="w-3 h-3"/>Low-Cost</h3>
                <p className="text-xs text-slate-400">Minimizing fees to maximize your returns over time.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-sky-400 text-sm mb-1 flex items-center gap-1.5"><Sun className="w-3 h-3"/>Long-Term View</h3>
                <p className="text-xs text-slate-400">Focusing on decades, not days, for true growth.</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Stop Reacting. Start Building.</h3>
            <p className="text-slate-400 mb-6">Our platform provides the clarity and discipline needed to tune out the short-term noise and focus on what truly matters: the steady, patient accumulation of wealth.</p>
            
             <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Zero Data Storage: Your financial data never leaves this browser session.</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && plan && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Core Interface */}
        <div className="flex flex-col gap-12">
          
          <div className={`${(plan || loading) ? 'hidden' : 'block'} max-w-3xl mx-auto w-full`}>
            <InputForm onGenerate={handleGenerate} isLoading={loading} />
          </div>

          {/* If plan exists or is loading, show dashboard area */}
          {(plan || loading) && (
            <>
              <div className="flex justify-between items-center animate-in fade-in">
                 <h2 className="text-2xl font-bold text-white">Your Legacy Wealth Plan</h2>
                 <button 
                  onClick={resetApp}
                  className="text-sm text-slate-400 hover:text-white underline underline-offset-4"
                 >
                   Start Over
                 </button>
              </div>
              <StrategyView 
                plan={plan || {}} 
                isLoading={loading && Object.keys(plan).length === 0}
                apiKey={apiKey}
              />
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 mt-20 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p className="mb-2">&copy; {new Date().getFullYear()} Steward AI. Powered by Google Gemini.</p>
          <p className="max-w-lg mx-auto text-xs text-slate-700 leading-relaxed">
            <strong>PRIVACY NOTICE:</strong> This application runs entirely in your browser. 
            We do not store your financial data, portfolio, or personal information in any database. 
            Data is transiently processed by the AI and lost upon page refresh.
            <br/><br/>
            DISCLAIMER: This application is for informational and educational purposes only and does not constitute financial advice. 
            Steward AI generates suggestions based on artificial intelligence models and available market data. 
            Always consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
