/**
 * Text formatting and HTML sanitation utilities for RPITSSR
 */

/**
 * Strips HTML tags, script/style blocks, and common HTML entities, returning clean plain text.
 * @param {string} html 
 * @returns {string}
 */
export const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Generates a clean, plain-text excerpt of up to maxLength characters from a post object or text string.
 * @param {object|string} contentOrPost 
 * @param {number} maxLength 
 * @returns {string}
 */
export const getCleanExcerpt = (contentOrPost, maxLength = 120) => {
  if (!contentOrPost) return 'Read this insightful article about education and learning.';
  const raw = typeof contentOrPost === 'object'
    ? (contentOrPost.content || contentOrPost.summary || contentOrPost.excerpt || contentOrPost.description || '')
    : contentOrPost;
  if (!raw) return 'Read this insightful article about education and learning.';
  const clean = raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const sub = clean.substring(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  return lastSpace > 0 ? sub.substring(0, lastSpace) + '...' : sub + '...';
};
