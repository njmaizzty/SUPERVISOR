import { API_BASE_URL } from '@/config/api';

const TASKS_API = `${API_BASE_URL}/tasks`;

// Types
export interface Task {
  id: number;
  title: string;
  description: string;
  task_type: string;
  task_subtype: string | null;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  assigned_to_id: number | null;
  assigned_to_name: string | null;
  start_date: string;
  end_date: string;
  progress: number;
  area_id: number | null;
  area_name: string | null;
  asset_id: number | null;
  asset_name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: number;
  name: string;
  expertise: string[];
  availability: string;
  experience: number;
  suitability_score: number;
  current_tasks: string[];
}

export interface Area {
  id: number;
  name: string;
  description: string;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  taskType: string;
  taskSubtype?: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedToId?: number;
  assignedToName?: string;
  startDate: string;
  endDate: string;
  areaId?: number;
  areaName?: string;
  assetId?: number;
  assetName?: string;
  createdBy?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

// ============ FETCH ALL TASKS ============
export const fetchTasks = async (params?: {
  status?: string;
  priority?: string;
  area?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<Task[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.area) queryParams.append('area', params.area);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${TASKS_API}?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ FETCH SINGLE TASK ============
export const fetchTask = async (id: number): Promise<ApiResponse<Task>> => {
  try {
    const response = await fetch(`${TASKS_API}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch task error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ CREATE TASK ============
export const createTask = async (payload: CreateTaskPayload): Promise<ApiResponse<Task>> => {
  try {
    const response = await fetch(TASKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create task error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ UPDATE TASK ============
export const updateTask = async (id: number, payload: Partial<CreateTaskPayload>): Promise<ApiResponse<Task>> => {
  try {
    const response = await fetch(`${TASKS_API}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update task error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ DELETE TASK ============
export const deleteTask = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${TASKS_API}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete task error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ ASSIGN TASK ============
export const assignTask = async (taskId: number, workerId: number, workerName: string): Promise<ApiResponse<Task>> => {
  try {
    const response = await fetch(`${TASKS_API}/${taskId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workerId, workerName }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to assign task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Assign task error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ UPDATE TASK STATUS ============
export const updateTaskStatus = async (
  id: number, 
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled',
  progress?: number
): Promise<ApiResponse<Task>> => {
  try {
    const response = await fetch(`${TASKS_API}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, progress }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ GET RECOMMENDED WORKERS ============
export const fetchRecommendedWorkers = async (taskType?: string): Promise<ApiResponse<Worker[]>> => {
  try {
    const url = taskType 
      ? `${TASKS_API}/workers/recommend?taskType=${encodeURIComponent(taskType)}`
      : `${TASKS_API}/workers/recommend`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch workers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch workers error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ GET ALL WORKERS ============
export const fetchWorkers = async (): Promise<ApiResponse<Worker[]>> => {
  try {
    const response = await fetch(`${TASKS_API}/data/workers`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch workers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch workers error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ GET ALL AREAS ============
export const fetchAreas = async (): Promise<ApiResponse<Area[]>> => {
  try {
    const response = await fetch(`${TASKS_API}/data/areas`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch areas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch areas error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ============ GET ALL ASSETS ============
export const fetchAssets = async (): Promise<ApiResponse<Asset[]>> => {
  try {
    const response = await fetch(`${TASKS_API}/data/assets`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch assets');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch assets error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

