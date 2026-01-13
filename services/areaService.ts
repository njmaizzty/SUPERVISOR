import { API_BASE_URL } from '@/config/api';

const AREAS_API = `${API_BASE_URL}/areas`;

export interface Area {
  id: number;
  phaseName: string;
  phaseNumber: string;
  expectedBlocks: number;
  actualBlocks: number;
  status: string;
  establishedDate: string;
  totalArea?: number;
  supervisor?: string;
  healthScore?: number;
  productivity?: string;
}

export interface CreateAreaPayload {
  phaseName: string;
  phaseNumber: string;
  expectedBlocks?: number;
  status?: string;
  establishedDate?: string;
}

export interface UpdateAreaPayload extends Partial<CreateAreaPayload> {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

// GET all areas
export const fetchAreas = async (params?: {
  status?: string;
}): Promise<ApiResponse<Area[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    const url = queryParams.toString() ? `${AREAS_API}?${queryParams}` : AREAS_API;
    const response = await fetch(url);

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

// GET area by ID
export const fetchArea = async (id: number): Promise<ApiResponse<Area>> => {
  try {
    const response = await fetch(`${AREAS_API}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch area');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch area error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// CREATE area
export const createArea = async (payload: CreateAreaPayload): Promise<ApiResponse<Area>> => {
  try {
    const response = await fetch(AREAS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create area');
    }

    return await response.json();
  } catch (error) {
    console.error('Create area error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// UPDATE area
export const updateArea = async (id: number, payload: UpdateAreaPayload): Promise<ApiResponse<Area>> => {
  try {
    const response = await fetch(`${AREAS_API}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update area');
    }

    return await response.json();
  } catch (error) {
    console.error('Update area error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// DELETE area
export const deleteArea = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${AREAS_API}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete area');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete area error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

