// api/create-tender.js

export default async function handler(req, res) {
  // --- 1. FORCE CORS HEADERS (The Fix) ---
  // This tells the browser "It is okay to talk to this Vercel backend"
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // --- 2. HANDLE PREFLIGHT REQUEST ---
  // Browsers send a hidden "OPTIONS" request first to check permissions.
  // We must answer "OK" to this, or the real POST request never happens.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- 3. YOUR ORIGINAL LOGIC BELOW ---
  // (I am assuming a simple structure here, adjust if you use a database)
  
  if (req.method === 'POST') {
    try {
      // Get data from the frontend
      const { title, description, attachmentUrl } = req.body;

      console.log("Received tender:", title);

      // TODO: Save to your database here (MongoDB, Postgres, Firebase, etc.)
      // For now, we just echo it back to prove it works.
      
      return res.status(200).json({ 
        message: "Success! Backend received the data.",
        receivedData: { title, description, attachmentUrl }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong on the server" });
    }
  }

  // Handle other methods
  return res.status(405).json({ error: "Method not allowed" });
}
