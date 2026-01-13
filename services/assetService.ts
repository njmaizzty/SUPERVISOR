import { API_BASE_URL } from '@/config/api';

const ASSETS_API = `${API_BASE_URL}/assets`;

export interface Asset {
  id: number;
  assetName: string;
  assetId: string;
  assetType: string;
  category: string;
  status: string;
  manufacturer: string;
  model: string;
  year: string;
  serialNumber: string;
  location: string;
  purchaseDate: string;
  purchasePrice: string;
  efficiency: string;
  currentValue?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  workHours?: number;
  condition?: string;
  assignedTo?: string;
}

export interface CreateAssetPayload {
  assetName: string;
  assetId: string;
  assetType?: string;
  category?: string;
  status?: string;
  manufacturer?: string;
  model?: string;
  year?: string;
  serialNumber?: string;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  efficiency?: string;
}

export interface UpdateAssetPayload extends Partial<CreateAssetPayload> {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

// GET all assets
export const fetchAssets = async (params?: {
  status?: string;
  category?: string;
  location?: string;
}): Promise<ApiResponse<Asset[]>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.location) queryParams.append('location', params.location);

    const url = queryParams.toString() ? `${ASSETS_API}?${queryParams}` : ASSETS_API;
    const response = await fetch(url);

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

// GET asset by ID
export const fetchAsset = async (id: number): Promise<ApiResponse<Asset>> => {
  try {
    const response = await fetch(`${ASSETS_API}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch asset');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch asset error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// CREATE asset
export const createAsset = async (payload: CreateAssetPayload): Promise<ApiResponse<Asset>> => {
  try {
    const response = await fetch(ASSETS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create asset');
    }

    return await response.json();
  } catch (error) {
    console.error('Create asset error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// UPDATE asset
export const updateAsset = async (id: number, payload: UpdateAssetPayload): Promise<ApiResponse<Asset>> => {
  try {
    const response = await fetch(`${ASSETS_API}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update asset');
    }

    return await response.json();
  } catch (error) {
    console.error('Update asset error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// DELETE asset
export const deleteAsset = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${ASSETS_API}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete asset');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete asset error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

