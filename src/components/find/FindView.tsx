'use client';

import { useState, useCallback } from 'react';
import { SearchInput } from './SearchInput';
import { A2UISurface } from '../a2ui/A2UISurface';
import type { DetailLevel } from '@/lib/preferences';

interface FindViewProps {
  detailLevel: DetailLevel;
  onAddToPortfolio?: (symbol: string) => void;
}

export function FindView({ detailLevel, onAddToPortfolio }: FindViewProps) {
  const [request, setRequest] = useState<{
    mode: 'find' | 'action';
    query?: string;
    actionType?: string;
    actionValue?: string;
    context?: string;
    detailLevel: string;
  } | null>(null);

  const [lastQuery, setLastQuery] = useState<string>('');

  const handleSearch = useCallback((query: string) => {
    setLastQuery(query);
    setRequest({
      mode: 'find',
      query,
      detailLevel,
    });
  }, [detailLevel]);

  const handleAction = useCallback((action: { type: string; value: string; context?: string }) => {
    if (action.type === 'expand-stock') {
      // Trigger a detailed analysis of the stock
      setRequest({
        mode: 'action',
        actionType: 'expand-stock',
        actionValue: action.value,
        context: `User searched for "${lastQuery}" and tapped on ${action.value} for detailed analysis. Show full grade breakdown with adaptive metrics.`,
        detailLevel,
      });
    } else if (action.type === 'add-portfolio') {
      onAddToPortfolio?.(action.value);
    } else {
      // Generic action response
      setRequest({
        mode: 'action',
        actionType: action.type,
        actionValue: action.value,
        context: action.context || `Follow-up action from search: "${lastQuery}"`,
        detailLevel,
      });
    }
  }, [lastQuery, detailLevel, onAddToPortfolio]);

  return (
    <div className="space-y-6">
      <SearchInput onSearch={handleSearch} loading={false} />

      {!request && (
        <div className="text-center py-8">
          <p className="text-sm text-text-tertiary">
            Pick tiles above to build your search, then hit Search. The AI agent grades and ranks stocks on a 4.0 GPA scale.
          </p>
        </div>
      )}

      {request && (
        <A2UISurface
          request={request}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
