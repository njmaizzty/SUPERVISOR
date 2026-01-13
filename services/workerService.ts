import { API_BASE_URL } from '@/config/api';

const WORKERS_API = `${API_BASE_URL}/workers`;

export interface Worker {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  skills: string[];
  location: string;
  remarks: string;
  status: string;
  availability: string;
  hoursWorked: number;
  tasksCompleted: number;
  currentTasks: number;
  joinDate: string;
  rating: number;
  department?: string;
  lastActive?: string;
}

export interface CreateWorkerPayload {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  skills?: string;
  location?: string;
  remarks?: string;
}

export interface UpdateWorkerPayload {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  skills?: string | string[];
  location?: string;
  remarks?: string;
  status?: string;
  availability?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

// GET all workers
export const fetchWorkers = async (params?: {
  status?: string;
  availability?: string;
  location?: string;
}): Promise<ApiResponse<Worker[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.availability) queryParams.append('availability', params.availability);
    if (params?.location) queryParams.append('location', params.location);

    const url = queryParams.toString() ? `${WORKERS_API}?${queryParams}` : WORKERS_API;
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

// GET worker by ID
export const fetchWorker = async (id: number): Promise<ApiResponse<Worker>> => {
  try {
    const response = await fetch(`${WORKERS_API}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch worker');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch worker error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// CREATE worker
export const createWorker = async (payload: CreateWorkerPayload): Promise<ApiResponse<Worker>> => {
  try {
    const response = await fetch(WORKERS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create worker');
    }

    return await response.json();
  } catch (error) {
    console.error('Create worker error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// UPDATE worker
export const updateWorker = async (id: number, payload: UpdateWorkerPayload): Promise<ApiResponse<Worker>> => {
  try {
    const response = await fetch(`${WORKERS_API}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update worker');
    }

    return await response.json();
  } catch (error) {
    console.error('Update worker error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// DELETE worker
export const deleteWorker = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${WORKERS_API}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete worker');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete worker error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

