/**
 * EduNova Cloud & Local Media Storage Adapter Service
 * Handles uploading files (videos, PDFs, images) seamlessly.
 * Supports local filesystem storage in dev/test mode and S3/Cloudinary in production.
 */

const fs = require('fs');
const path = require('path');

class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(this.uploadDir)) {
      try {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      } catch (err) {
        console.warn('Upload directory creation error:', err.message);
      }
    }
  }

  /**
   * Upload file buffer or stream to cloud/local storage
   * @param {Object} file - Express multer file object
   * @param {String} folder - Subfolder destination (e.g. 'materials', 'videos', 'avatars')
   * @returns {Promise<{ url: String, filename: String, storageType: String }>}
   */
  async uploadFile(file, folder = 'general') {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const hasS3Config = process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID;
    const hasCloudinaryConfig = process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

    // 1. AWS S3 Production Adapter
    if (isProduction && hasS3Config) {
      try {
        // AWS S3 SDK standard execution if available
        const AWS = require('aws-sdk');
        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1'
        });

        const key = `${folder}/${Date.now()}_${path.basename(file.originalname || file.filename || 'file')}`;
        const params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: file.buffer || fs.readFileSync(file.path),
          ContentType: file.mimetype || 'application/octet-stream',
          ACL: 'public-read'
        };

        const result = await s3.upload(params).promise();
        return {
          url: result.Location,
          filename: key,
          storageType: 'S3'
        };
      } catch (err) {
        console.warn('S3 upload failed, falling back to local file storage:', err.message);
      }
    }

    // 2. Cloudinary Production Adapter
    if (isProduction && hasCloudinaryConfig) {
      try {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const res = await cloudinary.uploader.upload(file.path || file.buffer, {
          folder: `edunova/${folder}`,
          resource_type: 'auto'
        });

        return {
          url: res.secure_url,
          filename: res.public_id,
          storageType: 'CLOUDINARY'
        };
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to local storage:', err.message);
      }
    }

    // 3. Robust Local File System Storage (Development & Fallback)
    const targetFolder = path.join(this.uploadDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const uniqueName = `${Date.now()}_${path.basename(file.originalname || file.filename || 'file').replace(/\s+/g, '_')}`;
    const destinationPath = path.join(targetFolder, uniqueName);

    if (file.buffer) {
      fs.writeFileSync(destinationPath, file.buffer);
    } else if (file.path && fs.existsSync(file.path) && file.path !== destinationPath) {
      fs.copyFileSync(file.path, destinationPath);
    }

    const relativeUrl = `/uploads/${folder}/${uniqueName}`;
    return {
      url: relativeUrl,
      filename: uniqueName,
      storageType: 'LOCAL'
    };
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileUrl) {
    if (!fileUrl) return false;
    try {
      if (fileUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', fileUrl);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          return true;
        }
      }
    } catch (err) {
      console.warn('Error deleting file:', err.message);
    }
    return false;
  }
}

module.exports = new StorageService();
