import { ProcessingConfig } from '../types';

/**
 * Loads a File object into an HTMLImageElement.
 */
export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculates the dimensions to cover a target area while maintaining aspect ratio.
 */
const getCoverDimensions = (
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
) => {
  const imgRatio = imgWidth / imgHeight;
  const targetRatio = targetWidth / targetHeight;

  let renderWidth, renderHeight, offsetX, offsetY;

  if (imgRatio > targetRatio) {
    // Image is wider than target
    renderHeight = targetHeight;
    renderWidth = targetHeight * imgRatio;
    offsetY = 0;
    offsetX = (targetWidth - renderWidth) / 2;
  } else {
    // Image is taller than target
    renderWidth = targetWidth;
    renderHeight = targetWidth / imgRatio;
    offsetX = 0;
    offsetY = (targetHeight - renderHeight) / 2;
  }

  return { width: renderWidth, height: renderHeight, x: offsetX, y: offsetY };
};

/**
 * Embeds text data into the LSB of the RGB channels.
 * Format: 32-bit length (Little Endian) followed by UTF-8 bytes.
 */
const embedSteganography = (data: Uint8ClampedArray, text: string) => {
  if (!text) return;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const length = bytes.length;
  
  // We utilize the LSB of R, G, B channels. 3 bits per pixel.
  const totalPixels = data.length / 4;
  const totalCapacityBits = totalPixels * 3;
  const requiredBits = 32 + length * 8; // 32-bit length header + data

  if (requiredBits > totalCapacityBits) {
    console.warn("Steganography capacity exceeded. Text truncated.");
    // In a real app we might truncate or throw, here we just proceed with what fits or return
    // return; 
  }

  let bitCursor = 0;

  // Function to write a bit to the next available channel LSB
  const writeBit = (bit: number) => {
    if (bitCursor >= totalCapacityBits) return;
    
    const pixelIndex = Math.floor(bitCursor / 3);
    const channelOffset = bitCursor % 3; // 0=R, 1=G, 2=B
    const dataIndex = pixelIndex * 4 + channelOffset;

    // Clear LSB and set new bit
    data[dataIndex] = (data[dataIndex] & 0xFE) | (bit & 1);
    
    bitCursor++;
  };

  // 1. Write Length (32 bits)
  for (let i = 0; i < 32; i++) {
    writeBit((length >> i) & 1);
  }

  // 2. Write Data Bytes
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    for (let j = 0; j < 8; j++) {
      writeBit((byte >> j) & 1);
    }
  }
};

/**
 * The Core Mirage Tank Algorithm.
 */
export const generateMirageTank = (
  surfaceImg: HTMLImageElement,
  hiddenImg: HTMLImageElement,
  config: ProcessingConfig
): Promise<string> => {
  return new Promise((resolve) => {
    // 1. Determine Output Dimensions
    const width = config.width || Math.min(surfaceImg.width, hiddenImg.width);
    const height = config.height || Math.min(surfaceImg.height, hiddenImg.height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) throw new Error('Could not get canvas context');

    // 2. Draw and Get Data for Surface Image (Image A)
    const dimA = getCoverDimensions(surfaceImg.width, surfaceImg.height, width, height);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(surfaceImg, dimA.x, dimA.y, dimA.width, dimA.height);
    const surfaceData = ctx.getImageData(0, 0, width, height);

    // 3. Draw and Get Data for Hidden Image (Image B)
    const dimB = getCoverDimensions(hiddenImg.width, hiddenImg.height, width, height);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(hiddenImg, dimB.x, dimB.y, dimB.width, dimB.height);
    const hiddenData = ctx.getImageData(0, 0, width, height);

    // 4. Create Output Buffer
    const resultData = ctx.createImageData(width, height);

    // Pre-calculate linear mapping constants
    const scaleA = (255 - config.surfaceMin) / 255;
    const offsetA = config.surfaceMin;
    const scaleB = config.hiddenMax / 255;
    
    const ditheringStrength = config.dithering * 10; // Scale 0-1 to reasonable noise amplitude

    for (let i = 0; i < resultData.data.length; i += 4) {
      // Input Pixel A (Surface)
      let rA = surfaceData.data[i];
      let gA = surfaceData.data[i + 1];
      let bA = surfaceData.data[i + 2];

      // Input Pixel B (Hidden)
      let rB = hiddenData.data[i];
      let gB = hiddenData.data[i + 1];
      let bB = hiddenData.data[i + 2];

      // --- Dithering ---
      if (ditheringStrength > 0) {
        const noise = (Math.random() - 0.5) * ditheringStrength;
        rA += noise; gA += noise; bA += noise;
        rB += noise; gB += noise; bB += noise;
      }

      if (config.grayscale) {
        // --- Grayscale Mode ---
        let lumA = 0.2126 * rA + 0.7152 * gA + 0.0722 * bA;
        let lumB = 0.2126 * rB + 0.7152 * gB + 0.0722 * bB;

        // Linear Mapping
        lumA = Math.max(0, Math.min(255, lumA * scaleA + offsetA));
        lumB = Math.max(0, Math.min(255, lumB * scaleB));

        // Enforce A >= B
        if (lumB > lumA) lumB = lumA;

        // Calculate Alpha & Gray
        const alpha = 255 - (lumA - lumB);
        let gray = 0;
        if (alpha > 0) {
          gray = (lumB * 255) / alpha;
        }

        resultData.data[i] = gray;
        resultData.data[i + 1] = gray;
        resultData.data[i + 2] = gray;
        resultData.data[i + 3] = alpha;

      } else {
        // --- Color Mode ---
        // Map each channel independently
        rA = Math.max(0, Math.min(255, rA * scaleA + offsetA));
        gA = Math.max(0, Math.min(255, gA * scaleA + offsetA));
        bA = Math.max(0, Math.min(255, bA * scaleA + offsetA));

        rB = Math.max(0, Math.min(255, rB * scaleB));
        gB = Math.max(0, Math.min(255, gB * scaleB));
        bB = Math.max(0, Math.min(255, bB * scaleB));

        // Enforce A >= B per channel (Clamp B down to A if needed)
        // This desaturates the hidden image in problem areas but preserves the illusion
        if (rB > rA) rB = rA;
        if (gB > gA) gB = gA;
        if (bB > bA) bB = bA;

        // Calculate Alpha for each channel
        // alpha_ch = 255 - (Ch_A - Ch_B)
        const alphaR = 255 - (rA - rB);
        const alphaG = 255 - (gA - gB);
        const alphaB = 255 - (bA - bB);

        // We must choose the HIGHEST alpha required by any channel to ensure full coverage.
        // If we choose a lower alpha, one channel might need more opacity than we provide, 
        // leading to it blowing out on white or black.
        // However, choosing the max alpha means some channels will be more opaque than 
        // theoretically perfect, leading to slight ghosting. This is the trade-off.
        const finalAlpha = Math.max(alphaR, Math.max(alphaG, alphaB));

        // Calculate resulting RGB
        // Color = B / Alpha
        let rOut = 0, gOut = 0, bOut = 0;
        if (finalAlpha > 0) {
          rOut = (rB * 255) / finalAlpha;
          gOut = (gB * 255) / finalAlpha;
          bOut = (bB * 255) / finalAlpha;
        }

        resultData.data[i] = rOut;
        resultData.data[i + 1] = gOut;
        resultData.data[i + 2] = bOut;
        resultData.data[i + 3] = finalAlpha;
      }
    }

    // 5. Steganography
    if (config.steganography && config.steganography.length > 0) {
      embedSteganography(resultData.data, config.steganography);
    }

    // 6. Output
    ctx.putImageData(resultData, 0, 0);
    resolve(canvas.toDataURL('image/png'));
  });
};