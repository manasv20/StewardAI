import React, { useState, useRef } from 'react';
import { InvestmentPlan } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ExternalLink, TrendingUp, ShieldCheck, DollarSign, Activity, Globe, Scale, FileText, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, Crosshair, AlertOctagon, Zap, Building2, Wallet, MessageSquarePlus, Info, ChevronDown, BarChartHorizontal, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AgentChat, { AgentChatRef } from './AgentChat';

interface Props {
  plan: Partial<InvestmentPlan>;
  isLoading: boolean;
  apiKey: string; // Add apiKey prop
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const SkeletonLoader: React.FC<{className?: string}> = ({ className = 'h-32' }) => (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 mb-2 font-bold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StrategyView: React.FC<Props> = ({ plan, isLoading, apiKey }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'rebalance'>('overview');
  const [expandedHolding, setExpandedHolding] = useState<string | null>(null);
  const chatRef = useRef<AgentChatRef>(null);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const triggerAgent = (msg: string) => {
      chatRef.current?.triggerChat(msg);
  };
  
  const getSentimentColor = (score: string) => {
    switch(score) {
        case 'Very Bullish':
        case 'Bullish':
            return 'text-emerald-400';
        case 'Very Bearish':
        case 'Bearish':
            return 'text-red-400';
        default:
            return 'text-amber-400';
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl h-28"></div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl h-28"></div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl h-28"></div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl h-64"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl h-[400px]"></div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl h-64"></div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl h-64"></div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl h-48"></div>
                </div>
            </div>
        </div>
    );
  }
  
  const HoldingsAndMultiFactor = () => (
     <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800"><h3 className="text-lg font-bold text-white">Holdings & Multi-Factor Analysis</h3></div>
        <div className="divide-y divide-slate-800">
            {plan.allocations?.map((item, idx) => {
                const isExpanded = expandedHolding === item.ticker;
                return (
                  <div key={idx} className="group relative">
                      <div className="p-4 hover:bg-slate-800/50 transition-colors" >
                          <div className="flex justify-between items-start" >
                              <div className="flex-1 pr-4">
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-white">{item.ticker}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${item.accountType === 'Roth IRA' ? 'border-emerald-500/30 text-emerald-500' : 'border-blue-500/30 text-blue-500'}`}>{item.accountType === 'Roth IRA' ? 'ROTH' : 'BROKERAGE'}</span>
                                  </div>
                                  <p className="text-xs text-slate-400">{item.name}</p>
                              </div>
                              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedHolding(isExpanded ? null : item.ticker)}>
                                  <div className="text-right">
                                      <span className="block font-bold text-sky-400">{item.percentage}%</span>
                                      {item.dividendYield != null && (<span className="text-xs text-slate-500">Yield: {item.dividendYield}%</span>)}
                                  </div>
                                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                          </div>
                      </div>

                      {isExpanded && (
                          <div className="bg-slate-850/50 p-4 pt-4 border-t border-slate-700/50 animate-in fade-in space-y-4">
                              <p className="text-sm text-slate-300 leading-relaxed">{item.rationale}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Technical Analysis */}
                                  <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg">
                                      <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                          <BarChartHorizontal className="w-4 h-4 text-blue-400" /> Technicals
                                      </h4>
                                      <p className="text-xs text-slate-400 mb-3">{item.technicalAnalysis.summary}</p>
                                      <div className="text-xs space-y-1 font-mono">
                                          <div className="flex justify-between items-center"><span className="text-slate-500">Support</span> <span className="text-emerald-400">{item.technicalAnalysis.support}</span></div>
                                          <div className="flex justify-between items-center"><span className="text-slate-500">Resistance</span> <span className="text-red-400">{item.technicalAnalysis.resistance}</span></div>
                                          <div className="flex justify-between items-center"><span className="text-slate-500">Indicator</span> <span className="text-purple-400">{item.technicalAnalysis.indicatorSignal}</span></div>
                                      </div>
                                  </div>
                                  {/* Market Sentiment */}
                                  <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg">
                                      <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                          <Users className="w-4 h-4 text-amber-400" /> Sentiment
                                      </h4>
                                      <p className="text-xs text-slate-400 mb-3">{item.marketSentiment.summary}</p>
                                      <div className="text-xs space-y-1">
                                          <div className="flex justify-between items-center"><span className="text-slate-500">Sentiment</span> <span className={`font-bold ${getSentimentColor(item.marketSentiment.score)}`}>{item.marketSentiment.score}</span></div>
                                          <div className="flex justify-between items-center"><span className="text-slate-500">Analyst Rating</span> <span className="text-white font-semibold">{item.marketSentiment.analystRating}</span></div>
                                      </div>
                                  </div>
                              </div>
                              <button onClick={() => triggerAgent(`Provide a deeper, data-driven perspective on ${item.ticker} (${item.name}). What are the key performance indicators to watch?`)} className="w-full mt-2 text-xs text-center text-slate-500 hover:text-sky-400 flex items-center justify-center gap-1 p-2 rounded-lg hover:bg-slate-800/50 transition-colors" title={`Ask The Steward about ${item.ticker}`}>
                                  <MessageSquarePlus className="w-3 h-3" /> Ask The Steward for more insight on {item.ticker}
                              </button>
                          </div>
                      )}
                  </div>
                )
            })}
        </div>
      </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16 text-sky-400" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium">Projected Value (30y)</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {plan.projections && plan.projections.length > 0 ? formatCurrency(plan.projections[plan.projections.length-1].expected) : <span className="text-slate-600">...</span>}
          </p>
          <span className="text-xs text-sky-500">Expected Growth (7% avg)</span>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-blue-400" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium">Purchasing Power</h3>
          </div>
          <p className="text-2xl font-bold text-white">
             {plan.projections && plan.projections.length > 0 ? formatCurrency(plan.projections[plan.projections.length-1].inflationAdjusted) : <span className="text-slate-600">...</span>}
          </p>
          <span className="text-xs text-blue-500">Real Value (Inf. Adj.)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-16 h-16 text-purple-400" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium">Portfolio Health Score</h3>
          </div>
          <p className="text-2xl font-bold text-white">
             {plan.portfolioAnalysis ? `${plan.portfolioAnalysis.currentScore}/100` : <span className="text-slate-600">...</span>}
          </p>
          <span className={`text-xs ${plan.portfolioAnalysis && plan.portfolioAnalysis.currentScore > 75 ? 'text-emerald-500' : 'text-orange-500'}`}>
             {plan.portfolioAnalysis ? 'Health Check' : 'Add holdings to analyze'}
          </span>
        </div>
      </div>

      {/* Executive Summary (Full Width) */}
       {plan.summary ? (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-400" />
                    Executive Summary
                </h2>
                <div className="prose prose-invert prose-sky max-w-none text-slate-300 text-sm leading-relaxed">
                    <ReactMarkdown>{plan.summary}</ReactMarkdown>
                </div>
                {plan.sources && plan.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Data Sources</h4>
                    <div className="flex flex-wrap gap-2">
                    {plan.sources.map((src, idx) => (
                        <a key={idx} href={src.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-blue-400 hover:text-blue-300 hover:border-blue-900 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        {src.title}
                        </a>
                    ))}
                    </div>
                </div>
                )}
            </div>
        ) : <SkeletonLoader className="h-64"/>}


       {/* Tabs */}
       <div className="flex gap-4 border-b border-slate-800 overflow-x-auto sticky top-16 bg-slate-950/80 backdrop-blur-md z-10 py-2 -mx-4 px-4">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}
        >
          Strategy & Allocation
        </button>
        <button 
          onClick={() => setActiveTab('market')}
          className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'market' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          <Globe className="w-4 h-4" />
          Market Intelligence
        </button>
         {plan.portfolioAnalysis && (
            <button 
            onClick={() => setActiveTab('rebalance')}
            className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'rebalance' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}
            >
            <Wallet className="w-4 h-4" />
            Portfolio Analysis
            </button>
         )}
      </div>

      {/* Main Dashboard Layout */}
      <div className="mt-8">
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in">
            {/* Primary Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-[400px]">
                    <h3 className="text-lg font-bold text-white mb-6">Legacy Wealth Projection</h3>
                    {plan.projections && plan.projections.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={plan.projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                  <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                                  <linearGradient id="colorInf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickMargin={10} />
                              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="expected" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorExpected)" name="Expected Growth" strokeWidth={2}/>
                              <Area type="monotone" dataKey="inflationAdjusted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInf)" name="Real Value (Inf. Adj.)" strokeWidth={2}/>
                              <Area type="monotone" dataKey="totalContributions" stroke="#64748b" fill="transparent" strokeDasharray="5 5" name="Total Principal"/>
                          </AreaChart>
                      </ResponsiveContainer>
                    ) : <SkeletonLoader className="h-full" /> }
              </div>
              
              <HoldingsAndMultiFactor />

            </div>
            {/* Secondary Column */}
            <div className="lg:col-span-1 space-y-8">
                {plan.allocations && (
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Target Allocation</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={plan.allocations} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="percentage">
                                    {plan.allocations.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} itemStyle={{ color: '#f1f5f9' }}/>
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                  </div>
                )}
                 {plan.actionableSteps && plan.actionableSteps.length > 0 && (
                    <div className="bg-gradient-to-r from-sky-900/20 to-slate-900 border border-sky-500/30 p-6 rounded-xl relative group">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-sky-400" />
                            Your Next Steps
                        </h3>
                        <div className="space-y-3">
                            {plan.actionableSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="mt-1 min-w-[20px] h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-xs font-bold text-sky-400 border border-sky-500/30">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-200 text-sm leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
                  {plan.swot && (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Crosshair className="w-5 h-5 text-blue-400" />
                            SWOT Analysis
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-lg">
                                <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Strengths</h4>
                                <ul className="space-y-2">
                                    {plan.swot.strengths?.map((item, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> {item}</li>) || <li className="text-xs text-slate-500">...</li>}
                                </ul>
                            </div>
                            <div className="bg-orange-900/10 border border-orange-900/30 p-4 rounded-lg">
                                <h4 className="text-orange-400 font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> Weaknesses</h4>
                                <ul className="space-y-2">
                                    {plan.swot.weaknesses?.map((item, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-orange-500 mt-0.5">•</span> {item}</li>) || <li className="text-xs text-slate-500">...</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                 {plan && Object.keys(plan).length > 2 && <AgentChat plan={plan as InvestmentPlan} apiKey={apiKey} ref={chatRef} />}
            </div>
          </div>
        ) : activeTab === 'market' ? (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl group relative">
                <button onClick={() => triggerAgent("Explain the current Global Macro Outlook from a quantitative perspective.")} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-sky-500/20 text-slate-500 hover:text-sky-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><MessageSquarePlus className="w-4 h-4" /></button>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> Global Macro</h3>
                <p className="text-white text-sm leading-relaxed border-l-2 border-slate-700 pl-4">{plan.marketAnalysis?.macroOutlook || 'Analysis pending...'}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl group relative">
                <button onClick={() => triggerAgent("How should inflation forecasts affect my tactical allocation?")} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-sky-500/20 text-slate-500 hover:text-sky-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><MessageSquarePlus className="w-4 h-4" /></button>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Inflation Forecast</h3>
                <p className="text-white text-sm leading-relaxed border-l-2 border-slate-700 pl-4">{plan.marketAnalysis?.inflationForecast || 'Analysis pending...'}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl group relative">
                <button onClick={() => triggerAgent("What is the data saying about future interest rates?")} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-sky-500/20 text-slate-500 hover:text-sky-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><MessageSquarePlus className="w-4 h-4" /></button>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" /> Interest Rates</h3>
                <p className="text-white text-sm leading-relaxed border-l-2 border-slate-700 pl-4">{plan.marketAnalysis?.interestRateView || 'Analysis pending...'}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center gap-2"><Scale className="w-5 h-5 text-sky-400" /><h3 className="text-lg font-bold text-white">Sector & Thematic Views</h3></div>
                    <div className="p-5 space-y-4">
                        {plan.sectorTrends?.map((trend, i) => (
                            <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800 group relative">
                                <button onClick={() => triggerAgent(`What is the investment thesis for the ${trend.sector} sector?`)} className="absolute -top-2 -right-2 p-1.5 bg-slate-800 border border-slate-700 shadow-lg text-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"><MessageSquarePlus className="w-3 h-3" /></button>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white">{trend.sector}</span>
                                        {trend.trend === 'accumulate' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold tracking-wide">OVERWEIGHT</span>}
                                        {trend.trend === 'reduce' && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 font-bold tracking-wide">UNDERWEIGHT</span>}
                                        {trend.trend === 'hold' && <span className="text-[10px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full border border-slate-500/30 font-bold tracking-wide">NEUTRAL</span>}
                                    </div>
                                    <p className="text-xs text-slate-400">{trend.reasoning}</p>
                                </div>
                                <div className="text-right min-w-[60px]">
                                    {trend.performance > 0 ? <span className="flex items-center justify-end text-emerald-400 text-sm font-bold gap-1"><ArrowUpRight className="w-3 h-3" />{trend.performance}%</span> : trend.performance < 0 ? <span className="flex items-center justify-end text-red-400 text-sm font-bold gap-1"><ArrowDownRight className="w-3 h-3" />{Math.abs(trend.performance)}%</span> : <span className="flex items-center justify-end text-slate-400 text-sm font-bold gap-1"><Minus className="w-3 h-3" />0%</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /><h3 className="text-lg font-bold text-white">Filings & Risk Analysis</h3></div>
                    <div className="p-5 space-y-4">
                        {plan.secEvents?.map((event, i) => (
                            <div key={i} className="group relative pl-4 border-l-2 border-slate-700 hover:border-blue-500 transition-colors">
                                <button onClick={() => triggerAgent(`Tell me more about the SEC filing for ${event.ticker}. What are the key risks for an investor?`)} className="absolute top-0 right-0 p-1.5 text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"><MessageSquarePlus className="w-3 h-3" /></button>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2"><span className="font-bold text-white text-sm">{event.ticker}</span><span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{event.type}</span></div>
                                    <span className="text-xs text-slate-600">{event.date}</span>
                                </div>
                                <p className="text-xs text-slate-400 mb-2 leading-relaxed">{event.summary}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Sentiment:</span>
                                    {event.sentiment === 'positive' && <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>}
                                    {event.sentiment === 'negative' && <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>}
                                    {event.sentiment === 'neutral' && <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>}
                                    <span className="text-[10px] text-slate-400 capitalize">{event.sentiment}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             {plan.portfolioAnalysis && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-purple-400" />Portfolio Health Check</h3>
                            <p className="text-slate-400 text-sm mt-1">Deep dive into your uploaded portfolio vs. optimal allocation.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">{plan.portfolioAnalysis?.currentScore || 0}/100</div>
                            <div className="text-xs text-slate-500">Portfolio Health Score</div>
                        </div>
                    </div>
                    <div className="bg-slate-950/50 rounded-lg p-5 border border-slate-800 mb-8 relative group">
                        <button onClick={() => triggerAgent("Explain my portfolio health score in detail. Why is it not 100?")} className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-500 hover:text-purple-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><MessageSquarePlus className="w-4 h-4" /></button>
                        <p className="text-slate-300 text-sm leading-relaxed">{plan.portfolioAnalysis?.analysis || "Upload a portfolio to see analysis."}</p>
                    </div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Tactical Rebalancing Orders</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {plan.portfolioAnalysis?.rebalancingOrders.map((order, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-800 rounded-lg group hover:border-slate-600 transition-colors relative">
                                <button onClick={() => triggerAgent(`What is the rationale for the recommendation to ${order.action} ${order.ticker}?`)} className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all"><MessageSquarePlus className="w-3 h-3" /></button>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm border ${order.action === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : order.action === 'SELL' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>{order.action}</div>
                                    <div>
                                        <div className="flex items-center gap-2"><span className="text-white font-bold">{order.ticker}</span><span className="text-slate-400 text-sm">Amount: <span className="text-white">{order.amount}</span></span></div>
                                        <p className="text-xs text-slate-500 mt-1">{order.reason}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block"><button className="text-xs bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">Review</button></div>
                            </div>
                        ))}
                    </div>
                </div>
             )}
        </div>
        )}
      </div>
      
    </div>
  );
};

export default StrategyView;
