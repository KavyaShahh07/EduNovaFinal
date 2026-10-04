/**
 * EduNova XR Studio & 3D Asset Routes
 * Base path: /api/xr
 */

const express = require('express');
const router = express.Router();
const xrController = require('../controllers/xrController');
const { requireAuth } = require('../middleware/auth');
const { uploadMediaAndFiles } = require('../middleware/uploadMiddleware');

// All XR endpoints require authentication
router.use(requireAuth);

// Asset Collection & Creation
router.post('/3d-assets', uploadMediaAndFiles('image'), xrController.create3DAsset);
router.get('/3d-assets', xrController.list3DAssets);

// Admin platform stats for 3D generation
router.get('/3d-assets/admin-stats', xrController.getAdmin3DStats);

// Single Asset Operations
router.get('/3d-assets/:id', xrController.get3DAsset);
router.post('/3d-assets/:id/cancel', xrController.cancel3DAsset);
router.delete('/3d-assets/:id', xrController.delete3DAsset);
router.post('/3d-assets/:id/regenerate', xrController.regenerate3DAsset);

module.exports = router;
