import React, { useState } from 'react';
import { Download, Loader2, Maximize2, Check } from 'lucide-react';

interface PreviewProps {
  resultUrl: string | null;
  isProcessing: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ resultUrl, isProcessing }) => {
  const [bgMode, setBgMode] = useState<'white' | 'black' | 'chat'>('chat');

  const downloadImage = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `mirage-tank-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!resultUrl && !isProcessing) {
    return (
      <div className="w-full h-full min-h-[400px] bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600">
        <Maximize2 size={48} className="mb-4 opacity-50" />
        <p>Preview will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setBgMode('white')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${bgMode === 'white' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Light
          </button>
          <button 
            onClick={() => setBgMode('black')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${bgMode === 'black' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Dark
          </button>
          <button 
            onClick={() => setBgMode('chat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${bgMode === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Simulate
          </button>
        </div>
        
        <button 
          onClick={downloadImage}
          disabled={!resultUrl || isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export PNG
        </button>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 w-full min-h-[400px] overflow-hidden flex items-center justify-center bg-zinc-950">
        
        {/* Background Layers */}
        <div className={`absolute inset-0 transition-colors duration-300 ${
          bgMode === 'white' ? 'bg-white' : 
          bgMode === 'black' ? 'bg-black' : 
          'bg-[#ededed]' // Chat background gray
        }`} />

        {/* Checkerboard for transparency indication (underneath everything) */}
        {bgMode === 'chat' && (
             <div className="absolute inset-0 opacity-10" 
             style={{ 
                 backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
             }}></div>
        )}

        {/* The Result Image */}
        <div className={`relative z-10 p-8 max-w-full max-h-full flex items-center justify-center transition-all duration-500 ${isProcessing ? 'blur-sm scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
          
          {/* Simulation Container for Chat Mode */}
          {bgMode === 'chat' ? (
             <div className="bg-white rounded-lg p-2 shadow-sm max-w-md w-full">
                <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded bg-zinc-200 flex-shrink-0"></div>
                   <div className="flex flex-col gap-1 max-w-full">
                      <div className="text-xs text-zinc-400 font-medium">User</div>
                      {/* This is the bubble */}
                      <div className="bg-white border border-zinc-200 rounded-tr-xl rounded-bl-xl rounded-br-xl overflow-hidden">
                        {resultUrl && (
                            <img src={resultUrl} alt="Mirage" className="max-w-full h-auto object-contain block" />
                        )}
                      </div>
                   </div>
                </div>
                <div className="h-4"></div>
                {/* Dark mode bubble simulation */}
                <div className="flex items-start gap-3 flex-row-reverse bg-[#111] p-4 rounded-xl -mx-2 mt-2">
                   <div className="w-10 h-10 rounded bg-zinc-800 flex-shrink-0"></div>
                   <div className="flex flex-col items-end gap-1 max-w-full w-full">
                      <div className="text-xs text-zinc-600 font-medium">Dark Mode User</div>
                      <div className="bg-black border border-zinc-800 rounded-tl-xl rounded-bl-xl rounded-br-xl overflow-hidden">
                        {resultUrl && (
                            <img src={resultUrl} alt="Mirage" className="max-w-full h-auto object-contain block" />
                        )}
                      </div>
                   </div>
                </div>
             </div>
          ) : (
            resultUrl && <img src={resultUrl} alt="Mirage" className="max-w-full max-h-[60vh] object-contain shadow-2xl" />
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
                <Loader2 className="animate-spin text-indigo-400" />
                <span className="font-medium">Processing pixels...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};