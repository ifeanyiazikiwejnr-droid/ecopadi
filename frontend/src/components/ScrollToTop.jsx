import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation like a normal
// multi-page site does — without this, clicking to a new page leaves you
// wherever you'd scrolled to on the previous one (often the footer).
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // The site has global CSS smooth-scrolling (for in-page anchor links),
    // which would otherwise make this route-change reset visibly animate.
    // "instant" overrides that just for this jump.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
