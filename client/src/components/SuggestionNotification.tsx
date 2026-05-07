import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RuleCandidate {
  id: string;
  vendor: string;
  suggestedCategory: string;
  occurrenceCount: number;
}

interface Props {
  onRuleApproved: () => void;
}

const SuggestionNotification: React.FC<Props> = ({ onRuleApproved }) => {
  const [candidates, setCandidates] = useState<RuleCandidate[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get('/api/suggestions/candidates');
      setCandidates(res.data);
      if (res.data.length > 0) setShow(true);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };

  const handleApprove = async (candidate: RuleCandidate) => {
    try {
      await axios.post('/api/suggestions/approve', {
        vendor: candidate.vendor,
        category: candidate.suggestedCategory
      });
      setCandidates(prev => prev.filter(c => c.id !== candidate.id));
      onRuleApproved();
    } catch (err) {
      alert('규칙 승인 실패');
    }
  };

  if (!show || candidates.length === 0) return null;

  return (
    <div className="suggestion-notification" style={{
      background: '#fef3c7',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #f59e0b'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>💡 자동화 규칙 추천</h3>
      <p>사용자님의 수정 패턴을 분석한 결과, 다음 규칙을 생성할 수 있습니다:</p>
      <ul style={{ paddingLeft: '20px' }}>
        {candidates.map(c => (
          <li key={c.id} style={{ marginBottom: '5px' }}>
            <strong>{c.vendor}</strong> → <strong>{c.suggestedCategory}</strong> (반복 횟수: {c.occurrenceCount})
            <button onClick={() => handleApprove(c)} className="btn btn-primary" style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '12px' }}>
              승인
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionNotification;
