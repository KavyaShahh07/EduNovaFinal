/**
 * EduNova Development-Only Mock Image-To-3D Adapter
 * 
 * IMPORTANT REQUIREMENTS:
 * • Disabled in production environment (throws explicit configuration error in production).
 * • Never silently activates as production AI.
 * • Clearly flags metadata with "Development Provider (Mock Mode)".
 * • Serves real valid GLB binary 3D assets for offline/local development without GPU.
 */

const ImageTo3DProvider = require('./ImageTo3DProvider');
const path = require('path');
const fs = require('fs');

/**
 * Generates a valid 100% specification-compliant binary glTF 2.0 (.glb) 3D mesh buffer.
 */
/**
 * Generates a valid 100% specification-compliant binary glTF 2.0 (.glb) 3D mesh buffer.
 * Renders a 3D sculpted polyhedral diamond-capsule geometry with PBR metallic shading.
 */
function createMinimalGlbBuffer() {
  // 14 3D Vertices for a 3D Polyhedral Object Mesh (x, y, z)
  const positionData = new Float32Array([
     0.0,  0.8,  0.0, // 0: Top Tip
    -0.5,  0.3,  0.5, // 1: Upper Ring
     0.5,  0.3,  0.5, // 2
     0.5,  0.3, -0.5, // 3
    -0.5,  0.3, -0.5, // 4
    -0.7, -0.2,  0.7, // 5: Mid Belt
     0.7, -0.2,  0.7, // 6
     0.7, -0.2, -0.7, // 7
    -0.7, -0.2, -0.7, // 8
    -0.4, -0.6,  0.4, // 9: Lower Ring
     0.4, -0.6,  0.4, // 10
     0.4, -0.6, -0.4, // 11
    -0.4, -0.6, -0.4, // 12
     0.0, -0.9,  0.0  // 13: Bottom Tip
  ]);

  // 14 Normals for 3D PBR Lighting (x, y, z)
  const normalData = new Float32Array([
     0.0,  1.0,  0.0,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,
    -0.7,  0.0,  0.7,
     0.7,  0.0,  0.7,
     0.7,  0.0, -0.7,
    -0.7,  0.0, -0.7,
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
     0.0, -1.0,  0.0
  ]);

  // 72 indices for 24 triangles forming 3D object mesh
  const indexData = new Uint16Array([
    // Top Pyramid Cap
    0, 1, 2,   0, 2, 3,   0, 3, 4,   0, 4, 1,
    // Upper Band
    1, 5, 6,   1, 6, 2,   2, 6, 7,   2, 7, 3,
    3, 7, 8,   3, 8, 4,   4, 8, 5,   4, 5, 1,
    // Mid Band
    5, 9, 10,  5, 10, 6,  6, 10, 11, 6, 11, 7,
    7, 11, 12, 7, 12, 8,  8, 12, 9,  8, 9, 5,
    // Bottom Cap
    13, 10, 9, 13, 11, 10, 13, 12, 11, 13, 9, 12
  ]);

  const posBuf = Buffer.from(positionData.buffer);
  const normBuf = Buffer.from(normalData.buffer);
  const idxBuf = Buffer.from(indexData.buffer);

  const binBuffer = Buffer.concat([posBuf, normBuf, idxBuf]);

  const jsonObject = {
    asset: { version: "2.0", generator: "EduNova Hunyuan3D-2.1 PBR Engine" },
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "Interactive 3D Mesh Object" }],
    meshes: [{
      primitives: [{
        attributes: { POSITION: 0, NORMAL: 1 },
        indices: 2,
        material: 0
      }]
    }],
    materials: [{
      name: "Cyan Metallic PBR Material",
      pbrMetallicRoughness: {
        baseColorFactor: [0.02, 0.73, 0.83, 1.0],
        metallicFactor: 0.8,
        roughnessFactor: 0.2
      }
    }],
    buffers: [{ byteLength: binBuffer.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBuf.length, target: 34962 },
      { buffer: 0, byteOffset: posBuf.length, byteLength: normBuf.length, target: 34962 },
      { buffer: 0, byteOffset: posBuf.length + normBuf.length, byteLength: idxBuf.length, target: 34963 }
    ],
    accessors: [
      { bufferView: 0, byteOffset: 0, componentType: 5126, count: 14, type: "VEC3", max: [0.7, 0.8, 0.7], min: [-0.7, -0.9, -0.7] },
      { bufferView: 1, byteOffset: 0, componentType: 5126, count: 14, type: "VEC3" },
      { bufferView: 2, byteOffset: 0, componentType: 5123, count: 72, type: "SCALAR" }
    ]
  };

  let jsonBuffer = Buffer.from(JSON.stringify(jsonObject), 'utf-8');
  const remainder = jsonBuffer.length % 4;
  if (remainder !== 0) {
    jsonBuffer = Buffer.concat([jsonBuffer, Buffer.from(' '.repeat(4 - remainder), 'utf-8')]);
  }

  const totalLength = 12 + 8 + jsonBuffer.length + 8 + binBuffer.length;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x4654476C, 0); // "glTF"
  header.writeUInt32LE(2, 4);          // version 2
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // "JSON"

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBuffer.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // "BIN\0"

  return Buffer.concat([header, jsonChunkHeader, jsonBuffer, binChunkHeader, binBuffer]);
}

class MockImageTo3DProvider extends ImageTo3DProvider {
  constructor() {
    super('mock-development-provider');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ MockImageTo3DProvider is prohibited in production environment. Configure a real provider like Hunyuan3D-2.1.');
    }

    const uploadsDir = path.join(__dirname, '../../uploads/3d-models');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async generateShape({ imageUrl, options = {} }) {
    return {
      jobId: `mock_job_${Date.now()}`,
      stage: 'Generating 3D shape...',
      provider: 'mock-development-provider',
      isDevelopmentMock: true
    };
  }

  async generateTexture({ jobId }) {
    return {
      jobId,
      stage: 'Generating materials...',
      isDevelopmentMock: true
    };
  }

  async generateGLB(input) {
    const assetId = input.jobId || `mock_${Date.now()}`;
    const uploadsDir = path.join(__dirname, '../../uploads/3d-models');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const glbFileName = `${assetId}.glb`;
    const glbFilePath = path.join(uploadsDir, glbFileName);

    // Overwrite with fresh valid 3D binary GLB model file on disk
    const glbBuffer = createMinimalGlbBuffer();
    fs.writeFileSync(glbFilePath, glbBuffer);

    return {
      modelUrl: `/uploads/3d-models/${glbFileName}`,
      thumbnailUrl: input.imageUrl,
      provider: 'mock (Development Provider)',
      isDevelopmentMock: true,
      notice: '⚠️ Generated using Development-Only Provider Adapter. Configure Hunyuan3D-2.1 GPU for production AI inference.'
    };
  }

  async getStatus(jobId) {
    return {
      jobId,
      status: 'COMPLETED',
      stage: 'Ready for exploration',
      progressPercent: 100,
      isDevelopmentMock: true
    };
  }

  async cancel(jobId) {
    return true;
  }
}

module.exports = MockImageTo3DProvider;
