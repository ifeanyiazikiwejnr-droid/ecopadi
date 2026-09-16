import { useRef, useState } from 'react';
import { renderDescription } from '../markdown';

// Finds the contiguous block of "| ... |" lines the cursor is currently
// inside, or falls back to the last table in the text if the cursor isn't
// inside one — so "+ Row" / "+ Column" act on whichever table makes sense
// even if the admin clicked back into the plain text afterward.
function findTableBlock(text, cursorPos) {
  const lines = text.split('\n');
  let charCount = 0;
  let cursorLine = 0;
  for (let i = 0; i < lines.length; i++) {
    charCount += lines[i].length + 1;
    if (charCount > cursorPos) { cursorLine = i; break; }
    cursorLine = i;
  }
  const isTableLine = (line) => line.trim().startsWith('|');
  const blocks = [];
  let start = null;
  for (let i = 0; i < lines.length; i++) {
    if (isTableLine(lines[i])) {
      if (start === null) start = i;
    } else if (start !== null) {
      blocks.push([start, i - 1]);
      start = null;
    }
  }
  if (start !== null) blocks.push([start, lines.length - 1]);
  if (blocks.length === 0) return null;
  const containing = blocks.find(([s, e]) => cursorLine >= s && cursorLine <= e);
  return containing || blocks[blocks.length - 1];
}

function countColumns(headerLine) {
  const cells = headerLine.split('|');
  return cells.filter((_, i) => i > 0 && i < cells.length - 1).length;
}

export default function DescriptionEditor({ value, onChange }) {
  const textareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [tableNotice, setTableNotice] = useState('');

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

  function addRow() {
    const pos = textareaRef.current ? textareaRef.current.selectionStart : value.length;
    const block = findTableBlock(value, pos);
    if (!block) { setTableNotice('Insert a table first, then use + Row.'); return; }
    setTableNotice('');
    const lines = value.split('\n');
    const [start, end] = block;
    const colCount = countColumns(lines[start]);
    const existingDataRows = end - (start + 2) + 1;
    const nextRowNumber = existingDataRows + 1;
    const firstCell = ` Row ${nextRowNumber} `;
    const otherCells = Array(Math.max(0, colCount - 1)).fill('  ');
    const newRow = '|' + [firstCell, ...otherCells].join('|') + '|';
    lines.splice(end + 1, 0, newRow);
    onChange(lines.join('\n'));
  }

  function addColumn() {
    const pos = textareaRef.current ? textareaRef.current.selectionStart : value.length;
    const block = findTableBlock(value, pos);
    if (!block) { setTableNotice('Insert a table first, then use + Column.'); return; }
    setTableNotice('');
    const lines = value.split('\n');
    const [start, end] = block;
    const colCount = countColumns(lines[start]);
    for (let i = start; i <= end; i++) {
      const isSeparator = i === start + 1;
      const newCell = i === start ? ` Column ${colCount + 1} ` : isSeparator ? '-'.repeat(10) : '  ';
      const lastPipeIndex = lines[i].lastIndexOf('|');
      lines[i] = lines[i].slice(0, lastPipeIndex) + '|' + newCell + lines[i].slice(lastPipeIndex);
    }
    onChange(lines.join('\n'));
  }

  return (
    <div className="description-editor">
      <div className="description-toolbar">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => wrapSelection('**')} title="Bold"><strong>B</strong></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={insertTable} title="Insert table">▦ Table</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addRow} title="Add a row to the nearest table">+ Row</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addColumn} title="Add a column to the nearest table">+ Column</button>
        <button
          type="button"
          className={`description-preview-toggle ${showPreview ? 'active' : ''}`}
          onClick={() => setShowPreview((s) => !s)}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {tableNotice && <p style={{ color: 'var(--pepper)', fontSize: 12.5, margin: '4px 0 8px' }}>{tableNotice}</p>}

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
        Select text and click B to bold it. Blank lines start a new paragraph. Click Table to insert one — then
        place your cursor inside it and use + Row or + Column to grow it.
      </p>
    </div>
  );
}
