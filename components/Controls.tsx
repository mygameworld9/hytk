import React from 'react';
import { ProcessingConfig } from '../types';
import { Sliders, Sun, Moon, Info, Palette, Lock, MessageSquare } from 'lucide-react';

interface ControlsProps {
  config: ProcessingConfig;
  onChange: (newConfig: ProcessingConfig) => void;
  isProcessing: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ config, onChange, isProcessing }) => {
  
  const handleSurfaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, surfaceMin: parseInt(e.target.value) });
  };

  const handleHiddenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, hiddenMax: parseInt(e.target.value) });
  };

  const handleDitheringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, dithering: parseFloat(e.target.value) });
  };

  const handleSteganographyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, steganography: e.target.value });
  };

  const toggleGrayscale = () => {
    onChange({ ...config, grayscale: !config.grayscale });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold">
          <Sliders size={20} className="text-indigo-400" />
          <h3>Factory Settings</h3>
        </div>
        <div className="text-xs text-zinc-500 flex items-center gap-1">
          <Info size={12} />
          <span>A &ge; B Constrained</span>
        </div>
      </div>

      {/* Main Sliders */}
      <div className="space-y-6">
        {/* Surface Image Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sun size={16} className="text-amber-400" />
              Surface Lightness
            </label>
            <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400">
              {config.surfaceMin}
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="250"
            value={config.surfaceMin}
            onChange={handleSurfaceChange}
            disabled={isProcessing}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
          />
        </div>

        {/* Hidden Image Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Moon size={16} className="text-indigo-300" />
              Hidden Darkness
            </label>
            <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400">
              {config.hiddenMax}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            value={config.hiddenMax}
            onChange={handleHiddenChange}
            disabled={isProcessing}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
          />
        </div>
      </div>

      {/* Advanced Toggles */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${!config.grayscale ? 'bg-pink-500/20 text-pink-400' : 'bg-zinc-800 text-zinc-400'}`}>
              <Palette size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-200 group-hover:text-white">Color Mode</div>
              <div className="text-xs text-zinc-500">Processing R, G, B independently</div>
            </div>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={!config.grayscale} onChange={toggleGrayscale} disabled={isProcessing} />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </div>
        </label>

        {/* Dithering Control */}
        <div className="space-y-2">
           <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-zinc-400">Dithering (Anti-Banding)</label>
              <span className="text-xs text-zinc-500">{Math.round(config.dithering * 100)}%</span>
           </div>
           <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.dithering}
            onChange={handleDitheringChange}
            disabled={isProcessing}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500 hover:accent-zinc-300"
          />
        </div>

        {/* Steganography */}
        <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <Lock size={12} />
                <span>Steganography (Secret Message)</span>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={config.steganography}
                    onChange={handleSteganographyChange}
                    placeholder="Enter hidden text..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            </div>
        </div>
      </div>

      {/* Warnings */}
      {config.surfaceMin < config.hiddenMax && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2">
          <Info size={16} className="text-red-400 mt-0.5" />
          <p className="text-xs text-red-300">
            Warning: Surface Lightness &lt; Hidden Darkness. Artifacts will occur.
          </p>
        </div>
      )}
    </div>
  );
};