import api from "../api/axiosInstance";

export const notificationScreenService = {
    async getNotificationScreen(): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {      
      const response = await api.get(`/notifications`);   
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get notifications error:', error);
      throw error;
    }
  },
   async updateNotificationStatus(payload:any): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {
      const response = await api.post(`/notifications/${payload}/seen`);
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get today rosters error:', error);
      throw error;
    }
  },
   async updateAllNotificationStatus(): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {  
      const response = await api.post(`/notifications/seen-all`);   
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get notification error:', error);
      throw error;
    }
  },
   
   async getUnseenNotificationCount(): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {    
      const response = await api.get(`/notifications/unread-count`);
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get unread notification count error:', error);
      throw error;
    }
  }
}

