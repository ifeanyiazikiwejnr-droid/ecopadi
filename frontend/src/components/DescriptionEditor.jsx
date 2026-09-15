import { useRef, useState } from 'react';
import { renderDescription } from '../markdown';

export default function DescriptionEditor({ value, onChange }) {
  const textareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  function wrapSelection(marker) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const newValue = value.slice(0, selectionStart) + marker + selected + marker + value.slice(selectionEnd);
    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart + marker.length, selectionStart + marker.length + selected.length);
    });
  }

  function insertTable() {
    const textarea = textareaRef.current;
    const pos = textarea ? textarea.selectionStart : value.length;
    const needsLeadingBreak = pos > 0 && value[pos - 1] !== '\n';
    const template = `${needsLeadingBreak ? '\n\n' : ''}| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Row 1    |          |          |\n| Row 2    |          |          |\n\n`;
    onChange(value.slice(0, pos) + template + value.slice(pos));
  }

  return (
    <div className="description-editor">
      <div className="description-toolbar">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => wrapSelection('**')} title="Bold"><strong>B</strong></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={insertTable} title="Insert table">▦ Table</button>
        <button
          type="button"
          className={`description-preview-toggle ${showPreview ? 'active' : ''}`}
          onClick={() => setShowPreview((s) => !s)}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        <div className="description-preview-box">
          <div
            className="product-description-content"
            dangerouslySetInnerHTML={{ __html: renderDescription(value) || '<p class="muted">Nothing to preview yet.</p>' }}
          />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          placeholder="Description — press Enter twice for a new paragraph"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
        />
      )}
      <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
        Select text and click B to bold it. Blank lines start a new paragraph. Click Table to insert one, then fill in the cells.
      </p>
    </div>
  );
}
