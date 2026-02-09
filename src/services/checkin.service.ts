// src/services/checkin.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';

export interface CheckinResponse {
  success: boolean;
  message: string;
  data?: {
    driver_id?: string;
    name?: string;
    checkin_time?: string;
  };
  error?: string;
}

class CheckinService {
  /**
   * ✅ Check-in (Image key + Auth Token)
   */
  async checkin(formData: FormData): Promise<CheckinResponse> {
    try {
      console.log('📤 Sending check-in request');
      // ✅ Using the centralized api instance - token is automatically added by interceptor
      const response = await api.post(
        '/face/login',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file upload
            // Authorization header is automatically added by the interceptor
          },
        }
      );

      console.log('✅ Check-in successful:', response.data);
      return response.data;

    } catch (error: any) {
      console.error('❌ Check-in error:', error);

      // ✅ Error handling is now centralized in axiosInstance.ts
      // Just re-throw the formatted error from the interceptor
      throw error;
    }
  }

  /**
   * Mock checkout
   */
  async checkout(driverId: string, vehicleId: string, remarks?: string): Promise<CheckinResponse> {
    try {
      // If you have a real checkout endpoint, use:
      // const response = await api.post('/checkout', { driverId, vehicleId, remarks });
      // return response.data;
      
      // For now, using mock:
      await new Promise((resolve:any) => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Check-out successful',
        data: {
          driver_id: driverId,
          checkin_time: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error('❌ Check-out error:', error);
      throw error;
    }
  }

  /**
   * ✅ Get check-in history (if available)
   */
  async getCheckinHistory(driverId?: string, date?: string): Promise<any> {
    try {
      const params: any = {};
      if (driverId) params.driver_id = driverId;
      if (date) params.date = date;

      const response = await api.get('/checkin/history', { params });
      return response.data;
    } catch (error: any) {
      console.error('❌ Get checkin history error:', error);
      throw error;
    }
  }

  /**
   * ✅ Get today's check-ins
   */
  async getTodayCheckins(): Promise<any> {
    try {
      const response = await api.get('/checkin/today');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get today checkins error:', error);
      throw error;
    }
  }

  /**
   * ✅ Verify check-in status
   */
  async verifyCheckinStatus(driverId: string): Promise<{ isCheckedIn: boolean; checkinTime?: string }> {
    try {
      const response = await api.get(`/checkin/status/${driverId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Verify checkin status error:', error);
      throw error;
    }
  }

  /**
   * Convert image URI to base64
   */
  imageToBase64(imageUri: string): string {
    return imageUri.replace(/^data:image\/\w+;base64,/, '');
  }

  /**
   * ✅ Create FormData from image and additional data
   */
  createCheckinFormData(imageUri: string, additionalData?: Record<string, any>): FormData {
    const formData = new FormData();
    
    // Add image file
    const imageFile = {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'checkin_photo.jpg',
    };
    formData.append('image', imageFile as any);
    
    // Add additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    return formData;
  }
}

export default new CheckinService();