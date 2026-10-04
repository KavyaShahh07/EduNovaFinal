/**
 * XR & 3D Asset Controller for EduNova
 * Controls 3D generation requests, status polling, listing, cancellation, deletion, and regeneration.
 * Ensures IDOR protection, input validation, and user ownership checks.
 */

const xr3dService = require('../services/xr3d/xr3dService');
const path = require('path');
const fs = require('fs');

/**
 * Handle creation of new Image -> 3D Generation request
 */
async function create3DAsset(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to create 3D assets.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a valid reference image (JPG, PNG, or WEBP).',
      });
    }

    // Validate MIME type strictly for image-to-3D
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMime.includes(req.file.mimetype)) {
      // Clean up uploaded un-supported file
      if (fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        error: 'Unsupported image format. Please upload a JPEG, PNG, or WebP image.',
      });
    }

    const originalImageUrl = `/uploads/${path.basename(req.file.path)}`;
    const { title, description, subjectId, topicId, generationType } = req.body;

    const newAsset = await xr3dService.createGenerationJob({
      userId,
      originalImageUrl,
      title: title || req.file.originalname || 'Educational 3D Object',
      description: description || '',
      subjectId: subjectId || null,
      topicId: topicId || null,
      options: { generationType: generationType || 'image_to_3d' },
    });

    return res.status(201).json({
      success: true,
      message: '3D Generation job queued successfully.',
      asset: newAsset,
    });
  } catch (error) {
    console.error('[XRController] Error creating 3D asset:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to start 3D generation.',
    });
  }
}

/**
 * Get status/details of a specific 3D asset
 */
async function get3DAsset(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const asset = await xr3dService.getAssetById(id, userId);

    return res.json({
      success: true,
      asset,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to retrieve asset.',
    });
  }
}

/**
 * List generated 3D assets for the authenticated user
 */
async function list3DAssets(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    const assets = await xr3dService.getUserAssets(userId);

    return res.json({
      success: true,
      assets,
    });
  } catch (error) {
    console.error('[XRController] Error listing 3D assets:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve 3D model library.',
    });
  }
}

/**
 * Cancel a pending/processing 3D asset job
 */
async function cancel3DAsset(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const cancelledAsset = await xr3dService.cancelJob(id, userId);

    return res.json({
      success: true,
      message: 'Generation job cancelled successfully.',
      asset: cancelledAsset,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to cancel 3D asset generation.',
    });
  }
}

/**
 * Delete a user's 3D asset
 */
async function delete3DAsset(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const deletedAsset = await xr3dService.deleteAsset(id, userId);

    return res.json({
      success: true,
      message: '3D asset deleted successfully.',
      id: deletedAsset.id,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to delete 3D asset.',
    });
  }
}

/**
 * Regenerate an existing 3D asset
 */
async function regenerate3DAsset(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const regeneratedAsset = await xr3dService.regenerateAsset(id, userId);

    return res.json({
      success: true,
      message: 'Regeneration job started successfully.',
      asset: regeneratedAsset,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to restart 3D asset generation.',
    });
  }
}

/**
 * Get platform-wide admin statistics for 3D assets
 */
async function getAdmin3DStats(req, res) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Administrator privileges required.',
      });
    }

    const stats = await xr3dService.getAdminStats();
    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin stats.',
    });
  }
}

module.exports = {
  create3DAsset,
  get3DAsset,
  list3DAssets,
  cancel3DAsset,
  delete3DAsset,
  regenerate3DAsset,
  getAdmin3DStats,
};
