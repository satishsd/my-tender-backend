import { db } from '../../_utils/firebase.js';
import { handleCors } from '../../_utils/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { fileId } = req.body;

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

    await fileRef.delete();

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting file:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
