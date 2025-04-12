import { notFound } from "next/navigation";
import ChatWrapper from "@/components/ChatWrapper";

interface PageProps {
  params: {
    url: string[];
  };
}

function reconstructUrl(url: string[]): string {
  try {
    return url.map(segment => decodeURIComponent(segment)).join("/");
  } catch (error) {
    console.error("Error reconstructing URL:", error);
    return "";
  }
}

export default async function URLPage({ params }: PageProps) {
  if (!params.url || params.url.length === 0) {
    return notFound();
  }

  const reconstructedUrl = reconstructUrl(params.url);
  
  // Validate the URL format
  let validUrl: string;
  try {
    // Make sure the URL is properly formatted
    const urlObj = new URL(reconstructedUrl.startsWith("http") ? reconstructedUrl : `https://${reconstructedUrl}`);
    validUrl = urlObj.toString();
  } catch (error) {
    console.error("Invalid URL format:", error);
    return notFound();
  }

  // We'll pass the URL to the ChatWrapper
  return <ChatWrapper initialUrl={validUrl} />;
}