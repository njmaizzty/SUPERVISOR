import { API_BASE_URL } from '@/config/api';

const TREES_API = `${API_BASE_URL}/areas/trees`;

export interface Tree {
  id: number;
  treeNumber: string;
  block: string;
  tagType: string;
  tagId: string;
  diseases: string[];
  notes: string;
  variety: string;
  plantingDate: string;
  age: string;
  height: string;
  trunkCircumference: string;
  status: string;
  healthScore: string;
  estimatedYield: string;
}

export interface CreateTreePayload {
  treeNumber: string;
  block: string;
  tagType?: string;
  tagId?: string;
  diseases?: string[];
  notes?: string;
  variety?: string;
  plantingDate?: string;
  age?: string;
  height?: string;
  trunkCircumference?: string;
  status?: string;
  healthScore?: string;
  estimatedYield?: string;
}

export interface UpdateTreePayload extends Partial<CreateTreePayload> {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

// GET all trees
export const fetchTrees = async (params?: {
  block?: string;
  status?: string;
}): Promise<ApiResponse<Tree[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.block) queryParams.append('block', params.block);
    if (params?.status) queryParams.append('status', params.status);

    const url = queryParams.toString() ? `${TREES_API}/all?${queryParams}` : `${TREES_API}/all`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch trees');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch trees error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// GET tree by ID
export const fetchTree = async (id: number): Promise<ApiResponse<Tree>> => {
  try {
    const response = await fetch(`${TREES_API}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tree');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch tree error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// CREATE tree
export const createTree = async (payload: CreateTreePayload): Promise<ApiResponse<Tree>> => {
  try {
    const response = await fetch(TREES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create tree');
    }

    return await response.json();
  } catch (error) {
    console.error('Create tree error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// UPDATE tree
export const updateTree = async (id: number, payload: UpdateTreePayload): Promise<ApiResponse<Tree>> => {
  try {
    const response = await fetch(`${TREES_API}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update tree');
    }

    return await response.json();
  } catch (error) {
    console.error('Update tree error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// DELETE tree
export const deleteTree = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${TREES_API}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete tree');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete tree error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

