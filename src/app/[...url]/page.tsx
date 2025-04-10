import ChatWrapper from "@/components/ChatWrapper";

interface PageProps {
    params: {
        url: string | string[] | undefined;
        prompt: string;
        history: string[];
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

async function processStreamedResponse(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    if (!reader) {
        throw new Error("Failed to read the response stream.");
    }

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        try {
            const json = JSON.parse(chunk);
            if (json.response) {
                result += json.response; // Append the response content
            }
        } catch (error) {
            console.warn("Failed to parse chunk as JSON:", chunk);
        }
    }

    return result;
}

const page = async ({ params }: { params: PageProps["params"] }) => {
    const sessionId = "mock-session";
    try {
        if (!params || !params.url) {
            console.error("URL parameter is missing or undefined.");
            throw new Error("URL parameter is missing.");
        }

        const urlArray = Array.isArray(params.url) ? params.url : [params.url];

        if (urlArray.length === 0 || urlArray.some((url) => !url)) {
            console.error("URL parameter is empty or contains invalid values:", urlArray);
            throw new Error("URL parameter is invalid.");
        }

        const reconstructedUrl = reconstructUrl({ url: urlArray });
        console.log("Reconstructed URL:", reconstructedUrl);

        try {
            new URL(reconstructedUrl); // Validate URL format
        } catch {
            console.error("Invalid reconstructed URL:", reconstructedUrl);
            throw new Error("Invalid reconstructed URL.");
        }

        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sessionId,
                prompt: `Based on the content of the following webpage: ${reconstructedUrl}, continue the conversation with the following input: ${params.prompt}`,
                history: params.history, // Include conversation history
                model: "Mistral", // Specify the correct model
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to process URL with Mistral:", errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const resultContent = await processStreamedResponse(response);
        console.log("Final Combined Response:", resultContent);

        if (!resultContent) {
            console.error("Mistral returned an empty or invalid response.");
            return <ChatWrapper response="The model did not return a valid response. Please try again later." />;
        }

        return <ChatWrapper response={resultContent} />;
    } catch (error) {
        console.error("Error in page function:", error);
        return <ChatWrapper response="An error occurred while processing your request. Please try again later." />;
    }
};

export default page;