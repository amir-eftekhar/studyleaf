import { NextResponse } from 'next/server';
import { search } from '@/lib/vectorDb';

export async function POST(request: Request) {
  try {
    const { query, documentId, pdfUrl } = await request.json();
    
    // Use either documentId or extract it from pdfUrl
    let finalDocumentId = documentId;
    if (!finalDocumentId && pdfUrl) {
      const match = pdfUrl.match(/\/uploads\/(.+)$/);
      finalDocumentId = match ? match[1] : pdfUrl;
    }

    if (!query || !finalDocumentId) {
      return NextResponse.json({ 
        error: 'Query and document ID are required',
        details: { query: !!query, documentId: !!finalDocumentId }
      }, { status: 400 });
    }

    console.log('Processing search:', { documentId: finalDocumentId, query });

    try {
      const searchResults = await search(query, finalDocumentId, 5);
      
      if (!searchResults || searchResults.length === 0) {
        console.log('No results found for query:', query);
        return NextResponse.json({ 
          results: [],
          message: 'No matching sections found' 
        });
      }

      // Format results for response
      const formattedResults = searchResults.map(result => ({
        content: result.content,
        score: result.score,
        page: result.metadata.pageNumber
      }));

      console.log(`Found ${formattedResults.length} results`);

      return NextResponse.json({ 
        results: formattedResults,
        message: `Found ${formattedResults.length} matching sections`
      });

    } catch (error) {
      console.error('Search processing error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json({ 
      error: 'An error occurred during the search.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
