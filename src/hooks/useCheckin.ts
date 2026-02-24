// src/hooks/useCheckin.ts
import { useState, useCallback } from 'react';
import checkinService, { CheckinResponse } from '../services/checkin.service';

// Define the image file type
export interface ImageFile {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

interface UseCheckinReturn {
  isLoading: boolean;
  error: string | null;
  checkin: (imageFile: ImageFile | FormData) => Promise<CheckinResponse>;
  checkout: (formData: FormData) => Promise<CheckinResponse>;
  resetError: () => void;
}

export const useCheckin = (): UseCheckinReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkin = useCallback(async (imageData: ImageFile | FormData): Promise<CheckinResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If it's already a FormData object, use it directly
      let formData: FormData;
      
      if (imageData instanceof FormData) {
        formData = imageData;
      } else {
        // If it's an ImageFile object, create FormData
        const imageFile = imageData as ImageFile;
        
        // Validate the image file
        if (!imageFile.uri || !imageFile.type) {
          throw new Error('Invalid image file. Please capture a clear face image.');
        }

        formData = new FormData();
        
        // Append with field name 'image'
        formData.append('image', {
          uri: imageFile.uri,
          type: imageFile.type || 'image/jpeg',
          name: imageFile.name || `image_${Date.now()}.jpg`,
        } as any);
        
        console.log('FormData field name: "image"');
        console.log('File name:', imageFile.name);
      }

      console.log('Sending FormData to checkin service...');
      
      // Call the service with FormData
      const result = await checkinService.checkin(formData);

      if (!result.success) {
        throw new Error(result.message || 'Check-in failed');
      }

      return result;
    } catch (err: any) {
      const message = err?.message || 'Check-in failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkout = useCallback(async (formData: FormData): Promise<CheckinResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending FormData to checkout service...');
      
      // Call the service with FormData
      const result = await checkinService.checkout(formData);

      if (!result.status) {
        throw new Error(result.message || 'Check-out failed');
      }

      return result;
    } catch (err: any) {
      const message = err?.message || 'Check-out failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    checkin,
    checkout,
    resetError,
  };
};