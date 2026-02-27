import { useMutation, useQuery } from "@tanstack/react-query";
import { driverHomeScreenService } from "../services/driverHomeScreenService";
export const driverKeys = {
  all: ['driver'] as const,
  homeScreen: () => [...driverKeys.all, 'homeScreen'] as const,
  vehicleStatus: () => [...driverKeys.all, 'vehicleStatus'] as const,
  updateVehicleOperationalStatus: () => [...driverKeys.all, 'updateVehicleOperationalStatus'] as const,
  // Add other driver query keys as needed
};
export const useDriver = () => {
  return useQuery({
    queryKey: driverKeys.homeScreen(),
    queryFn: async () => {
      const response = await driverHomeScreenService.getDriverHomeScreen();

      if (!response.status) {
        throw new Error('Failed to fetch today\'s rosters');
      }
      return response.data;
    },
  });
};

export const useVehicleStatus = () => {
  return useQuery({
    queryKey: driverKeys.vehicleStatus(),
    queryFn: async () => {
      const response = await driverHomeScreenService.getVehicleStatus();

      if (!response.status) {
        throw new Error('Failed to fetch today\'s rosters');
      }
      return response.data;
    },
  });
};
export const useUpdateVehicleOperationalStatus = () => {
  return useMutation({
    mutationFn: async (params: any) => {
      const response = await driverHomeScreenService.updateVehicleOPerationalStatus(params);
      
      if (!response.status) {
        throw new Error('Failed to update vehicle status');
      }
      return response.data;
    },
  });
};