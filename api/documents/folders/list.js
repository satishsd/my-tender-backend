import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { tenderId, parentId } = req.query;

    if (!tenderId) {
      return res.status(400).json({
        success: false,
        error: 'tenderId is required',
      });
    }

    // Fetch subfolders
    let foldersQuery = db
      .collection('folders')
      .where('tenderId', '==', tenderId)
      .where('parentId', '==', parentId || null)
      .orderBy('name', 'asc');

    const foldersSnapshot = await foldersQuery.get();
    const folders = foldersSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'folder',
      ...doc.data(),
    }));

    // Fetch files in this folder
    let filesQuery = db
      .collection('files')
      .where('tenderId', '==', tenderId)
      .where('folderId', '==', parentId || null)
      .orderBy('name', 'asc');

    const filesSnapshot = await filesQuery.get();
    const files = filesSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'file',
      ...doc.data(),
    }));

    // Build breadcrumb path
    const breadcrumbs = [];
    if (parentId) {
      let currentId = parentId;
      while (currentId) {
        const folderDoc = await db.collection('folders').doc(currentId).get();
        if (!folderDoc.exists) break;
        const folderData = folderDoc.data();
        breadcrumbs.unshift({ id: folderDoc.id, name: folderData.name });
        currentId = folderData.parentId;
      }
    }

    return res.status(200).json({
      success: true,
      breadcrumbs,
      contents: [...folders, ...files],
    });
  } catch (err) {
    console.error('Error listing folder contents:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
