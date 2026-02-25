// src/api/hooks/useSupervisor.ts
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';
import supervisorService, {
  Driver,
  Vehicle,
  RosterEntry,
  Assignment,
  SupervisorStats,
  Notification,
} from '../services/supervisor.service';

// Query keys for supervisor
export const supervisorKeys = {
  all: ['supervisor'] as const,
  stats: () => [...supervisorKeys.all, 'stats'] as const,
  drivers: () => [...supervisorKeys.all, 'drivers'] as const,
  availableDrivers: () => [...supervisorKeys.drivers(), 'available'] as const,
  activeDrivers: () => [...supervisorKeys.drivers(), 'active'] as const,
  driverDetails: (driverId: string) => [...supervisorKeys.drivers(), driverId] as const,
  vehicles: () => [...supervisorKeys.all, 'vehicles'] as const,
  availableVehicles: () => [...supervisorKeys.vehicles(), 'available'] as const,
  maintenanceVehicles: () => [...supervisorKeys.vehicles(), 'maintenance'] as const,
  vehicleDetails: (vehicleId: string) => [...supervisorKeys.vehicles(), vehicleId] as const,
  rosters: () => [...supervisorKeys.all, 'rosters'] as const,
  todayRosters: () => [...supervisorKeys.rosters(), 'today'] as const,
  activeRosters: () => [...supervisorKeys.rosters(), 'active'] as const,
  rosterDetails: (rosterId: string) => [...supervisorKeys.rosters(), rosterId] as const,
  assignments: () => [...supervisorKeys.all, 'assignments'] as const,
  activeAssignments: () => [...supervisorKeys.assignments(), 'active'] as const,
  notifications: () => [...supervisorKeys.all, 'notifications'] as const,
  unreadNotifications: () => [...supervisorKeys.notifications(), 'unread'] as const,
  search: (query: string) => [...supervisorKeys.all, 'search', query] as const,
};

// ==================== STATS HOOKS ====================


export const useDrivers = (params?: {
  status?: 'Available' | 'In Shift' | 'Break' | 'Off Duty';
  zone?: string;
  search?: string;
  page?: number;
  limit?: number;
  enabled?:any;
}) => {
  return useQuery({
    queryKey: [...supervisorKeys.drivers(), params],
    queryFn: async () => {
      const response = await supervisorService.getDrivers(params);
      // if (!response.success) {
      //   throw new Error('Failed to fetch drivers');
      // }
      return response;
    },
  });
};


export const useAvailableVehicles = () => {
  return useQuery({
    queryKey: supervisorKeys.availableVehicles(),
    queryFn: async () => {
      // const response = await supervisorService.getAvailableVehicles();
      // if (!response.success) {
      //   throw new Error('Failed to fetch available vehicles');
      // }
      // return response.data;
      return null;
    },
  });
};


export const useTodayRosters = () => {
  return useQuery({
    queryKey: supervisorKeys.todayRosters(),
    queryFn: async () => {
      const response = await supervisorService.getTodayRosters();

      if (!response.status) {
        throw new Error('Failed to fetch today\'s rosters');
      }
      return response.data;
    },
  });
};


export const useActiveAssignments = () => {
  return useQuery({
    queryKey: supervisorKeys.activeAssignments(),
    queryFn: async () => {
      const response = await supervisorService.getActiveAssignments();
      if (!response.success) {
        throw new Error('Failed to fetch active assignments');
      }
      return response.data;
    },
  });
};

// ==================== NOTIFICATION HOOKS ====================

/**
 * Hook to get notifications
 */
export const useNotifications = (params?: {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...supervisorKeys.notifications(), params],
    queryFn: async () => {
      const response = await supervisorService.getNotifications(params);
      if (!response.success) {
        throw new Error('Failed to fetch notifications');
      }
      return response;
    },
  });
};

/**
 * Hook to get unread notifications count
 */
export const useUnreadNotificationsCount = () => {
  const { data } = useNotifications({ unreadOnly: true, limit: 1 });
  return data?.unreadCount || 0;
};

// ==================== SEARCH HOOK ====================

/**
 * Hook to search drivers, vehicles, and rosters
 */
export const useSearch = (query: string, type?: 'drivers' | 'vehicles' | 'all') => {
  return useQuery({
    queryKey: supervisorKeys.search(query),
    queryFn: async () => {
      const response = await supervisorService.search(query, type);
      if (!response.success) {
        throw new Error('Failed to search');
      }
      return response.data;
    },
    enabled: query.length > 2, // Only search if query has at least 3 characters
  });
};

// ==================== MUTATION HOOKS ====================


/**
 * Hook to reassign driver
 */
export const useReassignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      driver_id, 
      justification,
      vehicle_id,
      mapping_id
    }: { 
      driver_id: any; 
      justification: string;
      status?: string;
      vehicle_id?: string;
      mapping_id?:string,
    }) => {
      // Prepare the payload according to your API structure
      const payload = {
        mapping_id:mapping_id,
        driver_id: parseInt(driver_id), // Make sure it's a number if your API expects number
        vehicle_id: vehicle_id,
        justification: justification,
      
      };
      
      return supervisorService.reassignDriver(payload);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      // queryClient.invalidateQueries({ 
      //   queryKey: supervisorKeys.rosterDetails(variables.rosterId) 
      // });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.rosters() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.drivers() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.availableDrivers() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.activeRosters() });
      
      // Alert.alert('Success', data.message || 'Driver reassigned successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to reassign driver');
    },
  });
};

/**
 * Hook to reassign vehicle
 */
export const useReassignVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      driver_id, 
      justification,
      vehicle_id,
      mapping_id
    }: { 
      driver_id: any; 
      justification: string;
      status?: string;
      vehicle_id?: any;
      mapping_id?:string,
    }) =>{
      const payload = {
        mapping_id:mapping_id,
        driver_id: parseInt(driver_id), // Make sure it's a number if your API expects number
        vehicle_id: vehicle_id,
        justification: justification,
      };
      return supervisorService.reassignVehicle(payload)
    }, 
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      // queryClient.invalidateQueries({ 
      //   queryKey: supervisorKeys.rosterDetails(variables.rosterId) 
      // });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.rosters() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.vehicles() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.availableVehicles() });
      
      // Alert.alert('Success', data.message || 'Vehicle reassigned successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to reassign vehicle');
    },
  });
};


export const useSupervisorDashboard = (date?: string) => {
  // const statsQuery = useSupervisorStats(date);
  const activeDriversQuery = useDrivers();
  const availableVehiclesQuery = useAvailableVehicles();
  const activeAssignmentsQuery = useActiveAssignments();
  const todayRostersQuery = useTodayRosters();
  const notificationsQuery = useNotifications({ unreadOnly: true });

  const isLoading = 
    // statsQuery.isLoading ||
    activeDriversQuery.isLoading ||
    availableVehiclesQuery.isLoading ||
    activeAssignmentsQuery.isLoading ||
    todayRostersQuery.isLoading;

  const error = 
    // statsQuery.error ||
    activeDriversQuery.error ||
    availableVehiclesQuery.error ||
    activeAssignmentsQuery.error ||
    todayRostersQuery.error;

  return {
    // Data
    // stats: statsQuery.data,
    activeDrivers: activeDriversQuery.data,
    availableVehicles: availableVehiclesQuery.data,
    activeAssignments: activeAssignmentsQuery.data,
    todayRosters: todayRostersQuery,
    unreadNotifications: notificationsQuery.data?.unreadCount || 0,
    
    // Loading states
    isLoading,
    isRefreshing: 
      // statsQuery.isRefetching ||
      activeDriversQuery.isRefetching ||
      availableVehiclesQuery.isRefetching,
    
    // Error
    error,
    
    // Refresh function
    refresh: () => {
      // statsQuery.refetch();
      activeDriversQuery.refetch();
      availableVehiclesQuery.refetch();
      activeAssignmentsQuery.refetch();
      todayRostersQuery.refetch();
      notificationsQuery.refetch();
    },
  };
};