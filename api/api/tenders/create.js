import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- Firebase Setup (Standard Boilerplate) ---
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// --- The Handler ---
export default async function handler(req, res) {
  // 1. Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // 2. Destructure and Validate
    const { title, client, category, submissionDeadline, notes } = req.body;

    if (!title || !client) {
      return res.status(400).json({ success: false, error: "Title and Client are required" });
    }

    // 3. Create the Record
    const tenderRef = await db.collection("tenders").add({
      title,
      client,
      category: category || "General",
      // Convert string date to Firestore Timestamp or JS Date
      submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
      notes: notes || "",
      status: "Received",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. Success Response
    return res.status(200).json({
      success: true,
      tenderId: tenderRef.id,
      message: "Tender created successfully"
    });

  } catch (err) {
    console.error("Error creating tender:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
