import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api';
import { Budget, AIInsight } from '../../types';
import { formatCroreLakh } from '../../utils/formatters';
import { exportAdvisoryInsightPDF } from '../../utils/pdfForecastExport';
import { AIBudgetForecastCard } from './AIBudgetForecastCard';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Image as ImageIcon,
  Video,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Info,
  TrendingUp,
  Printer,
  FileDown
} from 'lucide-react';

interface AIInsightsViewProps {
  initialBudgetId?: string;
  initialAnomalyType?: string;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  initialBudgetId,
  initialAnomalyType
}) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'insight' | 'image' | 'video'>('forecast');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>(initialBudgetId || '');
  const [selectedAnomalyType, setSelectedAnomalyType] = useState<string>(
    initialAnomalyType || 'UNDER_UTILIZATION'
  );

  // Financial Insight State
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState('');

  // Image Generation State (gemini-3-pro-image-preview with 1K, 2K, 4K)
  const [imagePrompt, setImagePrompt] = useState(
    'Official government high-impact infrastructure poster for rural solar micro-irrigation project in Indian agricultural district, photorealistic daylight documentary photography, high resolution'
  );
  const [imageResolution, setImageResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');

  // Video Generation State (veo-3.1-fast-generate-preview with 16:9 or 9:16)
  const [videoPrompt, setVideoPrompt] = useState(
    'Drone flyover cinematic documentary of newly commissioned rural water pipeline and community taps with clear clean water flowing, sunny afternoon'
  );
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoSourceFileName, setVideoSourceFileName] = useState<string>('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState<{ operationName: string; model: string } | null>(null);
  const [videoError, setVideoError] = useState('');
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getBudgets().then((res) => {
      if (res.success && res.budgets.length > 0) {
        setBudgets(res.budgets);
        if (!selectedBudgetId) {
          setSelectedBudgetId(res.budgets[0]._id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (initialBudgetId) {
      setSelectedBudgetId(initialBudgetId);
    }
    if (initialAnomalyType) {
      setSelectedAnomalyType(initialAnomalyType);
    }
  }, [initialBudgetId, initialAnomalyType]);

  const handleGenerateInsight = async () => {
    try {
      setIsLoadingInsight(true);
      setInsightError('');
      const res = await api.getAIInsights(selectedBudgetId || undefined, selectedAnomalyType);
      if (res.success) {
        setInsight(res.insight);
      }
    } catch (err: any) {
      setInsightError(err.message || 'Failed to generate financial intelligence.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleGenerateImage = async () => {
    try {
      setIsGeneratingImage(true);
      setImageError('');
      const res = await api.generateImage(imagePrompt, imageResolution);
      if (res.success && res.imageUrl) {
        setGeneratedImageUrl(res.imageUrl);
      }
    } catch (err: any) {
      setImageError(err.message || 'Failed to generate visual asset.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setVideoError('Please upload an image file (PNG, JPEG, WebP) to animate.');
        return;
      }
      setVideoSourceFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setVideoSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoSourceImage) {
      setVideoError('Please upload or select an initial photo to animate.');
      return;
    }
    try {
      setIsGeneratingVideo(true);
      setVideoError('');
      const res = await api.generateVideo(videoSourceImage, videoPrompt, videoAspectRatio);
      if (res.success) {
        setVideoResult(res);
      }
    } catch (err: any) {
      setVideoError(err.message || 'Failed to initiate video generation.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const selectedBudgetObj = budgets.find((b) => b._id === selectedBudgetId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>✨</span> Gemini 3 Multimodal Governance &amp; Media Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Executive Financial Advisory, High-Resolution Citizen Assets, and Veo Video Production
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'forecast'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> AI Budget Forecast &amp; PDF Export
          </button>
          <button
            onClick={() => setActiveTab('insight')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'insight'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" /> Financial Advisory
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'image'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Scheme Image Studio
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'video'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Veo Video Studio
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 0: AI BUDGET FORECAST & STATUTORY PDF EXPORT
          ========================================================================= */}
      {activeTab === 'forecast' && (
        <AIBudgetForecastCard
          budgets={budgets}
          selectedBudgetId={selectedBudgetId}
          onSelectBudgetId={setSelectedBudgetId}
        />
      )}

      {/* =========================================================================
          TAB 1: FINANCIAL ADVISORY & RISK AUDIT
          ========================================================================= */}
      {activeTab === 'insight' && (
        <div className="space-y-6">
          {/* Scheme Selection Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" /> Select Scheme for AI Scrutiny
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Model: gemini-3.8-flash</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Target Budget Scheme</label>
                <select
                  value={selectedBudgetId}
                  onChange={(e) => setSelectedBudgetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {budgets.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.scheme} ({b.department?.code}) &bull; Rem: {formatCroreLakh(b.remainingAmount || 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Anomaly Type Context</label>
                <select
                  value={selectedAnomalyType}
                  onChange={(e) => setSelectedAnomalyType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="UNDER_UTILIZATION">Under-Utilization Bottleneck</option>
                  <option value="OVERSPENDING">Overspending / Ceiling Breach</option>
                  <option value="SPENDING_SPIKE">Sudden Spending Spike</option>
                  <option value="THRESHOLD_DEVIATION">Threshold Warning Tier</option>
                </select>
              </div>
            </div>

            {selectedBudgetObj && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Department:</span>{' '}
                  <span className="text-white font-semibold">{selectedBudgetObj.department?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Allocation:</span>{' '}
                  <span className="text-white font-mono font-semibold">
                    {formatCroreLakh(selectedBudgetObj.allocatedAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Disbursed:</span>{' '}
                  <span className="text-indigo-300 font-mono font-semibold">
                    {formatCroreLakh(selectedBudgetObj.totalSpent || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Utilization:</span>{' '}
                  <span className="text-amber-400 font-mono font-bold">
                    {selectedBudgetObj.utilizationPercentage || 0}%
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateInsight}
              disabled={isLoadingInsight}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
            >
              <Sparkles className={`w-4 h-4 ${isLoadingInsight ? 'animate-spin' : ''}`} />
              {isLoadingInsight ? 'Analyzing Financial Data...' : 'Generate AI Risk Scrutiny'}
            </button>
          </div>

          {insightError && (
            <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300">
              {insightError}
            </div>
          )}

          {/* AI Output Card */}
          {insight && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Executive Financial Advisory Report
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Generated by {insight.modelUsed} &bull; Institutional Scrutiny
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportAdvisoryInsightPDF(insight, selectedBudgetObj)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
                    title="Export this AI Advisory Scrutiny to official PDF file"
                  >
                    <Printer className="w-3.5 h-3.5" /> Export Advisory PDF
                  </button>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      insight.priority === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : insight.priority === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-blue-950 text-blue-300 border-blue-800'
                    }`}
                  >
                    Priority: {insight.priority}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Executive Summary
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {insight.executiveSummary}
                </p>
              </div>

              {/* Risk Summary & Root Cause */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Financial Risk Assessment
                  </div>
                  <p className="text-slate-300 leading-relaxed">{insight.riskSummary}</p>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[11px] tracking-wider">
                    <Info className="w-4 h-4" /> Probable Institutional Cause
                  </div>
                  <p className="text-slate-300 leading-relaxed">{insight.possibleExplanation}</p>
                </div>
              </div>

              {/* Recommended Action Plan */}
              <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px] tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Recommended Administrative Action
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{insight.recommendedAction}</p>
              </div>

              {/* Mandatory Disclaimer */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>{insight.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: IMAGE GENERATION (gemini-3-pro-image-preview with 1K, 2K, 4K)
          ========================================================================= */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-400" /> Scheme Publicity &amp; Awareness
                  Visuals
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Powered by <code className="text-indigo-300">gemini-3-pro-image-preview</code> &bull;
                  Official campaign graphics &amp; site documentation
                </p>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Visual Concept Prompt
              </label>
              <textarea
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Describe official scheme poster, community health camp, or rural road construction..."
              />
            </div>

            {/* Resolution Selector: Requirement 1K, 2K, 4K */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Resolution Output
              </label>
              <div className="flex items-center gap-3">
                {(['1K', '2K', '4K'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setImageResolution(res)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      imageResolution === res
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {res} {res === '1K' ? '(Standard HD)' : res === '2K' ? '(QHD Print)' : '(Ultra HD)'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              {isGeneratingImage
                ? `Synthesizing ${imageResolution} Asset with Gemini...`
                : `Generate ${imageResolution} Scheme Visual`}
            </button>
          </div>

          {imageError && (
            <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300">
              {imageError}
            </div>
          )}

          {/* Generated Image Preview Card */}
          {generatedImageUrl && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Generated Scheme Asset</h4>
                  <p className="text-[11px] text-slate-400">
                    Resolution: {imageResolution} &bull; Model: gemini-3-pro-image-preview
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVideoSourceImage(generatedImageUrl);
                      setVideoSourceFileName(`scheme-generated-${imageResolution}.png`);
                      setActiveTab('video');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600 text-purple-200 text-xs font-medium transition"
                  >
                    <Video className="w-3.5 h-3.5" /> Animate into Veo Video &rarr;
                  </button>
                  <a
                    href={generatedImageUrl}
                    download={`govbudget-scheme-${imageResolution}.png`}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Download High-Res PNG"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-[500px] flex items-center justify-center bg-black">
                <img
                  src={generatedImageUrl}
                  alt="Generated Gov Scheme Visual"
                  className="w-full h-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: VIDEO GENERATION (veo-3.1-fast-generate-preview with 16:9 or 9:16)
          ========================================================================= */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" /> Veo Scheme Progress Video Production
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Powered by <code className="text-purple-300">veo-3.1-fast-generate-preview</code> &bull;
                  Animate progress photo into dynamic video documentary
                </p>
              </div>
            </div>

            {/* Photo Upload or Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Source Project Photo (Required)
              </label>
              <div
                onClick={() => videoFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 bg-slate-950/80 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
              >
                <input
                  type="file"
                  ref={videoFileInputRef}
                  onChange={handleVideoFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                {videoSourceImage ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={videoSourceImage}
                      alt="Source for video"
                      className="w-16 h-16 object-cover rounded-lg border border-purple-500/40"
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white truncate max-w-xs">
                        {videoSourceFileName || 'Selected Project Image'}
                      </p>
                      <p className="text-[10px] text-purple-300">
                        Ready for Veo animation &bull; Click to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-purple-400" />
                    <p className="text-xs text-slate-300">
                      Click to upload scheme project site photo
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Or generate an image first in Tab 2 and click &quot;Animate into Veo Video&quot;
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Video Motion Prompt */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Motion &amp; Cinematic Direction Prompt
              </label>
              <input
                type="text"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Camera movements, lighting evolution, crowd motion..."
              />
            </div>

            {/* Aspect Ratio Selector: Requirement 16:9 or 9:16 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Video Aspect Ratio
              </label>
              <div className="flex items-center gap-3 max-w-md">
                {(['16:9', '9:16'] as const).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setVideoAspectRatio(ar)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      videoAspectRatio === ar
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {ar} {ar === '16:9' ? '(Landscape / Portal)' : '(Portrait / Mobile Citizen App)'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !videoSourceImage}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
            >
              <Video className={`w-4 h-4 ${isGeneratingVideo ? 'animate-spin' : ''}`} />
              {isGeneratingVideo
                ? `Initiating Veo Animation (${videoAspectRatio})...`
                : `Generate Veo Video (${videoAspectRatio})`}
            </button>
          </div>

          {videoError && (
            <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300">
              {videoError}
            </div>
          )}

          {/* Video Result Card */}
          {videoResult && (
            <div className="bg-slate-900 border border-purple-800/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Veo Video Generation Dispatched</h4>
                  <p className="text-xs text-purple-300 font-mono">
                    Model: {videoResult.model} &bull; Aspect Ratio: {videoAspectRatio}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2 text-slate-300">
                <p>
                  <span className="font-semibold text-slate-200">Operation Identifier:</span>{' '}
                  <code className="text-purple-300 font-mono text-[11px]">
                    {videoResult.operationName}
                  </code>
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Veo video synthesis executes asynchronously in Google Cloud. When processing completes,
                  the animated MP4 stream is archived directly to the scheme public audit portal.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
