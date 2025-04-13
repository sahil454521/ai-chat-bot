import { notFound } from "next/navigation";
import ChatWrapper from "@/components/ChatWrapper";

type Props = {
  params: Promise<{
    url: string[]; // Always an array for catch-all routes
  }>;
  searchParams?: Promise<{
    prompt?: string;
    text?: string;
    history?: string | string[];
    [key: string]: string | string[] | undefined;
  }>;
};

/**
 * Safely reconstructs a URL from path segments
 * @param urlSegments Array of URL path segments
 * @returns Properly formatted URL string
 * @throws Error if segments can't be decoded
 */
function reconstructUrl(urlSegments: string[]): string {
  if (!urlSegments || urlSegments.length === 0) {
    throw new Error("URL segments array is empty");
  }

  const decodedSegments = urlSegments.map(segment => {
    try {
      return decodeURIComponent(segment);
    } catch (error) {
      console.error("Error decoding URL segment:", segment);
      throw new Error(`Invalid URL segment: ${segment}`);
    }
  });

  return decodedSegments.join("/");
}

/**
 * Validates and normalizes a URL string
 * @param urlString The URL to validate
 * @returns Properly formatted URL
 * @throws Error if URL is invalid
 */
function validateAndNormalizeUrl(urlString: string): string {
  // Add default protocol if missing
  if (!urlString.match(/^https?:\/\//)) {
    urlString = `https://${urlString}`;
  }

  const url = new URL(urlString);
  
  // Enforce HTTPS for security
  if (url.protocol !== "https:") {
    url.protocol = "https:";
  }

  return url.toString();
}

export default async function URLPage({ params, searchParams }: Props) {
  try {
    // Resolve the params and searchParams promises
    const resolvedParams = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;

    // Validate URL segments
    if (!resolvedParams.url || resolvedParams.url.length === 0) {
      console.warn("No URL segments provided");
      return notFound();
    }

    // Special handling for extension requests
    let urlPath = reconstructUrl(resolvedParams.url);

    // Check if this is a full URL from our extension
    if (urlPath.includes('%2F') || urlPath.includes('%3A')) {
      try {
        urlPath = decodeURIComponent(urlPath);
      } catch (error) {
        console.error("Error decoding extension URL:", error);
      }
    }

    const validUrl = validateAndNormalizeUrl(urlPath);

    // Process search params
    const prompt = resolvedSearchParams?.text 
      ? `Summarize this content from ${validUrl}: ${resolvedSearchParams.text}`
      : resolvedSearchParams?.prompt 
        ? resolvedSearchParams.prompt 
        : `Summarize the content from this webpage: ${validUrl}`;

    const history = typeof resolvedSearchParams?.history === "string" 
      ? [resolvedSearchParams.history] 
      : resolvedSearchParams?.history;

    return (
      <ChatWrapper 
        sessionId={crypto.randomUUID()} // Generate a unique session ID
        initialUrl={validUrl}
        initialPrompt={prompt}
        initialHistory={history}
      />
    );

  } catch (error) {
    console.error("Error processing URL:", error);
    return notFound();
  }
}
