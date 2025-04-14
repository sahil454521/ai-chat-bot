import { JSDOM } from 'jsdom';

/**
 * Extracts meaningful text content from a URL
 * @param url The URL to extract content from
 * @returns Extracted text content
 */
export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    // Make a server-side request to get the HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIChatBotFetcher/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Remove script, style tags, and hidden elements
    const elementsToRemove = document.querySelectorAll('script, style, [hidden], [aria-hidden="true"], noscript');
    elementsToRemove.forEach(el => el.remove());
    
    // Extract title
    const title = document.querySelector('title')?.textContent || '';
    
    // Extract meta description
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Extract main content
    // Try to find the main content area
    let mainContent = '';
    const contentElements = [
      document.querySelector('main'),
      document.querySelector('article'),
      document.querySelector('#content'),
      document.querySelector('.content'),
      document.querySelector('.main'),
    ].filter(Boolean);
    
    if (contentElements.length > 0) {
      mainContent = contentElements[0]!.textContent || '';
    } else {
      // Fallback: get text from body
      mainContent = document.body.textContent || '';
    }
    
    // Clean the text
    mainContent = mainContent
      .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
      .trim();
    
    // Construct the final result
    let result = '';
    if (title) result += `Title: ${title}\n\n`;
    if (metaDescription) result += `Description: ${metaDescription}\n\n`;
    result += `Content:\n${mainContent}`;
    
    // Truncate if too long (100k chars max)
    if (result.length > 100000) {
      result = result.substring(0, 100000) + '... [content truncated]';
    }
    
    return result;
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    // Fix: properly handle the unknown type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return `Failed to extract content from ${url}: ${errorMessage}`;
  }
}