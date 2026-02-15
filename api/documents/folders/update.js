import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { folderId, name } = req.body;

    if (!folderId || !name) {
      return res.status(400).json({
        success: false,
        error: 'folderId and name are required',
      });
    }

    const folderRef = db.collection('folders').doc(folderId);
    const folderDoc = await folderRef.get();

    if (!folderDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }

    await folderRef.update({
      name,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: 'Folder updated successfully',
    });
  } catch (err) {
    console.error('Error updating folder:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
