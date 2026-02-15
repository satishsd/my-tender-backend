import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

/**
 * Recursively collects all document refs to delete for a folder and its contents.
 */
async function collectRefsToDelete(folderId, refs) {
  // Collect file refs in this folder
  const filesSnapshot = await db
    .collection('files')
    .where('folderId', '==', folderId)
    .get();
  filesSnapshot.docs.forEach((doc) => refs.push(doc.ref));

  // Recurse into subfolders
  const subfoldersSnapshot = await db
    .collection('folders')
    .where('parentId', '==', folderId)
    .get();

  for (const doc of subfoldersSnapshot.docs) {
    await collectRefsToDelete(doc.id, refs);
  }

  // Collect the folder ref itself
  refs.push(db.collection('folders').doc(folderId));
}

/**
 * Recursively deletes a folder and all its subfolders and files using batched writes.
 */
async function deleteFolderRecursive(folderId) {
  const refs = [];
  await collectRefsToDelete(folderId, refs);

  // Firestore batches are limited to 500 operations
  const batchSize = 500;
  for (let i = 0; i < refs.length; i += batchSize) {
    const batch = db.batch();
    refs.slice(i, i + batchSize).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
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
