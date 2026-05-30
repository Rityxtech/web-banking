
import html2canvas from 'html2canvas';
import { APP_CONFIG } from '../config';

export const shareReceipt = async (elementId: string, fileName: string = 'receipt.png') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    // Capture the element
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Respect transparency
      scale: 2, // High DPI
      logging: false,
      useCORS: true, // Allow cross-origin images
      ignoreElements: (element) => element.classList.contains('no-capture') // Class to exclude elements
    });

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;

    // Try Web Share API Level 2 (File sharing)
    const nav = navigator as any;
    
    const file = new File([blob], fileName, { type: 'image/png' });
    
    if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: 'Transaction Receipt',
          text: 'Here is the transaction receipt from {APP_CONFIG.BANK_NAME}.'
        });
    } else {
        // Force error to trigger fallback for browsers without share API support
        throw new Error('Web Share API not supported');
    }
  } catch (err: any) {
    // Handle user cancellation gracefully
    if (err.name === 'AbortError' || err.message?.toLowerCase().includes('share canceled')) {
        console.log('User canceled sharing');
        return;
    }

    console.error("Sharing failed", err);
    
    // Fallback to download
    try {
        const element = document.getElementById(elementId);
        if (element) {
            // Re-capture if needed for robust fallback
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true,
                ignoreElements: (element) => element.classList.contains('no-capture')
            });
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    } catch (e) {
        console.error("Download failed", e);
    }
  }
};
