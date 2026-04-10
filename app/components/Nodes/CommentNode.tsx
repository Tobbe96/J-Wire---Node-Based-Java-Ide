import React, { memo, useCallback } from 'react';
import { nodeContainer, nodeHeaderGradient, nodeInputStyle } from '../../utils/nodeStyles';
import type { EnrichedData, CommentNodeData } from '../../utils/nodeTypes';

const ACCENT = '#f59e0b';

const CommentNode = ({ data, selected, id }: { data: EnrichedData<CommentNodeData>; selected: boolean; id: string }) => {
  const onTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.updateNodeData?.(id, { text: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={{
      ...nodeContainer(ACCENT, selected),
      background: 'linear-gradient(180deg, #2a2213 0%, #1a1710 100%)',
    }}>
      <div className="jflow-header-shimmer" style={nodeHeaderGradient(ACCENT)}>
        📝 COMMENT
      </div>

      <div style={{ padding: '10px' }}>
        <textarea
          className="nodrag"
          value={(data.text as string) || ''}
          onChange={onTextChange}
          placeholder="Write a note..."
          rows={4}
          style={{
            ...nodeInputStyle,
            width: '100%',
            resize: 'vertical',
            fontFamily: "'Segoe UI', Tahoma, sans-serif",
            lineHeight: '1.4',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
};

export default memo(CommentNode);
