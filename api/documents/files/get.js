import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { fileId } = req.query;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'fileId is required',
      });
    }

    const fileDoc = await db.collection('files').doc(fileId).get();

    if (!fileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    return res.status(200).json({
      success: true,
      file: { id: fileDoc.id, ...fileDoc.data() },
    });
  } catch (err) {
    console.error('Error getting file:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
