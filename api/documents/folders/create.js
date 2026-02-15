import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { name, parentId, tenderId } = req.body;

    if (!name || !tenderId) {
      return res.status(400).json({
        success: false,
        error: 'Folder name and tenderId are required',
      });
    }

    // Validate parent folder exists if parentId is provided
    if (parentId) {
      const parentDoc = await db.collection('folders').doc(parentId).get();
      if (!parentDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Parent folder not found',
        });
      }
    }

    // Build the path for breadcrumb navigation
    let path = '/';
    if (parentId) {
      const parentDoc = await db.collection('folders').doc(parentId).get();
      const parentData = parentDoc.data();
      path = `${parentData.path}${parentData.name}/`;
    }

    const folderRef = await db.collection('folders').add({
      name,
      parentId: parentId || null,
      tenderId,
      path,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      folderId: folderRef.id,
      message: 'Folder created successfully',
    });
  } catch (err) {
    console.error('Error creating folder:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
