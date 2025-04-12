import { notFound } from "next/navigation";
import ChatWrapper from "@/components/ChatWrapper";

// Update the type definition to match Next.js 15's expectations
type Props = {
  params: {
    url: string[]; // Dynamic route segments
  };
  searchParams?: { [key: string]: string | string[] | undefined }; // Optional query parameters
};

function reconstructUrl(url: string[]): string {
  try {
    return url.map(segment => decodeURIComponent(segment)).join("/");
  } catch (error) {
    console.error("Error reconstructing URL:", error);
    return "";
  }
}

// This is correct
export default function URLPage({ params, searchParams }: Props) {
  if (!params.url || params.url.length === 0) {
    return notFound();
  }

  const reconstructedUrl = reconstructUrl(params.url);

  // Validate the URL format
  let validUrl: string;
  try {
    const urlObj = new URL(reconstructedUrl.startsWith("http") ? reconstructedUrl : `https://${reconstructedUrl}`);
    validUrl = urlObj.toString();
  } catch (error) {
    console.error("Invalid URL format:", error);
    return notFound();
  }

  return <ChatWrapper initialUrl={validUrl} />;
}