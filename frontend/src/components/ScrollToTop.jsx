import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation like a normal
// multi-page site does — without this, clicking to a new page leaves you
// wherever you'd scrolled to on the previous one (often the footer).
//
// useLayoutEffect (not useEffect) matters here: it runs before the browser
// paints, so the scroll resets before the new page is ever shown at the old
// position — otherwise you'd see a one-frame flash of the wrong scroll spot
// (e.g. the footer) before it jumps to top.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // The site has global CSS smooth-scrolling (for in-page anchor links),
    // which would otherwise make this route-change reset visibly animate.
    // "instant" overrides that just for this jump.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}