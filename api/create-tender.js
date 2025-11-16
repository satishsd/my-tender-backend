// api/create-tender.js
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configure Firebase Admin from Vercel's Environment Variables
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix newlines
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// The API Handler
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { clientName, title, category, submissionDeadline, notes } = request.body;

    if (!clientName || !title || !category || !submissionDeadline) {
      return response.status(400).json({ message: 'Missing required fields.' });
    }

    const newTender = {
      clientName,
      title,
      category,
      submissionDeadline,
      notes: notes || '',
      status: 'Received / New',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('tenders').add(newTender);

    return response.status(201).json({ 
      message: 'Tender created successfully', 
      tenderId: docRef.id 
    });

  } catch (error) {
    console.error('Error creating tender:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
}
