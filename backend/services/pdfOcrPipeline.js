import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import Tesseract from 'tesseract.js';
import { extractTextFromPdfBuffer } from './ocrService.js';

const execFileAsync = promisify(execFile);

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Check whether pdftoppm (poppler-utils) is available on the system
 */
async function isPdftoppmAvailable() {
  try {
    await execFileAsync('pdftoppm', ['-v']);
    return true;
  } catch (err) {
    // pdftoppm -v outputs version info to stderr, which execFile might consider an error unless code 0
    if (err.stderr && err.stderr.toLowerCase().includes('pdftoppm version')) {
      return true;
    }
    return false;
  }
}

/**
 * Convert a PDF file on disk into individual page PNG images using pdftoppm (poppler-utils)
 * @param {string} pdfPath - Absolute path to the PDF file
 * @param {string} outputDir - Directory to store output page images
 * @param {string} prefix - Filename prefix for page images
 * @returns {Promise<string[]>} List of generated image file paths sorted by page number
 */
export async function convertPdfToImages(pdfPath, outputDir, prefix = 'page') {
  ensureDir(outputDir);
  const outPrefixPath = path.join(outputDir, prefix);

  // pdftoppm -png -r 150 <input.pdf> <out_prefix>
  // Renders pages at 150 DPI into PNG format
  await execFileAsync('pdftoppm', ['-png', '-r', '150', pdfPath, outPrefixPath]);

  // Read back all generated PNG files matching the prefix
  const files = fs.readdirSync(outputDir);
  const pageImageFiles = files
    .filter((f) => f.startsWith(prefix) && f.endsWith('.png'))
    .sort((a, b) => {
      // Natural number sort for filenames like prefix-1.png, prefix-2.png, prefix-10.png
      const numA = parseInt(a.replace(/[^\d]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^\d]/g, ''), 10) || 0;
      return numA - numB;
    })
    .map((f) => path.join(outputDir, f));

  return pageImageFiles;
}

/**
 * Run Tesseract OCR on a list of image paths and join text across pages
 * @param {string[]} imagePaths - Array of image file paths
 * @returns {Promise<{ fullText: string, pageTexts: string[], ocrConfidence: number }>}
 */
export async function runTesseractOcrOnImages(imagePaths) {
  const pageTexts = [];
  let totalConfidence = 0;

  for (let i = 0; i < imagePaths.length; i++) {
    const imgPath = imagePaths[i];
    console.log(`[Tesseract OCR] Processing page ${i + 1}/${imagePaths.length}: ${path.basename(imgPath)}`);

    try {
      const result = await Tesseract.recognize(imgPath, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && m.progress === 1) {
            console.log(`[Tesseract OCR] Page ${i + 1} completed.`);
          }
        }
      });

      const text = result?.data?.text || '';
      const confidence = result?.data?.confidence || 75;
      pageTexts.push(text);
      totalConfidence += confidence;
    } catch (ocrErr) {
      console.error(`[Tesseract OCR] Error processing page ${i + 1}:`, ocrErr.message);
      pageTexts.push('');
    }
  }

  const fullText = pageTexts.join('\n\n--- Next Page ---\n\n').trim();
  const averageConfidence = imagePaths.length > 0 ? Math.round(totalConfidence / imagePaths.length) : 0;

  return {
    fullText,
    pageTexts,
    ocrConfidence: averageConfidence
  };
}

/**
 * End-to-end PDF OCR extraction pipeline:
 * 1. Converts PDF pages into images using pdftoppm (poppler-utils) if available.
 * 2. Runs Tesseract OCR on each image page and concatenates text.
 * 3. Gracefully falls back to pdf2json if pdftoppm is not installed locally.
 * 4. Cleans up temporary image files.
 *
 * @param {string} pdfPath - Full path to stored PDF file
 * @param {Buffer} [pdfBuffer] - Optional buffer for fallback parser
 * @returns {Promise<{ fullText: string, pageCount: number, ocrEngine: string, confidence: number }>}
 */
export async function processPdfOcr(pdfPath, pdfBuffer = null) {
  const hasPoppler = await isPdftoppmAvailable();
  const tempDir = path.join(path.dirname(pdfPath), '..', 'temp', `ocr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  let generatedImages = [];
  try {
    if (hasPoppler) {
      console.log(`[PDF Pipeline] poppler-utils detected. Rendering PDF pages to PNG at ${tempDir}...`);
      ensureDir(tempDir);
      generatedImages = await convertPdfToImages(pdfPath, tempDir, 'page');
      console.log(`[PDF Pipeline] Rendered ${generatedImages.length} page image(s). Running Tesseract OCR...`);

      if (generatedImages.length > 0) {
        const { fullText, ocrConfidence } = await runTesseractOcrOnImages(generatedImages);
        return {
          fullText,
          pageCount: generatedImages.length,
          ocrEngine: 'poppler+tesseract',
          confidence: ocrConfidence || 85
        };
      }
    }

    // Fallback if poppler is unavailable or produced 0 images (e.g. during local Windows development)
    console.log('[PDF Pipeline] Poppler not available on current host or yielded 0 images. Utilizing pure-JS fallback parser...');
    const bufferToRead = pdfBuffer || fs.readFileSync(pdfPath);
    const fallbackText = await extractTextFromPdfBuffer(bufferToRead);

    return {
      fullText: fallbackText || '',
      pageCount: 1,
      ocrEngine: 'pdf2json-fallback',
      confidence: fallbackText.trim().length > 50 ? 80 : 50
    };
  } finally {
    // Cleanup temporary image files
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.warn('[PDF Pipeline] Temp directory cleanup warning:', cleanupErr.message);
      }
    }
  }
}
