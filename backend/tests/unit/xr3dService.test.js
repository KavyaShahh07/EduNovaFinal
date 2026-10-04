/**
 * Unit Tests for EduNova XR 3D Image-to-3D Generation Service & Providers
 */

const Hunyuan3DProvider = require('../../services/xr3d/Hunyuan3DProvider');
const MockImageTo3DProvider = require('../../services/xr3d/MockImageTo3DProvider');

describe('XR 3D Image-to-3D Provider & License Verification', () => {
  test('Hunyuan3DProvider preserves Tencent Non-Commercial License information', () => {
    const provider = new Hunyuan3DProvider();
    expect(provider.name).toBe('hunyuan3d-2.1');

    const license = provider.getLicenseNotice();
    expect(license).toContain('TENCENT HUNYUAN NON-COMMERCIAL LICENSE AGREEMENT');
    expect(license).toContain('non-commercial academic/educational purposes');
  });

  test('MockImageTo3DProvider behaves as development fallback only', async () => {
    const mockProvider = new MockImageTo3DProvider();
    expect(mockProvider.name).toBe('mock-development-provider');

    const shapeResult = await mockProvider.generateShape({ imageUrl: '/uploads/sample.png', jobId: 'asset-123' });
    expect(shapeResult.isDevelopmentMock).toBe(true);
    expect(shapeResult.provider).toBe('mock-development-provider');

    const textureResult = await mockProvider.generateTexture({ jobId: 'asset-123', shapeData: shapeResult });
    expect(textureResult.isDevelopmentMock).toBe(true);

    const glbResult = await mockProvider.generateGLB({ jobId: 'asset-123', textureData: textureResult });
    expect(glbResult.isDevelopmentMock).toBe(true);
    expect(glbResult.modelUrl).toContain('.glb');
  });
});
