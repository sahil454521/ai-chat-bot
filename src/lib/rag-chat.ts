import { RAGChat} from "@upstash/rag-chat";
import { upstash } from "@upstash/rag-chat";



export const ragChat = new RAGChat({
    model: upstash("meta-llama/llama-2-7b-chat", {
        apiKey: process.env.UPSTASH_API_KEY,
        url: process.env.UPSTASH_REDIS_REST_URL,
}),
});