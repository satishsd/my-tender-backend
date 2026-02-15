import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

/**
 * Recursively deletes a folder and all its subfolders and files.
 */
async function deleteFolderRecursive(folderId) {
  // Delete all files in this folder
  const filesSnapshot = await db
    .collection('files')
    .where('folderId', '==', folderId)
    .get();

  const fileDeletions = filesSnapshot.docs.map((doc) => doc.ref.delete());

  // Find and recursively delete all subfolders
  const subfoldersSnapshot = await db
    .collection('folders')
    .where('parentId', '==', folderId)
    .get();

  const subfolderDeletions = subfoldersSnapshot.docs.map((doc) =>
    deleteFolderRecursive(doc.id)
  );

  await Promise.all([...fileDeletions, ...subfolderDeletions]);

  // Delete the folder itself
  await db.collection('folders').doc(folderId).delete();
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: 'folderId is required',
      });
    }

    const folderDoc = await db.collection('folders').doc(folderId).get();
    if (!folderDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }

    await deleteFolderRecursive(folderId);

    return res.status(200).json({
      success: true,
      message: 'Folder and all contents deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting folder:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
