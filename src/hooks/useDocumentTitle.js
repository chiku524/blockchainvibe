import { useEffect } from 'react';

const BASE_TITLE = 'BlockchainVibe';

/**
 * Set document title for the current page. Resets to base title on unmount.
 * @param {string} title - Page title (e.g. "Dashboard", "Search Results")
 * @param {boolean} includeBase - If true, title becomes "{title} | BlockchainVibe"
 */
export function useDocumentTitle(title, includeBase = true) {
  useEffect(() => {
    const previous = document.title;
    document.title = title
      ? (includeBase ? `${title} | ${BASE_TITLE}` : title)
      : BASE_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title, includeBase]);
}
