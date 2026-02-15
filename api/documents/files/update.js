import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { fileId, name, folderId, fileUrl, fileType, fileSize, revision, description } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'fileId is required',
      });
    }

    const fileRef = db.collection('files').doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    // Validate target folder if moving to a different folder
    if (folderId) {
      const folderDoc = await db.collection('folders').doc(folderId).get();
      if (!folderDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Target folder not found',
        });
      }
    }

    // Build update object with only provided fields
    const updates = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (folderId !== undefined) updates.folderId = folderId;
    if (fileUrl !== undefined) updates.fileUrl = fileUrl;
    if (fileType !== undefined) updates.fileType = fileType;
    if (fileSize !== undefined) updates.fileSize = fileSize;
    if (revision !== undefined) updates.revision = revision;
    if (description !== undefined) updates.description = description;

    await fileRef.update(updates);

    return res.status(200).json({
      success: true,
      message: 'File updated successfully',
    });
  } catch (err) {
    console.error('Error updating file:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
