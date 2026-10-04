/**
 * EduNova Image-To-3D AI Provider Abstraction Interface
 * Defines standard contract for single/multi-image to textured GLB 3D reconstruction.
 */

class ImageTo3DProvider {
  constructor(name = 'base') {
    this.name = name;
  }

  /**
   * Generate 3D geometry shape mesh from reference image(s)
   * @param {Object} input - { imageUrl, extraImages, options }
   * @returns {Promise<Object>} - { shapeData, jobRef }
   */
  async generateShape(input) {
    throw new Error('generateShape() must be implemented by Provider subclass.');
  }

  /**
   * Generate PBR material texture maps for the generated 3D shape
   * @param {Object} input - { shapeData, options }
   * @returns {Promise<Object>} - { textureData, pbrMaps }
   */
  async generateTexture(input) {
    throw new Error('generateTexture() must be implemented by Provider subclass.');
  }

  /**
   * Package geometry shape and PBR textures into final binary GLB 3D asset
   * @param {Object} input - { shapeData, textureData, title, metadata }
   * @returns {Promise<Object>} - { modelUrl, thumbnailUrl, glbBuffer }
   */
  async generateGLB(input) {
    throw new Error('generateGLB() must be implemented by Provider subclass.');
  }

  /**
   * Query status of an asynchronous 3D generation job
   * @param {string} jobId 
   * @returns {Promise<Object>} - { status, stage, progressPercent, errorMessage }
   */
  async getStatus(jobId) {
    throw new Error('getStatus() must be implemented by Provider subclass.');
  }

  /**
   * Cancel an in-flight generation job
   * @param {string} jobId 
   * @returns {Promise<boolean>}
   */
  async cancel(jobId) {
    throw new Error('cancel() must be implemented by Provider subclass.');
  }
}

module.exports = ImageTo3DProvider;
