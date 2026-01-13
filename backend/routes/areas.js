const express = require('express');
const router = express.Router();

// Mock areas/phases data
let mockAreas = [
  {
    id: 1,
    phaseName: 'Phase A',
    phaseNumber: '1',
    expectedBlocks: 12,
    actualBlocks: 12,
    status: 'Active',
    establishedDate: '2020-03-15',
    totalArea: 25.5,
    supervisor: 'John Smith',
    healthScore: 92,
    productivity: 'High',
  },
  {
    id: 2,
    phaseName: 'Phase B',
    phaseNumber: '2',
    expectedBlocks: 8,
    actualBlocks: 8,
    status: 'Active',
    establishedDate: '2021-01-20',
    totalArea: 18.2,
    supervisor: 'Maria Garcia',
    healthScore: 88,
    productivity: 'High',
  },
  {
    id: 3,
    phaseName: 'Phase C',
    phaseNumber: '3',
    expectedBlocks: 16,
    actualBlocks: 14,
    status: 'Maintenance',
    establishedDate: '2019-08-10',
    totalArea: 32.0,
    supervisor: 'Carlos Rodriguez',
    healthScore: 75,
    productivity: 'Medium',
  },
];

// Mock blocks data
let mockBlocks = [
  {
    id: 1,
    blockName: 'Block A-1',
    blockNumber: '1',
    phaseName: 'Phase A',
    phaseNumber: '1',
    areaHectare: '5.5',
    areaAcre: '13.59',
    treesPerHectare: '136',
    totalTrees: '748',
    palmVariety: 'Tenera',
    plantingDate: '2020-03-20',
    palmAge: '3.8',
    status: 'Active',
    estimatedYield: '25.5',
    soilType: 'Loamy',
    drainage: 'Good',
    slope: 'Flat (0-2%)',
    accessibility: 'Easy Access',
  },
  {
    id: 2,
    blockName: 'Block A-2',
    blockNumber: '2',
    phaseName: 'Phase A',
    phaseNumber: '1',
    areaHectare: '4.8',
    areaAcre: '11.86',
    treesPerHectare: '136',
    totalTrees: '653',
    palmVariety: 'Tenera',
    plantingDate: '2020-04-15',
    palmAge: '3.7',
    status: 'Active',
    estimatedYield: '24.0',
    soilType: 'Sandy Loam',
    drainage: 'Good',
    slope: 'Gentle (2-5%)',
    accessibility: 'Easy Access',
  },
];

// Mock trees data
let mockTrees = [
  {
    id: 1,
    treeNumber: 'T001',
    block: 'Block A-1',
    tagType: 'QR Code',
    tagId: 'TAG-001-A1',
    diseases: ['None'],
    notes: 'Healthy palm, good yield',
    variety: 'Tenera',
    plantingDate: '2020-03-20',
    age: '3.8',
    height: '12.5',
    trunkCircumference: '180',
    status: 'Healthy',
    healthScore: '100',
    estimatedYield: '200',
  },
  {
    id: 2,
    treeNumber: 'T002',
    block: 'Block A-1',
    tagType: 'QR Code',
    tagId: 'TAG-002-A1',
    diseases: ['Ganoderma'],
    notes: 'Early stage infection detected',
    variety: 'Tenera',
    plantingDate: '2020-03-20',
    age: '3.8',
    height: '11.8',
    trunkCircumference: '165',
    status: 'Diseased',
    healthScore: '60',
    estimatedYield: '120',
  },
];

// ============================================
// AREAS/PHASES ROUTES
// ============================================

// GET all areas
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let filteredAreas = [...mockAreas];

    if (status) {
      filteredAreas = filteredAreas.filter(a => a.status === status);
    }

    res.json({
      success: true,
      data: filteredAreas,
      total: filteredAreas.length,
    });
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch areas' });
  }
});

// GET area by ID
router.get('/:id', (req, res) => {
  try {
    const area = mockAreas.find(a => a.id === parseInt(req.params.id));
    if (!area) {
      return res.status(404).json({ success: false, message: 'Area not found' });
    }
    res.json({ success: true, data: area });
  } catch (error) {
    console.error('Error fetching area:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch area' });
  }
});

// POST create new area/phase
router.post('/', (req, res) => {
  try {
    const { phaseName, phaseNumber, expectedBlocks, status, establishedDate } = req.body;

    if (!phaseName || !phaseNumber) {
      return res.status(400).json({ success: false, message: 'Phase name and number are required' });
    }

    const newArea = {
      id: Date.now(),
      phaseName,
      phaseNumber,
      expectedBlocks: parseInt(expectedBlocks) || 0,
      actualBlocks: 0,
      status: status || 'Development',
      establishedDate: establishedDate || new Date().toISOString().split('T')[0],
      totalArea: 0,
      supervisor: '',
      healthScore: 0,
      productivity: 'N/A',
    };

    mockAreas.push(newArea);

    res.status(201).json({
      success: true,
      message: 'Area created successfully',
      data: newArea,
    });
  } catch (error) {
    console.error('Error creating area:', error);
    res.status(500).json({ success: false, message: 'Failed to create area' });
  }
});

// PUT update area/phase
router.put('/:id', (req, res) => {
  try {
    const index = mockAreas.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Area not found' });
    }

    mockAreas[index] = { ...mockAreas[index], ...req.body };
    res.json({
      success: true,
      message: 'Area updated successfully',
      data: mockAreas[index],
    });
  } catch (error) {
    console.error('Error updating area:', error);
    res.status(500).json({ success: false, message: 'Failed to update area' });
  }
});

// DELETE area/phase
router.delete('/:id', (req, res) => {
  try {
    const index = mockAreas.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Area not found' });
    }

    mockAreas.splice(index, 1);
    res.json({ success: true, message: 'Area deleted successfully' });
  } catch (error) {
    console.error('Error deleting area:', error);
    res.status(500).json({ success: false, message: 'Failed to delete area' });
  }
});

// ============================================
// BLOCKS ROUTES
// ============================================

// GET all blocks
router.get('/blocks/all', (req, res) => {
  try {
    const { phaseName, status } = req.query;
    let filteredBlocks = [...mockBlocks];

    if (phaseName) {
      filteredBlocks = filteredBlocks.filter(b => b.phaseName === phaseName);
    }
    if (status) {
      filteredBlocks = filteredBlocks.filter(b => b.status === status);
    }

    res.json({
      success: true,
      data: filteredBlocks,
      total: filteredBlocks.length,
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blocks' });
  }
});

// GET blocks by area ID
router.get('/:id/blocks', (req, res) => {
  try {
    const area = mockAreas.find(a => a.id === parseInt(req.params.id));
    if (!area) {
      return res.status(404).json({ success: false, message: 'Area not found' });
    }

    const blocks = mockBlocks.filter(b => b.phaseName === area.phaseName);
    res.json({
      success: true,
      data: blocks,
      total: blocks.length,
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blocks' });
  }
});

// POST create new block
router.post('/blocks', (req, res) => {
  try {
    const {
      blockName,
      blockNumber,
      phaseName,
      phaseNumber,
      areaHectare,
      areaAcre,
      treesPerHectare,
      totalTrees,
      palmVariety,
      plantingDate,
      palmAge,
      status,
      estimatedYield,
      soilType,
      drainage,
      slope,
      accessibility,
    } = req.body;

    if (!blockName || !blockNumber || !phaseName) {
      return res.status(400).json({ success: false, message: 'Block name, number, and phase are required' });
    }

    const newBlock = {
      id: Date.now(),
      blockName,
      blockNumber,
      phaseName,
      phaseNumber: phaseNumber || '',
      areaHectare: areaHectare || '0',
      areaAcre: areaAcre || '0',
      treesPerHectare: treesPerHectare || '0',
      totalTrees: totalTrees || '0',
      palmVariety: palmVariety || '',
      plantingDate: plantingDate || '',
      palmAge: palmAge || '0',
      status: status || 'Development',
      estimatedYield: estimatedYield || '0',
      soilType: soilType || '',
      drainage: drainage || '',
      slope: slope || '',
      accessibility: accessibility || '',
    };

    mockBlocks.push(newBlock);

    // Update area's actual blocks count
    const areaIndex = mockAreas.findIndex(a => a.phaseName === phaseName);
    if (areaIndex !== -1) {
      mockAreas[areaIndex].actualBlocks += 1;
      mockAreas[areaIndex].totalArea += parseFloat(areaHectare) || 0;
    }

    res.status(201).json({
      success: true,
      message: 'Block created successfully',
      data: newBlock,
    });
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(500).json({ success: false, message: 'Failed to create block' });
  }
});

// GET block by ID
router.get('/blocks/:id', (req, res) => {
  try {
    const block = mockBlocks.find(b => b.id === parseInt(req.params.id));
    if (!block) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }
    res.json({ success: true, data: block });
  } catch (error) {
    console.error('Error fetching block:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch block' });
  }
});

// PUT update block
router.put('/blocks/:id', (req, res) => {
  try {
    const index = mockBlocks.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    const oldBlock = mockBlocks[index];
    mockBlocks[index] = { ...mockBlocks[index], ...req.body };

    // Update area's total area if hectare changed
    if (req.body.areaHectare && req.body.areaHectare !== oldBlock.areaHectare) {
      const areaIndex = mockAreas.findIndex(a => a.phaseName === oldBlock.phaseName);
      if (areaIndex !== -1) {
        mockAreas[areaIndex].totalArea -= parseFloat(oldBlock.areaHectare) || 0;
        mockAreas[areaIndex].totalArea += parseFloat(req.body.areaHectare) || 0;
      }
    }

    res.json({
      success: true,
      message: 'Block updated successfully',
      data: mockBlocks[index],
    });
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json({ success: false, message: 'Failed to update block' });
  }
});

// DELETE block
router.delete('/blocks/:id', (req, res) => {
  try {
    const index = mockBlocks.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    const deletedBlock = mockBlocks[index];
    mockBlocks.splice(index, 1);

    // Update area's actual blocks count and total area
    const areaIndex = mockAreas.findIndex(a => a.phaseName === deletedBlock.phaseName);
    if (areaIndex !== -1) {
      mockAreas[areaIndex].actualBlocks = Math.max(0, mockAreas[areaIndex].actualBlocks - 1);
      mockAreas[areaIndex].totalArea -= parseFloat(deletedBlock.areaHectare) || 0;
    }

    res.json({ success: true, message: 'Block deleted successfully' });
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ success: false, message: 'Failed to delete block' });
  }
});

// ============================================
// TREES ROUTES
// ============================================

// GET all trees
router.get('/trees/all', (req, res) => {
  try {
    const { block, status } = req.query;
    let filteredTrees = [...mockTrees];

    if (block) {
      filteredTrees = filteredTrees.filter(t => t.block === block);
    }
    if (status) {
      filteredTrees = filteredTrees.filter(t => t.status === status);
    }

    res.json({
      success: true,
      data: filteredTrees,
      total: filteredTrees.length,
    });
  } catch (error) {
    console.error('Error fetching trees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trees' });
  }
});

// GET trees by block name
router.get('/blocks/:blockName/trees', (req, res) => {
  try {
    const trees = mockTrees.filter(t => t.block === req.params.blockName);
    res.json({
      success: true,
      data: trees,
      total: trees.length,
    });
  } catch (error) {
    console.error('Error fetching trees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trees' });
  }
});

// GET tree by ID
router.get('/trees/:id', (req, res) => {
  try {
    const tree = mockTrees.find(t => t.id === parseInt(req.params.id));
    if (!tree) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }
    res.json({ success: true, data: tree });
  } catch (error) {
    console.error('Error fetching tree:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tree' });
  }
});

// POST create new tree
router.post('/trees', (req, res) => {
  try {
    const {
      treeNumber,
      block,
      tagType,
      tagId,
      diseases,
      notes,
      variety,
      plantingDate,
      age,
      height,
      trunkCircumference,
      status,
      healthScore,
      estimatedYield,
    } = req.body;

    if (!treeNumber || !block) {
      return res.status(400).json({ success: false, message: 'Tree number and block are required' });
    }

    const newTree = {
      id: Date.now(),
      treeNumber,
      block,
      tagType: tagType || '',
      tagId: tagId || '',
      diseases: Array.isArray(diseases) ? diseases : (diseases ? [diseases] : ['None']),
      notes: notes || '',
      variety: variety || '',
      plantingDate: plantingDate || '',
      age: age || '0',
      height: height || '',
      trunkCircumference: trunkCircumference || '',
      status: status || 'Healthy',
      healthScore: healthScore || '100',
      estimatedYield: estimatedYield || '0',
    };

    mockTrees.push(newTree);

    res.status(201).json({
      success: true,
      message: 'Tree added successfully',
      data: newTree,
    });
  } catch (error) {
    console.error('Error adding tree:', error);
    res.status(500).json({ success: false, message: 'Failed to add tree' });
  }
});

// PUT update tree
router.put('/trees/:id', (req, res) => {
  try {
    const index = mockTrees.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }

    // Handle diseases array
    if (req.body.diseases && !Array.isArray(req.body.diseases)) {
      req.body.diseases = [req.body.diseases];
    }

    mockTrees[index] = { ...mockTrees[index], ...req.body };
    res.json({
      success: true,
      message: 'Tree updated successfully',
      data: mockTrees[index],
    });
  } catch (error) {
    console.error('Error updating tree:', error);
    res.status(500).json({ success: false, message: 'Failed to update tree' });
  }
});

// DELETE tree
router.delete('/trees/:id', (req, res) => {
  try {
    const index = mockTrees.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }

    mockTrees.splice(index, 1);
    res.json({ success: true, message: 'Tree deleted successfully' });
  } catch (error) {
    console.error('Error deleting tree:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tree' });
  }
});

module.exports = router;

