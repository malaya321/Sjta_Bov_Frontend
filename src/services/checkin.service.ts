// src/services/checkin.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';


export interface CheckinResponse {
  success: boolean;
  message: string;
  status: any;
  data?: {
    driver_id?: string;
    name?: string;
    check_in?: string;
    check_out?: string;
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
      
      // Using the centralized api instance - token is automatically added by interceptor
      const response = await api.post(
        '/check-in',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Check-in successful:', response.data);
      
      // Store check-in time if available in response
      if (response.data?.data?.check_in) {
        await AsyncStorage.setItem('checkinTime', response.data.data.check_in);
      }
      
      return response.data;

    } catch (error: any) {
      console.error('❌ Check-in error:', error);
      throw error;
    }
  }

  /**
   * ✅ Checkout with complete FormData
   */
  async checkout(formData: FormData): Promise<CheckinResponse> {
    try {
      console.log('📤 Sending checkout request with FormData');
      
      // Log FormData contents for debugging
      // @ts-ignore
      if (formData._parts) {
        // @ts-ignore
        formData._parts.forEach((part: any) => {
          console.log(`FormData field: ${part[0]}`, part[1]?.uri ? '[Image File]' : part[1]);
        });
      }
      // Make the API call with FormData
      const response = await api.post('/check-out', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Checkout successful:', response.data);
      // Remove check-in time from storage on successful checkout
      if (response.data?.status === 1) {
        await AsyncStorage.removeItem('checkinTime');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Check-out error:', error);
      throw error;
    }
  }

  /**
   * ✅ Get check-in history
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
   * ✅ Create FormData for checkout with all required fields
   */
  createCheckoutFormData(
    faceImageUri: string,
    batteryPhotoUri: string | null,
    batteryStatus: string,
    password: string,
    checkinTime: string,
    latitude: number | null,
    longitude: number | null
  ): FormData {
    const formData = new FormData();
    
    // Add face image
    const faceImageFile = {
      uri: faceImageUri,
      type: 'image/jpeg',
      name: `checkout_face_${Date.now()}.jpg`,
    };
    formData.append('image', faceImageFile as any);
    
    // Add password
    if (password) {
      formData.append('password', password);
    }
    
    // Add check-in time
    formData.append('check_in', checkinTime);
    
    // Add battery photo if available
    if (batteryPhotoUri) {
      const batteryPhotoFile = {
        uri: batteryPhotoUri,
        type: 'image/jpeg',
        name: `checkout_battery_${Date.now()}.jpg`,
      };
      formData.append('check_out_battery_percentage', batteryPhotoFile as any);
    }
    
    // Add battery status text
    formData.append('check_out_battery_status', batteryStatus);
    
    // Add location if available
    if (latitude && longitude) {
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
    }
    
    return formData;
  }
}

export default new CheckinService();