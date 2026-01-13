import { API_BASE_URL } from '@/config/api';

const BLOCKS_API = `${API_BASE_URL}/areas/blocks`;

export interface Block {
  id: number;
  blockName: string;
  blockNumber: string;
  phaseName: string;
  phaseNumber: string;
  areaHectare: string;
  areaAcre: string;
  treesPerHectare: string;
  totalTrees: string;
  palmVariety: string;
  plantingDate: string;
  palmAge: string;
  status: string;
  estimatedYield: string;
  soilType: string;
  drainage: string;
  slope: string;
  accessibility: string;
}

export interface CreateBlockPayload {
  blockName: string;
  blockNumber: string;
  phaseName: string;
  phaseNumber?: string;
  areaHectare?: string;
  areaAcre?: string;
  treesPerHectare?: string;
  totalTrees?: string;
  palmVariety?: string;
  plantingDate?: string;
  palmAge?: string;
  status?: string;
  estimatedYield?: string;
  soilType?: string;
  drainage?: string;
  slope?: string;
  accessibility?: string;
}

export interface UpdateBlockPayload extends Partial<CreateBlockPayload> {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

// GET all blocks
export const fetchBlocks = async (params?: {
  phaseName?: string;
  status?: string;
}): Promise<ApiResponse<Block[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.phaseName) queryParams.append('phaseName', params.phaseName);
    if (params?.status) queryParams.append('status', params.status);

    const url = queryParams.toString() ? `${BLOCKS_API}/all?${queryParams}` : `${BLOCKS_API}/all`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch blocks');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch blocks error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// GET block by ID
export const fetchBlock = async (id: number): Promise<ApiResponse<Block>> => {
  try {
    const response = await fetch(`${BLOCKS_API}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch block');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch block error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// CREATE block
export const createBlock = async (payload: CreateBlockPayload): Promise<ApiResponse<Block>> => {
  try {
    const response = await fetch(BLOCKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create block');
    }

    return await response.json();
  } catch (error) {
    console.error('Create block error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// UPDATE block
export const updateBlock = async (id: number, payload: UpdateBlockPayload): Promise<ApiResponse<Block>> => {
  try {
    const response = await fetch(`${BLOCKS_API}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update block');
    }

    return await response.json();
  } catch (error) {
    console.error('Update block error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// DELETE block
export const deleteBlock = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${BLOCKS_API}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete block');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete block error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

