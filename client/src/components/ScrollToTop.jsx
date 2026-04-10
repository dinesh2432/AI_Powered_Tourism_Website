import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — resets window scroll position to 0 on every route change.
 * Mount this once inside <BrowserRouter> and it works globally for all routes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant scroll (not smooth) so it does not feel delayed
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null; // renders nothing
};

export default ScrollToTop;
