/**
 * EduNova 3D Asset Generation Service Manager
 * Handles job queuing, AI provider delegation, Socket.IO status broadcasts,
 * user quota enforcement, IDOR protection, and Prisma database persistence.
 */

const prisma = require('../../config/db');
const Hunyuan3DProvider = require('./Hunyuan3DProvider');
const MockImageTo3DProvider = require('./MockImageTo3DProvider');

class XR3DService {
  constructor() {
    this.providers = new Map();
    this.providers.set('hunyuan', new Hunyuan3DProvider());
    if (process.env.NODE_ENV !== 'production') {
      this.providers.set('mock', new MockImageTo3DProvider());
    }
  }

  getProvider() {
    const defaultKey = process.env.NODE_ENV === 'production' ? 'hunyuan' : 'mock';
    const providerKey = (process.env.IMAGE_TO_3D_PROVIDER || defaultKey).toLowerCase();
    if (this.providers.has(providerKey)) {
      return this.providers.get(providerKey);
    }

    if (process.env.NODE_ENV !== 'production' && this.providers.has('mock')) {
      return this.providers.get('mock');
    }

    throw new Error(`Configured 3D provider '${providerKey}' is unavailable. Please verify IMAGE_TO_3D_PROVIDER settings.`);
  }

  /**
   * Helper to safely push Socket.IO progress event to authenticated user room
   */
  emitProgress(userId, payload) {
    try {
      const { getIO } = require('../../socket/socketServer');
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('xr:3d-generation-status', payload);
      }
    } catch (e) {
      // Socket server optional or offline fallback
    }
  }

  /**
   * Check per-user generation limits (max 10 active/pending concurrent jobs)
   */
  async checkUserQuota(userId) {
    const activeJobsCount = await prisma.generated3DAsset.count({
      where: {
        userId,
        status: { in: ['QUEUED', 'PROCESSING', 'TEXTURING'] }
      }
    });

    const maxJobs = parseInt(process.env.HUNYUAN3D_MAX_CONCURRENT_JOBS || '5', 10);
    if (activeJobsCount >= maxJobs) {
      throw new Error(`You have reached the maximum allowed concurrent 3D generation requests (${maxJobs}). Please wait for current jobs to complete.`);
    }
  }

  /**
   * Create a new Image-To-3D generation job
   */
  async createGenerationJob({ userId, originalImageUrl, title, description, subjectId, topicId, options = {} }) {
    await this.checkUserQuota(userId);

    const provider = this.getProvider();

    // 1. Create QUEUED database record
    const asset = await prisma.generated3DAsset.create({
      data: {
        userId,
        originalImageUrl,
        title: title || 'Generated 3D Object',
        description: description || 'AI Image-to-3D Reconstruction',
        subjectId: subjectId || null,
        topicId: topicId || null,
        status: 'QUEUED',
        stage: 'Uploading image & queuing job...',
        provider: provider.name,
        generationType: 'IMAGE_TO_3D',
        metadata: {
          licenseNotice: provider.licenseNotice || 'TENCENT HUNYUAN NON-COMMERCIAL LICENSE AGREEMENT',
          options
        }
      }
    });

    this.emitProgress(userId, {
      assetId: asset.id,
      status: 'QUEUED',
      stage: 'Uploading image & queuing job...',
      message: 'Your 3D generation request has been queued.'
    });

    // 2. Trigger asynchronous background generation processing
    this.processJobAsync(asset.id, userId, originalImageUrl, options).catch(err => {
      console.error(`[XR3DService] Async generation error for asset ${asset.id}:`, err.message);
    });

    return asset;
  }

  /**
   * Asynchronous generation pipeline execution
   */
  async processJobAsync(assetId, userId, originalImageUrl, options) {
    const provider = this.getProvider();

    try {
      // Stage 1: Preparing model
      await prisma.generated3DAsset.update({
        where: { id: assetId },
        data: { status: 'PROCESSING', stage: 'Preparing AI model...' }
      });
      this.emitProgress(userId, { assetId, status: 'PROCESSING', stage: 'Preparing AI model...' });

      // Stage 2: Generating 3D Shape geometry
      await prisma.generated3DAsset.update({
        where: { id: assetId },
        data: { stage: 'Generating 3D geometry shape mesh...' }
      });
      this.emitProgress(userId, { assetId, status: 'PROCESSING', stage: 'Generating 3D geometry shape mesh...' });

      // Call Provider API with local dev fallback
      let result;
      try {
        result = await provider.generateGLB({
          jobId: assetId,
          imageUrl: originalImageUrl,
          title: options.title,
          options
        });
      } catch (providerErr) {
        if (process.env.NODE_ENV !== 'production' && this.providers.has('mock')) {
          console.warn(`[XR3DService] Primary GPU provider '${provider.name}' unavailable (${providerErr.message}). Using development mock adapter.`);
          const mockProvider = this.providers.get('mock');
          result = await mockProvider.generateGLB({
            jobId: assetId,
            imageUrl: originalImageUrl,
            title: options.title,
            options
          });
        } else {
          throw providerErr;
        }
      }

      // Stage 3: Generating PBR Materials & Textures
      await prisma.generated3DAsset.update({
        where: { id: assetId },
        data: { status: 'TEXTURING', stage: 'Generating materials & texture maps...' }
      });
      this.emitProgress(userId, { assetId, status: 'TEXTURING', stage: 'Generating materials & texture maps...' });

      // Stage 4: Finalizing GLB Asset
      const updatedAsset = await prisma.generated3DAsset.update({
        where: { id: assetId },
        data: {
          status: 'COMPLETED',
          stage: 'Ready for exploration',
          generatedModelUrl: result.modelUrl,
          thumbnailUrl: result.thumbnailUrl || originalImageUrl,
          completedAt: new Date(),
          metadata: {
            provider: result.provider,
            notice: result.notice || provider.licenseNotice || 'TENCENT HUNYUAN NON-COMMERCIAL LICENSE AGREEMENT',
            isDevelopmentMock: !!result.isDevelopmentMock
          }
        }
      });

      this.emitProgress(userId, {
        assetId,
        status: 'COMPLETED',
        stage: 'Ready for exploration',
        modelUrl: updatedAsset.generatedModelUrl,
        asset: updatedAsset
      });

    } catch (error) {
      console.error(`[XR3DService] Failed generation job ${assetId}:`, error.message);
      const failedAsset = await prisma.generated3DAsset.update({
        where: { id: assetId },
        data: {
          status: 'FAILED',
          stage: 'Generation failed',
          errorMessage: '3D generation could not be completed. Your original image is safe. Please try again.'
        }
      });

      this.emitProgress(userId, {
        assetId,
        status: 'FAILED',
        stage: 'Generation failed',
        errorMessage: failedAsset.errorMessage
      });
    }
  }

  /**
   * Get 3D asset by ID with strict IDOR ownership check
   */
  async getAssetById(assetId, userId, isAdmin = false) {
    const asset = await prisma.generated3DAsset.findUnique({
      where: { id: assetId },
      include: {
        subject: { select: { id: true, name: true, category: true } },
        topic: { select: { id: true, title: true } }
      }
    });

    if (!asset) {
      throw new Error('Requested 3D asset record was not found');
    }

    if (!isAdmin && asset.userId !== userId) {
      throw new Error('Access denied: You do not have permission to access this 3D asset.');
    }

    return asset;
  }

  /**
   * List 3D assets owned by authenticated user
   */
  async getUserAssets(userId) {
    return prisma.generated3DAsset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        subject: { select: { id: true, name: true } },
        topic: { select: { id: true, title: true } }
      }
    });
  }

  /**
   * Cancel generation job
   */
  async cancelJob(assetId, userId, isAdmin = false) {
    const asset = await this.getAssetById(assetId, userId, isAdmin);

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(asset.status)) {
      return asset;
    }

    const provider = this.getProvider();
    await provider.cancel(asset.id);

    const cancelled = await prisma.generated3DAsset.update({
      where: { id: assetId },
      data: {
        status: 'CANCELLED',
        stage: 'Job cancelled by user'
      }
    });

    this.emitProgress(userId, { assetId, status: 'CANCELLED', stage: 'Job cancelled by user' });
    return cancelled;
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId, userId, isAdmin = false) {
    const asset = await this.getAssetById(assetId, userId, isAdmin);
    await prisma.generated3DAsset.delete({ where: { id: asset.id } });
    return { success: true, message: 'Generated 3D asset deleted successfully.' };
  }

  /**
   * Regenerate asset from original image
   */
  async regenerateAsset(assetId, userId, isAdmin = false) {
    const asset = await this.getAssetById(assetId, userId, isAdmin);

    return this.createGenerationJob({
      userId,
      originalImageUrl: asset.originalImageUrl,
      title: asset.title,
      description: asset.description,
      subjectId: asset.subjectId,
      topicId: asset.topicId
    });
  }

  /**
   * Get administrative platform metrics for 3D generation
   */
  async getAdminStats() {
    const total = await prisma.generated3DAsset.count();
    const completed = await prisma.generated3DAsset.count({ where: { status: 'COMPLETED' } });
    const failed = await prisma.generated3DAsset.count({ where: { status: 'FAILED' } });
    const processing = await prisma.generated3DAsset.count({ where: { status: { in: ['QUEUED', 'PROCESSING', 'TEXTURING'] } } });

    return {
      total,
      completed,
      failed,
      processing,
      provider: process.env.IMAGE_TO_3D_PROVIDER || 'hunyuan'
    };
  }
}

module.exports = new XR3DService();
