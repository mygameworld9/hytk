import React, { useEffect, useState, useCallback } from 'react';
import { Layers, Github, Sparkles } from 'lucide-react';
import { Uploader } from './components/Uploader';
import { Controls } from './components/Controls';
import { Preview } from './components/Preview';
import { ProcessingConfig, ImageSlot } from './types';
import { loadImage, generateMirageTank } from './services/imageProcessor';

const INITIAL_CONFIG: ProcessingConfig = {
  surfaceMin: 160, // Maps Surface to [160, 255]
  hiddenMax: 100,  // Maps Hidden to [0, 100]
  grayscale: true,
  dithering: 0.2, // 20% default dithering for smoother gradients
  steganography: "",
};

function App() {
  const [config, setConfig] = useState<ProcessingConfig>(INITIAL_CONFIG);
  const [surfaceFile, setSurfaceFile] = useState<File | null>(null);
  const [hiddenFile, setHiddenFile] = useState<File | null>(null);
  
  // Object URLs for previewing inputs
  const [surfacePreview, setSurfacePreview] = useState<string | null>(null);
  const [hiddenPreview, setHiddenPreview] = useState<string | null>(null);
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle Input Changes
  const handleImageSelect = (slot: ImageSlot, file: File) => {
    const url = URL.createObjectURL(file);
    if (slot === 'surface') {
      setSurfaceFile(file);
      setSurfacePreview(url);
    } else {
      setHiddenFile(file);
      setHiddenPreview(url);
    }
  };

  const handleClear = (slot: ImageSlot) => {
    if (slot === 'surface') {
      setSurfaceFile(null);
      setSurfacePreview(null);
    } else {
      setHiddenFile(null);
      setHiddenPreview(null);
    }
    setResultUrl(null);
  };

  // Debounced Processing Effect
  useEffect(() => {
    if (!surfaceFile || !hiddenFile) return;

    let active = true;
    const process = async () => {
      setIsProcessing(true);
      try {
        const [imgA, imgB] = await Promise.all([
          loadImage(surfaceFile),
          loadImage(hiddenFile)
        ]);

        if (!active) return;

        // Small delay to allow UI to render the loading state before heavy calculation
        await new Promise(r => setTimeout(r, 50));

        const result = await generateMirageTank(imgA, imgB, config);
        
        if (active) {
          setResultUrl(result);
        }
      } catch (err) {
        console.error("Processing failed", err);
      } finally {
        if (active) setIsProcessing(false);
      }
    };

    const timeoutId = setTimeout(process, 400); // Increased debounce slightly for heavier processing
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [surfaceFile, hiddenFile, config]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Mirage Tank Factory</h1>
              <p className="text-xs text-zinc-500 font-medium">Quantum Image Compositor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="hidden md:flex items-center gap-2 text-xs text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full">
                <Sparkles size={12} className="text-indigo-400"/>
                <span>Alpha Channel Magic</span>
             </span>
             <a href="#" className="text-zinc-500 hover:text-white transition-colors">
               <Github size={20} />
             </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs & Controls */}
        <div className="lg:col-span-5 space-y-8 flex flex-col h-full">
          
          {/* Upload Section */}
          <div className="grid grid-cols-2 gap-4 h-64 lg:h-auto lg:flex-1">
            <Uploader 
              label="Surface Image" 
              description="Visible on Light Mode (White Background)"
              slot="surface"
              imageSrc={surfacePreview}
              onImageSelected={handleImageSelect}
              onClear={handleClear}
            />
            <Uploader 
              label="Hidden Image" 
              description="Visible on Dark Mode (Black Background)"
              slot="hidden"
              imageSrc={hiddenPreview}
              onImageSelected={handleImageSelect}
              onClear={handleClear}
            />
          </div>

          {/* Controls Section */}
          <div className="flex-shrink-0">
             <Controls 
                config={config} 
                onChange={setConfig} 
                isProcessing={isProcessing} 
             />
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7 h-[600px] lg:h-auto lg:min-h-[calc(100vh-8rem)] sticky top-24">
          <Preview 
            resultUrl={resultUrl} 
            isProcessing={isProcessing}
          />
        </div>
      </main>
    </div>
  );
}

export default App;