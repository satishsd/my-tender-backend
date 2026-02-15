/**
 * Sets CORS headers and handles OPTIONS preflight requests.
 * @param {object} req - Vercel request object
 * @param {object} res - Vercel response object
 * @returns {boolean} true if the request was a preflight (caller should return early)
 */
export function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}
