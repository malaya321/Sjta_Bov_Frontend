import api from "../api/axiosInstance";

export const driverHomeScreenService = {
    async getDriverHomeScreen(): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {
    //   console.log("hello");
      
      const response = await api.get(`/dashboard`);
      // console.log(`✅ Received ${response?.data} today's rosters +++`);
      
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get today rosters error:', error);
      throw error;
    }
  },
   async getVehicleStatus(): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {
    //   console.log("hello");
      
      const response = await api.get(`/vehicle-status`);
      // console.log(`✅ Received ${response?.data} today's rosters +++`);
      
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get today rosters error:', error);
      throw error;
    }
  },
   async updateVehicleOPerationalStatus(payload:any): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {
    //   console.log("hello");
      
      const response = await api.post(`/vehicle/operational-status/update`,payload);
      // console.log(`✅ Received ${response?.data} today's rosters +++`);
      
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get today rosters error:', error);
      throw error;
    }
  }
}
