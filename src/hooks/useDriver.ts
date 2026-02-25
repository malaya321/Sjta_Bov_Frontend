import { useQuery } from "@tanstack/react-query";
import { driverHomeScreenService } from "../services/driverHomeScreenService";
export const driverKeys = {
  all: ['driver'] as const,
  homeScreen: () => [...driverKeys.all, 'homeScreen'] as const,
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