import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * Best-effort video compression using ffmpeg.
 * 
 * NOTE: Browser MediaRecorder already produces WebM (VP9/Opus) which is a modern
 * compressed format. WebP/AVIF are image formats and do NOT apply to video.
 * VP9 WebM is already optimized. Re-encoding always causes some quality loss.
 * This helper only runs if ffmpeg is installed and produces a smaller file.
 */
export async function compressVideoIfPossible(
  inputPath: string,
  outputPath: string
): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    await execAsync(
      `ffmpeg -i "${inputPath}" -c:v libx264 -crf 23 -preset fast -c:a aac -b:a 128k -movflags +faststart -y "${outputPath}"`
    );

    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;

    if (compressedSize < originalSize * 0.9) {
      return true;
    } else {
      fs.unlinkSync(outputPath);
      return false;
    }
  } catch {
    return false;
  }
}