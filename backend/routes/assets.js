const express = require('express');
const router = express.Router();

// Mock assets data
let mockAssets = [
  {
    id: 1,
    assetName: 'John Deere Tractor 5075E',
    assetId: 'AST-001',
    assetType: 'Machinery',
    category: 'Field Equipment',
    status: 'Active',
    manufacturer: 'John Deere',
    model: '5075E',
    year: '2022',
    serialNumber: 'JD5075E-2022-001',
    location: 'Block A',
    purchaseDate: '2022-03-15',
    purchasePrice: '45000',
    efficiency: '92%',
    currentValue: 38000,
    lastMaintenance: '2024-11-15',
    nextMaintenance: '2024-12-15',
    workHours: 1250,
    condition: 'Excellent',
    assignedTo: 'Carlos Rodriguez',
  },
  {
    id: 2,
    assetName: 'Irrigation Controller Pro',
    assetId: 'AST-002',
    assetType: 'Electrical',
    category: 'Field Equipment',
    status: 'Active',
    manufacturer: 'AquaTech',
    model: 'IC-Pro-2024',
    year: '2024',
    serialNumber: 'AT-ICP-2024-002',
    location: 'Block B',
    purchaseDate: '2024-01-20',
    purchasePrice: '8500',
    efficiency: '98%',
    currentValue: 7800,
    lastMaintenance: '2024-10-30',
    nextMaintenance: '2024-12-30',
    workHours: 2400,
    condition: 'Excellent',
    assignedTo: 'Maria Garcia',
  },
  {
    id: 3,
    assetName: 'Fertilizer Spreader XL',
    assetId: 'AST-003',
    assetType: 'Machinery',
    category: 'Field Equipment',
    status: 'Maintenance Required',
    manufacturer: 'FarmSpread',
    model: 'FS-XL-500',
    year: '2021',
    serialNumber: 'FS-XL-2021-003',
    location: 'Block C',
    purchaseDate: '2021-05-10',
    purchasePrice: '12000',
    efficiency: '85%',
    currentValue: 8500,
    lastMaintenance: '2024-09-20',
    nextMaintenance: '2024-11-30',
    workHours: 850,
    condition: 'Good',
    assignedTo: 'Carlos Rodriguez',
  },
];

// GET all assets
router.get('/', (req, res) => {
  try {
    const { status, category, location } = req.query;
    let filteredAssets = [...mockAssets];

    if (status) {
      filteredAssets = filteredAssets.filter(a => a.status === status);
    }
    if (category) {
      filteredAssets = filteredAssets.filter(a => a.category === category);
    }
    if (location) {
      filteredAssets = filteredAssets.filter(a => a.location === location);
    }

    res.json({
      success: true,
      data: filteredAssets,
      total: filteredAssets.length,
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assets' });
  }
});

// GET asset by ID
router.get('/:id', (req, res) => {
  try {
    const asset = mockAssets.find(a => a.id === parseInt(req.params.id));
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch asset' });
  }
});

// POST create new asset
router.post('/', (req, res) => {
  try {
    const {
      assetName,
      assetId,
      assetType,
      category,
      status,
      manufacturer,
      model,
      year,
      serialNumber,
      location,
      purchaseDate,
      purchasePrice,
      efficiency,
    } = req.body;

    if (!assetName || !assetId) {
      return res.status(400).json({ success: false, message: 'Asset name and ID are required' });
    }

    const newAsset = {
      id: mockAssets.length + 1,
      assetName,
      assetId,
      assetType: assetType || 'Machinery',
      category: category || 'Field Equipment',
      status: status || 'Active',
      manufacturer: manufacturer || '',
      model: model || '',
      year: year || new Date().getFullYear().toString(),
      serialNumber: serialNumber || '',
      location: location || 'Block A',
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: purchasePrice || '0',
      efficiency: efficiency || '100%',
      currentValue: parseFloat(purchasePrice) || 0,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: '',
      workHours: 0,
      condition: 'New',
      assignedTo: '',
    };

    mockAssets.push(newAsset);

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: newAsset,
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ success: false, message: 'Failed to create asset' });
  }
});

// PUT update asset
router.put('/:id', (req, res) => {
  try {
    const index = mockAssets.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    mockAssets[index] = { ...mockAssets[index], ...req.body };
    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: mockAssets[index],
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ success: false, message: 'Failed to update asset' });
  }
});

// DELETE asset
router.delete('/:id', (req, res) => {
  try {
    const index = mockAssets.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    mockAssets.splice(index, 1);
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ success: false, message: 'Failed to delete asset' });
  }
});

module.exports = router;

