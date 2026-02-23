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
  async getDashboardStats(date?: string): Promise<{
    success: boolean;
    data: SupervisorStats;
  }> {
    try {
      console.log('📊 Fetching dashboard stats');
      
      const params: any = {};
      if (date) params.date = date;
      return
      const response = await api.get(`/dashboard/stats`, { params });
      console.log('✅ Dashboard stats received');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Dashboard stats error:', error);
      throw error;
    }
  }

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
    data: Driver[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('👤 Fetching drivers list');
      
      const response = await api.post('/get-available-resources', {});
      console.log(`✅ Received ${response.data?.data?.length || 0} drivers`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get drivers error:', error);
      throw error;
    }
  }

  /**
   * GET: Get available drivers (status = 'Available')
   */
  async getAvailableDrivers(): Promise<{
    success: boolean;
    data: Driver[];
  }> {
    try {
      console.log('👤 Fetching available drivers');
      return
      const response = await api.get(`${this.baseUrl}/drivers/available`);
      console.log(`✅ Received ${response.data?.data?.length || 0} available drivers`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get available drivers error:', error);
      throw error;
    }
  }

  /**
   * GET: Get active drivers (currently in shift)
   */
  async getActiveDrivers(): Promise<{
    success: boolean;
    data: Driver[];
  }> {
    try {
      console.log('👤 Fetching active drivers');
      return
      const response = await api.get(`${this.baseUrl}/drivers/active`);
      console.log(`✅ Received ${response.data?.data?.length || 0} active drivers`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get active drivers error:', error);
      throw error;
    }
  }

  /**
   * GET: Get single driver details
   */
  async getDriverDetails(driverId: string): Promise<{
    success: boolean;
    data: Driver & {
      assignments: Assignment[];
      attendance: any;
      performance: any;
    };
  }> {
    try {
      console.log(`👤 Fetching driver details: ${driverId}`);
       return
      const response = await api.get(`${this.baseUrl}/drivers/${driverId}`);
      console.log('✅ Driver details received');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get driver details error:', error);
      throw error;
    }
  }

  // ==================== VEHICLE MANAGEMENT ====================

  /**
   * GET: Get all vehicles with optional filters
   */
  async getVehicles(params?: {
    status?: 'Available' | 'In Use' | 'Maintenance' | 'Reserved';
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: Vehicle[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('🚗 Fetching vehicles list');
       return
      const response = await api.get(`${this.baseUrl}/vehicles`, { params });
      console.log(`✅ Received ${response.data?.data?.length || 0} vehicles`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get vehicles error:', error);
      throw error;
    }
  }

  /**
   * GET: Get available vehicles (status = 'Available')
   */
  async getAvailableVehicles(): Promise<{
    success: boolean;
    data: Vehicle[];
  }> {
    try {
      console.log('🚗 Fetching available vehicles');
       return
      const response = await api.get(`${this.baseUrl}/vehicles/available`);
      console.log(`✅ Received ${response.data?.data?.length || 0} available vehicles`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get available vehicles error:', error);
      throw error;
    }
  }

  /**
   * GET: Get vehicles in maintenance
   */
  async getMaintenanceVehicles(): Promise<{
    success: boolean;
    data: Vehicle[];
  }> {
    try {
      console.log('🚗 Fetching maintenance vehicles');
       return
      const response = await api.get(`${this.baseUrl}/vehicles/maintenance`);
      console.log(`✅ Received ${response.data?.data?.length || 0} maintenance vehicles`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get maintenance vehicles error:', error);
      throw error;
    }
  }

  /**
   * GET: Get single vehicle details
   */
  async getVehicleDetails(vehicleId: string): Promise<{
    success: boolean;
    data: Vehicle & {
      assignments: Assignment[];
      maintenanceHistory: any[];
      fuelHistory: any[];
    };
  }> {
    try {
      console.log(`🚗 Fetching vehicle details: ${vehicleId}`);
       return
      const response = await api.get(`${this.baseUrl}/vehicles/${vehicleId}`);
      console.log('✅ Vehicle details received');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get vehicle details error:', error);
      throw error;
    }
  }

  // ==================== ROSTER MANAGEMENT ====================

  /**
   * GET: Get all roster entries
   */
  async getRosters(params?: {
    date?: string;
    status?: 'Active' | 'Completed' | 'Scheduled' | 'Cancelled';
    zone?: string;
    supervisor?: string;
    driverId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: RosterEntry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('📋 Fetching rosters');
       return
      const response = await api.get('/roste', { params });
      console.log(`✅ Received ${response.data?.data?.length || 0} rosters`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get rosters error:', error);
      throw error;
    }
  }

  /**
   * GET: Get today's rosters
   */
  async getTodayRosters(): Promise<{
    success: boolean;
    data: RosterEntry[];
  }> {
    try {
    //   console.log("hello");
      
      const response = await api.get(`/roster/supervisor/current`);
      console.log(`✅ Received ${response?.data} today's rosters +++`);
      
      return response?.data;
    } catch (error: any) {
      console.error('❌ Get today rosters error:', error);
      throw error;
    }
  }

  /**
   * GET: Get active rosters
   */
  async getActiveRosters(): Promise<{
    success: boolean;
    data: RosterEntry[];
  }> {
    try {
      console.log('📋 Fetching active rosters');
       return
      const response = await api.get(`/roster/supervisor/current`);
      console.log(`✅ Received ${response.data?.data?.length || 0} active rosters`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get active rosters error:', error);
      throw error;
    }
  }

  /**
   * POST: Create a new roster
   */
  async createRoster(rosterData: Partial<RosterEntry>): Promise<{
    success: boolean;
    data: RosterEntry;
    message: string;
  }> {
    try {
      console.log('📋 Creating new roster');
       return
      const response = await api.post(`${this.baseUrl}/rosters`, rosterData);
      console.log('✅ Roster created successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Create roster error:', error);
      throw error;
    }
  }

  /**
   * PUT: Update roster
   */
  async updateRoster(rosterId: string, rosterData: Partial<RosterEntry>): Promise<{
    success: boolean;
    data: RosterEntry;
    message: string;
  }> {
    try {
      console.log(`📋 Updating roster: ${rosterId}`);
       return
      const response = await api.put(`${this.baseUrl}/rosters/${rosterId}`, rosterData);
      console.log('✅ Roster updated successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Update roster error:', error);
      throw error;
    }
  }

  /**
   * POST: Reassign driver
   */
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
      
      console.log('✅ Driver reassigned successfully');
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
      console.log(`🔄 Reassigning vehicle for roster: ${JSON.stringify(payload)}`);
      
      const response = await api.post(`roster/mapping/edit`, payload);
      
      console.log('✅ Vehicle reassigned successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Reassign vehicle error:', error);
      throw error;
    }
  }

  /**
   * DELETE: Cancel roster
   */
  async cancelRoster(rosterId: string, reason: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log(`🗑️ Cancelling roster: ${rosterId}`);
       return
      const response = await api.delete(`${this.baseUrl}/rosters/${rosterId}`, {
        data: { reason }
      });
      
      console.log('✅ Roster cancelled successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Cancel roster error:', error);
      throw error;
    }
  }

  // ==================== ASSIGNMENT MANAGEMENT ====================

  /**
   * GET: Get all assignments
   */
  async getAssignments(params?: {
    status?: 'Active' | 'Completed' | 'Pending';
    driverId?: string;
    date?: string;
  }): Promise<{
    success: boolean;
    data: Assignment[];
  }> {
    try {
      console.log('📋 Fetching assignments');
       return
      const response = await api.get(`${this.baseUrl}/assignments`, { params });
      console.log(`✅ Received ${response.data?.data?.length || 0} assignments`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get assignments error:', error);
      throw error;
    }
  }

  /**
   * GET: Get active assignments
   */
  async getActiveAssignments(): Promise<{
    success: boolean;
    data: Assignment[];
  }> {
    try {
      console.log('📋 Fetching active assignments');
       return
      const response = await api.get(`${this.baseUrl}/assignments/active`);
      console.log(`✅ Received ${response.data?.data?.length || 0} active assignments`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get active assignments error:', error);
      throw error;
    }
  }

  /**
   * POST: Create new assignment (assign vehicle to driver)
   */
  async createAssignment(assignmentData: {
    driverId: string;
    vehicleId: string;
    route?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: Assignment;
    message: string;
  }> {
    try {
      console.log('📋 Creating new assignment');
       return
      const response = await api.post(`${this.baseUrl}/assignments`, assignmentData);
      console.log('✅ Assignment created successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Create assignment error:', error);
      throw error;
    }
  }

  /**
   * PUT: Update assignment
   */
  async updateAssignment(assignmentId: string, updateData: Partial<Assignment>): Promise<{
    success: boolean;
    data: Assignment;
    message: string;
  }> {
    try {
      console.log(`📋 Updating assignment: ${assignmentId}`);
       return
      const response = await api.put(`${this.baseUrl}/assignments/${assignmentId}`, updateData);
      console.log('✅ Assignment updated successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Update assignment error:', error);
      throw error;
    }
  }

  /**
   * POST: Complete assignment
   */
  async completeAssignment(assignmentId: string, completionData?: {
    endLocation?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log(`✅ Completing assignment: ${assignmentId}`);
       return
      const response = await api.post(`${this.baseUrl}/assignments/${assignmentId}/complete`, completionData);
      console.log('✅ Assignment completed successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Complete assignment error:', error);
      throw error;
    }
  }

  /**
   * DELETE: Unassign vehicle (cancel assignment)
   */
  async unassignVehicle(assignmentId: string, reason: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log(`🗑️ Unassigning vehicle: ${assignmentId}`);
       return
      const response = await api.delete(`${this.baseUrl}/assignments/${assignmentId}`, {
        data: { reason }
      });
      
      console.log('✅ Vehicle unassigned successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Unassign vehicle error:', error);
      throw error;
    }
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * GET: Get notifications
   */
  async getNotifications(params?: {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: Notification[];
    unreadCount: number;
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    try {
      console.log('🔔 Fetching notifications');
       return
      const response = await api.get(`${this.baseUrl}/notifications`, { params });
      console.log(`✅ Received ${response.data?.data?.length || 0} notifications`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get notifications error:', error);
      throw error;
    }
  }

  /**
   * PATCH: Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log(`🔔 Marking notification as read: ${notificationId}`);
       return
      const response = await api.patch(`${this.baseUrl}/notifications/${notificationId}/read`);
      console.log('✅ Notification marked as read');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Mark notification error:', error);
      throw error;
    }
  }

  /**
   * PATCH: Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔔 Marking all notifications as read');
       return
      const response = await api.patch(`${this.baseUrl}/notifications/read-all`);
      console.log('✅ All notifications marked as read');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Mark all notifications error:', error);
      throw error;
    }
  }

  // ==================== SEARCH ====================

  /**
   * GET: Search drivers and vehicles
   */
  async search(query: string, type?: 'drivers' | 'vehicles' | 'all'): Promise<{
    success: boolean;
    data: {
      drivers?: Driver[];
      vehicles?: Vehicle[];
      rosters?: RosterEntry[];
    };
  }> {
    try {
      console.log(`🔍 Searching for: ${query}`);
      
      const params: any = { query };
      if (type) params.type = type;
       return
      const response = await api.get(`${this.baseUrl}/search`, { params });
      console.log('✅ Search results received');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Search error:', error);
      throw error;
    }
  }

  // ==================== REPORTS ====================

  /**
   * GET: Generate report
   */
  async generateReport(params: {
    type: 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<any> {
    try {
      console.log(`📊 Generating ${params.type} report`);
       return
      const response = await api.get(`${this.baseUrl}/reports`, {
        params,
        responseType: params.format === 'pdf' ? 'blob' : 'json'
      });
      
      console.log('✅ Report generated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Generate report error:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format date to YYYY-MM-DD
   */
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