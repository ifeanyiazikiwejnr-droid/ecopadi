import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Converts admin-entered markdown (paragraphs via blank lines, **bold**,
// pipe-syntax tables) into sanitized HTML safe to render with
// dangerouslySetInnerHTML. Sanitizing matters even for admin-only content —
// it's cheap insurance against a compromised admin login or an accidental
// paste of something unexpected ever being able to run a script.
export function renderDescription(markdown) {
  if (!markdown) return '';
  const html = marked.parse(markdown, { breaks: true });
  return DOMPurify.sanitize(html);
}
