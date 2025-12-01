import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { ImageSlot } from '../types';

interface UploaderProps {
  label: string;
  description: string;
  slot: ImageSlot;
  imageSrc: string | null;
  onImageSelected: (slot: ImageSlot, file: File) => void;
  onClear: (slot: ImageSlot) => void;
}

export const Uploader: React.FC<UploaderProps> = ({
  label,
  description,
  slot,
  imageSrc,
  onImageSelected,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    onImageSelected(slot, file);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {imageSrc ? (
        <div className="relative w-full h-64 md:h-full bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700 group">
          <img 
            src={imageSrc} 
            alt={label} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 to-transparent p-4 flex justify-between items-start">
            <span className="text-white font-medium drop-shadow-md">{label}</span>
            <button
              onClick={() => onClear(slot)}
              className="bg-black/50 hover:bg-red-500/80 p-2 rounded-full backdrop-blur-sm transition-colors text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full h-64 md:h-full min-h-[200px]
            rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6
            cursor-pointer transition-all duration-200
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 bg-zinc-900/50'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className={`p-4 rounded-full mb-3 ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {isDragging ? <Upload size={32} /> : <ImageIcon size={32} />}
          </div>
          <h3 className="text-zinc-200 font-semibold text-lg">{label}</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-[200px]">{description}</p>
        </div>
      )}
    </div>
  );
};