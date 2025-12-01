export interface ProcessingConfig {
  /** 
   * The lower bound for the Surface Image (Image A).
   * Pixels in Image A will be mapped from [0, 255] to [surfaceMin, 255].
   * Higher values make the image lighter and ghost-like on white.
   */
  surfaceMin: number;

  /**
   * The upper bound for the Hidden Image (Image B).
   * Pixels in Image B will be mapped from [0, 255] to [0, hiddenMax].
   * Lower values make the image darker and clearer on black.
   */
  hiddenMax: number;

  /**
   * Whether to force grayscale.
   */
  grayscale: boolean;

  /**
   * Strength of dithering noise [0, 1].
   * Helps prevent color banding in gradients.
   */
  dithering: number;

  /**
   * Optional text to hide inside the image data (LSB Steganography).
   */
  steganography: string;
  
  /**
   * Output width. If null, uses the smaller of the two input widths.
   */
  width?: number;
  
  /**
   * Output height. If null, uses the smaller of the two input heights.
   */
  height?: number;
}

export type ImageSlot = 'surface' | 'hidden';

export interface ProcessedResult {
  dataUrl: string;
  width: number;
  height: number;
}