import React, { useState } from 'react';
import { KeyRound, Shield, ExternalLink, Loader2 } from 'lucide-react';

interface Props {
  onSave: (apiKey: string) => void;
  onVerify: (apiKey: string) => Promise<boolean>;
}

const ApiKeyModal: React.FC<Props> = ({ onSave, onVerify }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!key.trim()) {
        setError("API Key cannot be empty.");
        return;
    };
    
    setError(null);
    setIsLoading(true);

    const isValid = await onVerify(key.trim());

    if (isValid) {
        onSave(key.trim());
        // The modal will be unmounted by the parent component, so no need to setIsLoading(false)
    } else {
        setError("Invalid API Key. Please check the key and try again.");
        setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 m-4 text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-sky-500/10 p-4 rounded-full border-2 border-sky-500/20">
                <KeyRound className="w-8 h-8 text-sky-400" />
            </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Steward AI</h2>
        <p className="text-slate-400 mb-6">
          To begin, please enter your Google AI API key. Your key is stored securely in your browser and is never shared.
        </p>

        <div className="space-y-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter your Google AI API key"
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-3 focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-600 text-center"
            disabled={isLoading}
          />
           {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleSave}
            disabled={!key.trim() || isLoading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Key...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-500">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 hover:text-sky-400 transition-colors">
                Get your API key from Google AI Studio
                <ExternalLink className="w-3 h-3" />
            </a>
            <div className="flex items-center justify-center gap-2 mt-4">
                <Shield className="w-3 h-3 text-slate-600" />
                <span>Your key is stored only on this device.</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
