/**
 * EduNova Hunyuan3D-2.1 Provider Implementation
 * Official Repository: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
 * 
 * LICENSE NOTICE:
 * This provider integration uses Tencent Hunyuan3D-2.1 (Hunyuan3D-Shape-2.1 & Hunyuan3D-Paint-2.1).
 * Usage is subject to the TENCENT HUNYUAN NON-COMMERCIAL LICENSE AGREEMENT.
 * Commercial deployment requires explicit Tencent license review and authorization.
 */

const ImageTo3DProvider = require('./ImageTo3DProvider');
const fs = require('fs');
const path = require('path');

class Hunyuan3DProvider extends ImageTo3DProvider {
  constructor() {
    super('hunyuan3d-2.1');
    this.apiUrl = process.env.HUNYUAN3D_API_URL || 'http://localhost:8000';
    this.apiKey = process.env.HUNYUAN3D_API_KEY || '';
    this.timeout = parseInt(process.env.HUNYUAN3D_TIMEOUT || '300000', 10);
    this.licenseNotice = 'TENCENT HUNYUAN NON-COMMERCIAL LICENSE AGREEMENT';
  }

  getLicenseNotice() {
    return 'TENCENT HUNYUAN NON-COMMERCIAL LICENSE AGREEMENT - Strictly for non-commercial academic/educational purposes.';
  }

  async generateShape({ imageUrl, options = {} }) {
    if (!this.apiUrl) {
      throw new Error('HUNYUAN3D_API_URL environment variable is not configured.');
    }

    const payload = {
      image_url: imageUrl,
      shape_model: 'Hunyuan3D-Shape-2.1',
      octree_resolution: options.resolution || 256,
      num_inference_steps: options.steps || 30,
      license_accepted: true
    };

    const response = await fetch(`${this.apiUrl}/api/v1/generate-shape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Hunyuan3D Shape generation failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      jobId: data.job_id || data.id,
      shapeMeshUrl: data.shape_mesh_url,
      provider: this.name,
      licenseNotice: this.licenseNotice
    };
  }

  async generateTexture({ jobId, shapeMeshUrl, imageUrl, options = {} }) {
    const payload = {
      job_id: jobId,
      shape_mesh_url: shapeMeshUrl,
      image_url: imageUrl,
      paint_model: 'Hunyuan3D-Paint-2.1',
      texture_resolution: options.textureRes || 1024,
      generate_pbr_maps: true
    };

    const response = await fetch(`${this.apiUrl}/api/v1/generate-texture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Hunyuan3D Paint texture generation failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      jobId: data.job_id || jobId,
      texturedGlbUrl: data.glb_url,
      thumbnailUrl: data.thumbnail_url
    };
  }

  async generateGLB(input) {
    const shapeResult = await this.generateShape(input);
    const textureResult = await this.generateTexture({
      jobId: shapeResult.jobId,
      shapeMeshUrl: shapeResult.shapeMeshUrl,
      imageUrl: input.imageUrl,
      options: input.options
    });

    return {
      modelUrl: textureResult.texturedGlbUrl,
      thumbnailUrl: textureResult.thumbnailUrl,
      provider: this.name,
      licenseNotice: this.licenseNotice
    };
  }

  async getStatus(jobId) {
    const response = await fetch(`${this.apiUrl}/api/v1/jobs/${jobId}`, {
      headers: {
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve Hunyuan3D job status: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      jobId: data.id,
      status: data.status, // QUEUED, PROCESSING, TEXTURING, COMPLETED, FAILED
      stage: data.stage_description || data.status,
      progressPercent: data.progress_percent || 0,
      modelUrl: data.result_glb_url,
      errorMessage: data.error
    };
  }

  async cancel(jobId) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        }
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
}

module.exports = Hunyuan3DProvider;
