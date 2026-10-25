/**
 * Flow SDK for Educational Video Generation
 * Provides unified interface:
 * - Flow.media.select
 * - Flow.generate.image
 * - Flow.generate.video
 * - Flow.download
 */

import { FlowGenerateImageOptions, FlowGenerateVideoOptions, FlowMediaSelectOptions } from '../types';

export class FlowSDK {
  public media = {
    /**
     * Select a media file from local device or built-in asset library
     */
    select: async (
      options: FlowMediaSelectOptions = { accept: 'image/*', type: 'image' }
    ): Promise<{ file?: File; dataUrl: string; name: string } | null> => {
      return new Promise((resolve, reject) => {
        try {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = options.accept || 'image/*';
          input.style.display = 'none';
          document.body.appendChild(input);

          input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) {
              document.body.removeChild(input);
              resolve(null);
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              document.body.removeChild(input);
              resolve({
                file,
                dataUrl: reader.result as string,
                name: file.name,
              });
            };
            reader.onerror = (err) => {
              document.body.removeChild(input);
              reject(err);
            };
            reader.readAsDataURL(file);
          };

          // Cancel or dismiss
          window.addEventListener(
            'focus',
            () => {
              setTimeout(() => {
                if (input.parentNode && (!input.files || input.files.length === 0)) {
                  // User might have cancelled
                  // leave resolving to user action
                }
              }, 1000);
            },
            { once: true }
          );

          input.click();
        } catch (err) {
          reject(err);
        }
      });
    },
  };

  public generate = {
    /**
     * Generate visual asset with Nano Banana Pro
     */
    image: async (
      options: FlowGenerateImageOptions
    ): Promise<{ imageUrl: string; mediaId: string; modelUsed: string }> => {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: options.prompt,
          aspectRatio: options.aspectRatio || '16:9',
          model: options.model || 'Nano Banana Pro',
          subject: options.subject,
          lessonTitle: options.lessonTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Image generation failed with status ${response.status}`);
      }

      return response.json();
    },

    /**
     * Generate video with Omni Flash / Veo 3.1 and lip-sync alignment
     */
    video: async (
      options: FlowGenerateVideoOptions
    ): Promise<{
      operationName: string;
      status: string;
      structuredPrompt: string;
      duration: number;
      aspectRatio: string;
      model: string;
    }> => {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Video generation failed with status ${response.status}`);
      }

      return response.json();
    },
  };

  /**
   * Download a media file or data URL directly to user's computer
   */
  public download = async (urlOrDataUrl: string, filename: string): Promise<boolean> => {
    try {
      // If it's a blob url or data url
      if (urlOrDataUrl.startsWith('data:') || urlOrDataUrl.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = urlOrDataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return true;
      }

      // If it's an external or relative URL, fetch as blob first
      const res = await fetch(urlOrDataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return true;
    } catch (err) {
      console.error('Flow.download error:', err);
      throw err;
    }
  };
}

export const Flow = new FlowSDK();
