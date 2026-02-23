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

/**
 * Hook to get dashboard statistics
 */
export const useSupervisorStats = (date?: string, options?: UseQueryOptions<SupervisorStats>) => {
  return useQuery({
    queryKey: supervisorKeys.stats(),
    queryFn: async () => {
      const response = await supervisorService.getDashboardStats(date);
      if (!response.success) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.data;
    },
    ...options,
  });
};

// ==================== DRIVER HOOKS ====================

/**
 * Hook to get all drivers with filters
 */
export const useDrivers = (params?: {
  status?: 'Available' | 'In Shift' | 'Break' | 'Off Duty';
  zone?: string;
  search?: string;
  page?: number;
  limit?: number;
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

/**
 * Hook to get available drivers
 */
export const useAvailableDrivers = () => {
  return useQuery({
    queryKey: supervisorKeys.availableDrivers(),
    queryFn: async () => {
      const response = await supervisorService.getAvailableDrivers();
      if (!response.success) {
        throw new Error('Failed to fetch available drivers');
      }
      return response.data;
    },
  });
};

/**
 * Hook to get active drivers
 */
export const useActiveDrivers = () => {
  return useQuery({
    queryKey: supervisorKeys.activeDrivers(),
    queryFn: async () => {
      const response = await supervisorService.getActiveDrivers();
      if (!response.success) {
        throw new Error('Failed to fetch active drivers');
      }
      return response.data;
    },
  });
};

/**
 * Hook to get driver details
 */
export const useDriverDetails = (driverId: string) => {
  return useQuery({
    queryKey: supervisorKeys.driverDetails(driverId),
    queryFn: async () => {
      const response = await supervisorService.getDriverDetails(driverId);
      if (!response.success) {
        throw new Error('Failed to fetch driver details');
      }
      return response.data;
    },
    enabled: !!driverId,
  });
};

// ==================== VEHICLE HOOKS ====================

/**
 * Hook to get all vehicles with filters
 */
export const useVehicles = (params?: {
  status?: 'Available' | 'In Use' | 'Maintenance' | 'Reserved';
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...supervisorKeys.vehicles(), params],
    queryFn: async () => {
      const response = await supervisorService.getVehicles(params);
      if (!response.success) {
        throw new Error('Failed to fetch vehicles');
      }
      return response;
    },
  });
};

/**
 * Hook to get available vehicles
 */
export const useAvailableVehicles = () => {
  return useQuery({
    queryKey: supervisorKeys.availableVehicles(),
    queryFn: async () => {
      const response = await supervisorService.getAvailableVehicles();
      if (!response.success) {
        throw new Error('Failed to fetch available vehicles');
      }
      return response.data;
    },
  });
};

/**
 * Hook to get maintenance vehicles
 */
export const useMaintenanceVehicles = () => {
  return useQuery({
    queryKey: supervisorKeys.maintenanceVehicles(),
    queryFn: async () => {
      const response = await supervisorService.getMaintenanceVehicles();
      if (!response.success) {
        throw new Error('Failed to fetch maintenance vehicles');
      }
      return response.data;
    },
  });
};

/**
 * Hook to get vehicle details
 */
export const useVehicleDetails = (vehicleId: string) => {
  return useQuery({
    queryKey: supervisorKeys.vehicleDetails(vehicleId),
    queryFn: async () => {
      const response = await supervisorService.getVehicleDetails(vehicleId);
      if (!response.success) {
        throw new Error('Failed to fetch vehicle details');
      }
      return response.data;
    },
    enabled: !!vehicleId,
  });
};

// ==================== ROSTER HOOKS ====================

/**
 * Hook to get all rosters
 */
export const useRosters = (params?: {
  date?: string;
  status?: 'Active' | 'Completed' | 'Scheduled' | 'Cancelled';
  zone?: string;
  supervisor?: string;
  driverId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...supervisorKeys.rosters(), params],
    queryFn: async () => {
      const response = await supervisorService.getRosters(params);
      if (!response.success) {
        throw new Error('Failed to fetch rosters');
      }
      return response;
    },
  });
};

/**
 * Hook to get today's rosters
 */
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

/**
 * Hook to get active rosters
 */
export const useActiveRosters = () => {
  return useQuery({
    queryKey: supervisorKeys.activeRosters(),
    queryFn: async () => {
      const response = await supervisorService.getActiveRosters();
      if (!response.success) {
        throw new Error('Failed to fetch active rosters');
      }
      return response.data;
    },
  });
};

// ==================== ASSIGNMENT HOOKS ====================

/**
 * Hook to get all assignments
 */
export const useAssignments = (params?: {
  status?: 'Active' | 'Completed' | 'Pending';
  driverId?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: [...supervisorKeys.assignments(), params],
    queryFn: async () => {
      const response = await supervisorService.getAssignments(params);
      if (!response.success) {
        throw new Error('Failed to fetch assignments');
      }
      return response.data;
    },
  });
};

/**
 * Hook to get active assignments
 */
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
 * Hook to create a new roster
 */
export const useCreateRoster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rosterData: Partial<RosterEntry>) => 
      supervisorService.createRoster(rosterData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: supervisorKeys.rosters() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.todayRosters() });
      
      Alert.alert('Success', 'Roster created successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create roster');
    },
  });
};

/**
 * Hook to update a roster
 */
export const useUpdateRoster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rosterId, data }: { rosterId: string; data: Partial<RosterEntry> }) =>
      supervisorService.updateRoster(rosterId, data),
    onSuccess: (data, variables) => {
      // Invalidate specific roster and list queries
      queryClient.invalidateQueries({ 
        queryKey: supervisorKeys.rosterDetails(variables.rosterId) 
      });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.rosters() });
      
      Alert.alert('Success', 'Roster updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update roster');
    },
  });
};

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
      driver_id: string; 
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
      queryClient.invalidateQueries({ 
        queryKey: supervisorKeys.rosterDetails(variables.rosterId) 
      });
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
      queryClient.invalidateQueries({ 
        queryKey: supervisorKeys.rosterDetails(variables.rosterId) 
      });
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

/**
 * Hook to create a new assignment
 */
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentData: {
      driverId: string;
      vehicleId: string;
      route?: string;
      notes?: string;
    }) => supervisorService.createAssignment(assignmentData),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: supervisorKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.activeAssignments() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.drivers() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.vehicles() });
      
      Alert.alert('Success', 'Assignment created successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create assignment');
    },
  });
};

/**
 * Hook to update an assignment
 */
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      data 
    }: { 
      assignmentId: string; 
      data: Partial<Assignment>;
    }) => supervisorService.updateAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supervisorKeys.assignments() });
      Alert.alert('Success', 'Assignment updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update assignment');
    },
  });
};

/**
 * Hook to complete an assignment
 */
export const useCompleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      completionData 
    }: { 
      assignmentId: string; 
      completionData?: { endLocation?: string; notes?: string };
    }) => supervisorService.completeAssignment(assignmentId, completionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supervisorKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.activeAssignments() });
      Alert.alert('Success', 'Assignment completed successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to complete assignment');
    },
  });
};

/**
 * Hook to unassign vehicle (cancel assignment)
 */
export const useUnassignVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason: string }) =>
      supervisorService.unassignVehicle(assignmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supervisorKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.activeAssignments() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.vehicles() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.availableVehicles() });
      
      Alert.alert('Success', 'Vehicle unassigned successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to unassign vehicle');
    },
  });
};

/**
 * Hook to cancel a roster
 */
export const useCancelRoster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rosterId, reason }: { rosterId: string; reason: string }) =>
      supervisorService.cancelRoster(rosterId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supervisorKeys.rosters() });
      queryClient.invalidateQueries({ queryKey: supervisorKeys.activeRosters() });
      Alert.alert('Success', 'Roster cancelled successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to cancel roster');
    },
  });
};

/**
 * Hook to mark notification as read
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      supervisorService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supervisorKeys.notifications() });
    },
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => supervisorService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supervisorKeys.notifications() });
    },
  });
};

// ==================== COMBINED HOOK FOR SUPERVISOR DASHBOARD ====================

/**
 * Combined hook for supervisor dashboard that fetches all necessary data
 */
export const useSupervisorDashboard = (date?: string) => {
  const statsQuery = useSupervisorStats(date);
  const activeDriversQuery = useDrivers();
  const availableVehiclesQuery = useAvailableVehicles();
  const activeAssignmentsQuery = useActiveAssignments();
  const todayRostersQuery = useTodayRosters();
  const notificationsQuery = useNotifications({ unreadOnly: true });

  const isLoading = 
    statsQuery.isLoading ||
    activeDriversQuery.isLoading ||
    availableVehiclesQuery.isLoading ||
    activeAssignmentsQuery.isLoading ||
    todayRostersQuery.isLoading;

  const error = 
    statsQuery.error ||
    activeDriversQuery.error ||
    availableVehiclesQuery.error ||
    activeAssignmentsQuery.error ||
    todayRostersQuery.error;

  return {
    // Data
    stats: statsQuery.data,
    activeDrivers: activeDriversQuery.data,
    availableVehicles: availableVehiclesQuery.data,
    activeAssignments: activeAssignmentsQuery.data,
    todayRosters: todayRostersQuery,
    unreadNotifications: notificationsQuery.data?.unreadCount || 0,
    
    // Loading states
    isLoading,
    isRefreshing: 
      statsQuery.isRefetching ||
      activeDriversQuery.isRefetching ||
      availableVehiclesQuery.isRefetching,
    
    // Error
    error,
    
    // Refresh function
    refresh: () => {
      statsQuery.refetch();
      activeDriversQuery.refetch();
      availableVehiclesQuery.refetch();
      activeAssignmentsQuery.refetch();
      todayRostersQuery.refetch();
      notificationsQuery.refetch();
    },
  };
};