export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
  headers: {
    'Cache-Control': 'public, max-age=3600',
    'Vary': 'Accept-Encoding',
  },
}; 