const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

r2.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, MaxKeys: 1000 }))
  .then(r => {
    const videos = (r.Contents || [])
      .filter(f => /\.(mp4|mov|webm)$/i.test(f.Key))
      .sort((a, b) => b.Size - a.Size)
      .map(f => ({
        file: f.Key.split('/').pop(),
        size: (f.Size / 1024 / 1024).toFixed(2) + ' MB',
        date: f.LastModified.toISOString().slice(0, 10)
      }));
    console.log('R2 Video Dosyaları (büyükten küçüğe):');
    console.table(videos);
  })
  .catch(console.error);
