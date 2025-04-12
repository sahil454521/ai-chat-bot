import { notFound } from "next/navigation";
import ChatWrapper from "@/components/ChatWrapper";

// Update the type definition to match Next.js 15's expectations
type Props = {
  params: {
    url: string[];
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

function reconstructUrl(url: string[]): string {
  try {
    return url.map(segment => decodeURIComponent(segment)).join("/");
  } catch (error) {
    console.error("Error reconstructing URL:", error);
    return "";
  }
}

// Make sure the function signature matches Next.js expectations
export default function URLPage({ params, searchParams }: Props) {
  // Remove the async keyword if there's no await inside the function
  
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