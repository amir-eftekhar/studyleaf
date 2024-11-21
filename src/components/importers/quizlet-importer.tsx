import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface QuizletImporterProps {
  onImport: (terms: Array<{ term: string; definition: string }>) => void;
}

export function QuizletImporter({ onImport }: QuizletImporterProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const handleUrlImport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/import/quizlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import from Quizlet');
      }

      const data = await response.json();
      onImport(data.cards);
    } catch (err: any) {
      setError(err.message);
      // If we get blocked, automatically show manual input option
      if (err.message.includes('blocking') || err.message.includes('CAPTCHA')) {
        setShowManualInput(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = () => {
    try {
      // Split by newlines and filter out empty lines
      const lines = manualInput.split('\n').filter(line => line.trim());
      
      const cards = lines.map(line => {
        // Try to split by tab first, then by various delimiters
        let [term, definition] = line.split('\t');
        if (!definition) {
          [term, definition] = line.split(' - ');
        }
        if (!definition) {
          [term, definition] = line.split(':');
        }
        if (!definition) {
          throw new Error('Could not parse terms. Please make sure each line has a term and definition separated by a tab, dash (-), or colon (:)');
        }
        
        return {
          term: term.trim(),
          definition: definition.trim()
        };
      });

      if (cards.length === 0) {
        throw new Error('No valid terms found');
      }

      onImport(cards);
      setManualInput('');
      setShowManualInput(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4 relative">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Import Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Import from Quizlet</h3>
        <p className="text-sm text-muted-foreground">
          Enter a Quizlet URL or paste terms manually
        </p>
      </div>

      {/* URL Import Section */}
      <div className="flex gap-2">
        <Input
          placeholder="Paste Quizlet URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button 
          onClick={handleUrlImport}
          disabled={!url || loading}
        >
          {loading ? 'Importing...' : 'Import'}
        </Button>
      </div>

      {/* Manual Input Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowManualInput(!showManualInput)}
        className="w-full"
      >
        {showManualInput ? 'Hide Manual Input' : 'Show Manual Input'}
      </Button>

      {/* Manual Input Section */}
      {showManualInput && (
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Manual Import</h4>
            <p className="text-sm text-muted-foreground">
              Copy and paste your terms below. Put each term on a new line with the definition separated by a tab, dash (-), or colon (:)
            </p>
            <p className="text-sm text-muted-foreground">
              Example format:
              <br />
              term1 - definition1
              <br />
              term2: definition2
            </p>
          </div>
          
          <Textarea
            placeholder="Paste your terms here..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            rows={10}
            className="font-mono"
          />
          
          <Button 
            onClick={handleManualImport}
            disabled={!manualInput.trim()}
            className="w-full"
          >
            Import Manual Terms
          </Button>
        </Card>
      )}
    </div>
  );
}
