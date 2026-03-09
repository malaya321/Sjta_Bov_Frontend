import { useMutation, useQuery } from "@tanstack/react-query";
// import { driverHomeScreenService } from "../services/driverHomeScreenService";
import { notificationScreenService } from "../services/notificationScreenService";
export const notificationKeys = {
  all: ['notification'] as const,
  allNotification: () => [...notificationKeys.all, 'allNotification'] as const,
  notificationCount: () => [...notificationKeys.all, 'notificationCount'] as const, 
};

export const useNotification = () => {
  return useQuery({
    queryKey: notificationKeys.allNotification(),
    queryFn: async () => {
      const response = await notificationScreenService.getNotificationScreen();

      if (!response.status) {
        throw new Error('Failed to fetch notifications');
      }
      return response.data;
    },
  });
};

export const useUpdateNotificationStatus = () => {
  return useMutation({
    mutationFn: async (params: any) => {
      const response = await notificationScreenService.updateNotificationStatus(params);
      
      if (!response.status) {
        throw new Error('Failed to update notification status');
      }
      return response.data;
    },
  });
};

export const useUpdateAllNotificationStatus = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await notificationScreenService.updateAllNotificationStatus();
      
      if (!response.status) {
        throw new Error('Failed to update notification status');
      }
      return response.data;
    },
  });
};
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: notificationKeys.notificationCount(),
    queryFn: async () => {
      const response = await notificationScreenService.getUnseenNotificationCount();

      if (!response.status) {
        throw new Error('Failed to fetch notifications');
      }
      return response.data;
    },
  });
};
