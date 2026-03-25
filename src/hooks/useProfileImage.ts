import { useMutation } from "@tanstack/react-query";
import { profileImageService } from "../services/profileImageService";
export const driverKeys = {
  all: ['driver'] as const,
  homeScreen: () => [...driverKeys.all, 'homeScreen'] as const,
  vehicleStatus: () => [...driverKeys.all, 'vehicleStatus'] as const,
  updateVehicleOperationalStatus: () => [...driverKeys.all, 'updateVehicleOperationalStatus'] as const,
  // Add other driver query keys as needed
};



export const useUpdateProfileImage = () => {
  return useMutation({
    mutationFn: async (params: any) => {
      const response = await profileImageService.updateProfileImage(params);
      
      if (!response.status) {
        throw new Error('Failed to update vehicle status');
      }
      return response.data;
    },
  });
};
