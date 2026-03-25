import api from "../api/axiosInstance";

export const profileImageService = {
   async updateProfileImage(payload:any): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {
    //   console.log("hello");
      
      const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
      const response = await api.post(
        `/update-pimage`,
        payload,
        isFormData
          ? {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          : undefined
      );
      // console.log(`✅ Received ${response?.data} today's rosters +++`);
      
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get today rosters error:', error);
      throw error;
    }
  }
}
