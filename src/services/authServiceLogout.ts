
import api from '../api/axiosInstance';

// Define the response shape based on your backend return
export interface LogoutResponse {

  token?: string;
  
  // add other fields your API returns
}

export const logoutUser = async (token: any): Promise<LogoutResponse> => {
    console.log(token,'credentials')
  try {
    const response = await api.post('/logout', {},{
          headers: {
        'Authorization': `Bearer ${token._j}`
      }

  });

    // Axios stores the JSON body in .data
    return response.data;
  } catch (error: any) {
    // This allows TanStack Query to receive the specific error message from your server
    const message = error.response?.data?.message || 'Failed to connect to server';
    throw new Error(message);
  }
};