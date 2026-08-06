import React, { useEffect, useState } from 'react';
import {
  approveRuleSuggestion,
  deferRuleSuggestion,
  getRuleSuggestions,
  ignoreRuleSuggestion,
  RuleSuggestion,
} from '../api';

interface Props {
  onRuleApproved: () => void;
}

const SuggestionNotification: React.FC<Props> = ({ onRuleApproved }) => {
  const [candidates, setCandidates] = useState<RuleSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await getRuleSuggestions();
      setCandidates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch rule suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCandidate = (candidateId: string) => {
    setCandidates((previous) => previous.filter((candidate) => candidate.id !== candidateId));
  };

  const handleApprove = async (candidate: RuleSuggestion) => {
    setProcessingId(candidate.id);
    try {
      await approveRuleSuggestion(candidate.vendor, candidate.suggestedCategory);
      removeCandidate(candidate.id);
      onRuleApproved();
    } catch (error) {
      alert(error instanceof Error ? error.message : '규칙을 등록하지 못했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDefer = async (candidate: RuleSuggestion) => {
    setProcessingId(candidate.id);
    try {
      await deferRuleSuggestion(candidate.vendor);
      removeCandidate(candidate.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : '추천을 보류하지 못했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleIgnore = async (candidate: RuleSuggestion) => {
    setProcessingId(candidate.id);
    try {
      await ignoreRuleSuggestion(candidate.vendor);
      removeCandidate(candidate.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : '추천 제외 처리하지 못했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading || candidates.length === 0) return null;

  return (
    <section
      aria-label="자동분류 규칙 추천"
      className="suggestion-notification"
      style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f59e0b' }}
    >
      <h3 style={{ margin: '0 0 6px' }}>자동분류 규칙 추천</h3>
      <p style={{ margin: '0 0 10px' }}>확정된 거래 이력을 바탕으로, 일관성이 높은 거래처만 추천합니다.</p>
      <ul style={{ paddingLeft: '20px', margin: 0 }}>
        {candidates.map((candidate) => {
          const isProcessing = processingId === candidate.id;
          return (
            <li key={candidate.id} style={{ marginBottom: '10px' }}>
              <strong>{candidate.vendor}</strong> → <strong>{candidate.suggestedCategory}</strong>
              <span style={{ display: 'block', fontSize: '12px', color: '#6b4f00', marginTop: '2px' }}>
                근거: {candidate.totalOccurrences}건 중 {candidate.occurrenceCount}건 일치 ({candidate.confidence}%) · 최근 {candidate.lastUsedAt}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                <button disabled={isProcessing} onClick={() => void handleApprove(candidate)} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '12px' }}>
                  규칙 등록
                </button>
                <button disabled={isProcessing} onClick={() => void handleDefer(candidate)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '12px' }}>
                  30일 보류
                </button>
                <button disabled={isProcessing} onClick={() => void handleIgnore(candidate)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '12px', backgroundColor: '#fca5a5', color: '#991b1b', border: 'none' }}>
                  추천 안 함
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default SuggestionNotification;
