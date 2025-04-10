import { ragChat } from "@/lib/rag-chat";
import { redis } from "@/lib/redis-chat";
import ChatWrapper from "@/components/ChatWrapper";

interface PageProps {
    params: {
        url: string | string[] | undefined;
    };
}

function reconstructUrl({ url }: { url: string[] }) {
    try {
        const reconstructed = url.map((component) => decodeURIComponent(component)).join("/");

        // Ensure the reconstructed URL has a valid protocol
        if (!reconstructed.startsWith("http://") && !reconstructed.startsWith("https://")) {
            console.warn("Reconstructed URL is missing a protocol. Prepending 'https://'.");
            return `https://${reconstructed}`;
        }

        return reconstructed;
    } catch (error) {
        console.error("Error decoding URL components:", error);
        throw new Error("Failed to decode URL components.");
    }
}

const page = async ({ params }: { params: PageProps["params"] }) => {
    const sessionId = "mock-session";
    try {
        // Ensure params is resolved before accessing its properties
        if (await !params || !params.url) {
            console.error("URL parameter is missing or undefined.");
            throw new Error("URL parameter is missing.");
        }

        const urlArray = Array.isArray( await params.url) ? params.url : [params.url];

        if (urlArray.length === 0 || urlArray.some((url) => !url)) {
            console.error("URL parameter is empty or contains invalid values:", urlArray);
            throw new Error("URL parameter is invalid.");
        }

        const reconstructedUrl = reconstructUrl({ url: urlArray });
        console.log("Reconstructed URL:", reconstructedUrl);

        // Validate the reconstructed URL
        try {
            new URL(reconstructedUrl); // Validate URL format
        } catch {
            console.error("Invalid reconstructed URL:", reconstructedUrl);
            throw new Error("Invalid reconstructed URL.");
        }

        // Check if the URL is already indexed
        const isAlreadyIndexed = await redis.sismember("indexed-url", reconstructedUrl);
        console.log("Is URL already indexed:", isAlreadyIndexed);

        if (!isAlreadyIndexed) {
            // Add the URL to the context and index it
            await ragChat.context.add({
                type: "html",
                source: reconstructedUrl,
                config: { chunkOverlap: 50, chunkSize: 500 },
            });

            await redis.sadd("indexed-url", reconstructedUrl);
            console.log("URL indexed successfully:", reconstructedUrl);
        }

        return <ChatWrapper />;
    } catch (error) {
        console.error("Error in page function:", error);
        throw new Error("An error occurred while processing the request.");
    }
};

export default page;