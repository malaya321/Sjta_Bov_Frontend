// src/services/supervisor.service.ts
import api from '../api/axiosInstance';
import { Alert } from 'react-native';

// Types that match your existing data structures
export interface Driver {
  id: string;
  name: string;
  status: 'Available' | 'In Shift' | 'Break' | 'Off Duty';
  rating: string;
  trips: number;
  phone?: string;
  email?: string;
  zone?: string;
  currentVehicle?: string;
  lastActive?: string;
}

export interface Vehicle {
  id: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Reserved';
  type: 'AC' | 'Non-AC' | 'Electric';
  capacity: string;
  currentDriver?: string;
  location?: string;
  lastMaintenance?: string;
  fuelLevel?: number;
}

export interface RosterEntry {
  id: string;
  driverName: string;
  vehicleName: string;
  shiftTime: string;
  rosterType: 'Regular' | 'Extra' | 'Emergency' | 'Training';
  supervisorName: string;
  zoneName: string;
  rosterDate: string;
  status: 'Active' | 'Completed' | 'Scheduled' | 'Cancelled';
  vehicleOperationalStatus: 'Operational' | 'Maintenance' | 'Out of Service' | 'Reserved';
  startTime?: string;
  endTime?: string;
  route?: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  driverId: string;
  driverName: string;
  bov: string;
  time: string;
  status: 'Active' | 'Completed' | 'Pending';
  route: string;
  location: string;
  estimatedEnd?: string;
  passengerCount?: number;
}

export interface SupervisorStats {
  activeDrivers: number;
  availableBovs: number;
  activeAssignments: number;
  pendingRequests: number;
  totalDrivers: number;
  totalVehicles: number;
  completedTrips: number;
  lateCheckins: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  driverId?: string;
  vehicleId?: string;
}

class SupervisorService {
  private readonly baseUrl = '/supervisor';

  // ==================== DASHBOARD & STATS ====================

  /**
   * GET: Get all dashboard statistics
   */
  // async getDashboardStats(date?: string): Promise<{
  //   success: boolean;
  //   data: SupervisorStats;
  // }> {
  //   try {
  //     console.log('📊 Fetching dashboard stats');
      
  //     const params: any = {};
  //     if (date) params.date = date;
  //     return
  //     const response = await api.get(`/dashboard/stats`, { params });
  //     console.log('✅ Dashboard stats received');
      
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('❌ Dashboard stats error:', error);
  //     throw error;
  //   }
  // }

  // ==================== DRIVER MANAGEMENT ====================

  /**
   * GET: Get all drivers with optional filters
   */
  async getDrivers(params?: {
    status?: 'Available' | 'In Shift' | 'Break' | 'Off Duty';
    zone?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: any;
    available_vehicles:any;
    available_drivers:any;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      // console.log('👤 Fetching drivers list');
      
      const response = await api.post('/get-available-resources', {});
      // console.log(`✅ Received ${response.data?.data?.length || 0} drivers`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get drivers error:', error);
      throw error;
    }
  }

  
  async getAvailableVehicles(){
    try {
      // console.log('🚗 Fetching available vehicles');
      //  return
      // const response = await api.get(`${this.baseUrl}/vehicles/available`);
      // console.log(`✅ Received ${response.data?.data?.length || 0} available vehicles`);
      
      // return response.data;
    } catch (error: any) {
      console.error('❌ Get available vehicles error:', error);
      throw error;
    }
  }

  
  async getTodayRosters(): Promise<{
    success: boolean;
    status:any;
    data: any;
  }> {
    try {
    //   console.log("hello");
      
      const response = await api.get(`/roster/supervisor/current`);
      // console.log(`✅ Received ${response?.data} today's rosters +++`);
      
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get today rosters error:', error);
      throw error;
    }
  }

  
  async reassignDriver(payload:any): Promise<{
    success: boolean;
    message: string;
    data: RosterEntry;
  }> {
    try {
      // console.log(`Reassigning driver for roster: ${JSON.stringify(payload)}`);
      // const apiPayload=JSON.stringify(payload)
      // return;
      const response = await api.post(`roster/mapping/edit`, payload);
      
      // console.log('✅ Driver reassigned successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Reassign driver error:', error);
      throw error;
    }
  }

  /**
   * POST: Reassign vehicle
   */
  async reassignVehicle(payload:any): Promise<{
    success: boolean;
    message: string;
    data: RosterEntry;
  }> {
    try {
      // console.log(`🔄 Reassigning vehicle for roster: ${JSON.stringify(payload)}`);
      
      const response = await api.post(`roster/mapping/edit`, payload);
      
      // console.log('✅ Vehicle reassigned successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Reassign vehicle error:', error);
      throw error;
    }
  }

  async getActiveAssignments()
  // : Promise<{
  //   success: boolean;
  //   data: Assignment[];
  // }> 
  {
    try {
      // console.log('📋 Fetching active assignments');
       return
      const response = await api.get(`${this.baseUrl}/assignments/active`);
      // console.log(`✅ Received ${response.data?.data?.length || 0} active assignments`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get active assignments error:', error);
      throw error;
    }
  }

  
  async getNotifications(
    params?: {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }
)
// : Promise<{
//     success: boolean;
//     data: Notification[];
//     unreadCount: number;
//     pagination: {
//       total: number;
//       page: number;
//       limit: number;
//     };
//   }> 
  {
    try {
      // console.log('🔔 Fetching notifications');
       return
      const response = await api.get(`${this.baseUrl}/notifications`, { });
      // console.log(`✅ Received ${response.data?.data?.length || 0} notifications`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get notifications error:', error);
      throw error;
    }
  }

  
  async search(query: string, type?: 'drivers' | 'vehicles' | 'all')
  // : Promise<{
  //   success: boolean;
  //   data: {
  //     drivers?: Driver[];
  //     vehicles?: Vehicle[];
  //     rosters?: RosterEntry[];
  //   };
  // }> 
  {
    try {
      // console.log(`🔍 Searching for: ${query}`);
      
      const params: any = { query };
      if (type) params.type = type;
       return
      const response = await api.get(`${this.baseUrl}/search`, { params });
      // console.log('✅ Search results received');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Search error:', error);
      throw error;
    }
  }

  // ==================== REPORTS ====================

 
  formatDate(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Handle API errors with user feedback
   */
  private handleError(error: any, defaultMessage: string): void {
    const errorMessage = error.response?.data?.message || error.message || defaultMessage;
    Alert.alert('Error', errorMessage);
  }
}

// Export singleton instance
export default new SupervisorService();