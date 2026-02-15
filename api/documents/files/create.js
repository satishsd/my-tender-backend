import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { name, tenderId, folderId, fileUrl, fileType, fileSize, revision, description } = req.body;

    if (!name || !tenderId) {
      return res.status(400).json({
        success: false,
        error: 'File name and tenderId are required',
      });
    }

    // Validate folder exists if folderId is provided
    if (folderId) {
      const folderDoc = await db.collection('folders').doc(folderId).get();
      if (!folderDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Target folder not found',
        });
      }
    }

    const fileRef = await db.collection('files').add({
      name,
      tenderId,
      folderId: folderId || null,
      fileUrl: fileUrl || null,
      fileType: fileType || null,
      fileSize: fileSize || null,
      revision: revision || 1,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      fileId: fileRef.id,
      message: 'File record created successfully',
    });
  } catch (err) {
    console.error('Error creating file record:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
