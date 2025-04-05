import {ragChat} from "@/lib/rag-chat";

interface PageProps {
    params:{
        url: string | string[] | undefined
    }
}

function reconstructUrl({url}:{url:string[]}){
   return url.map((component) => decodeURIComponent(component)).join("/")
}
const page = async ({params}: PageProps) => {
   const reconstructedUrl = reconstructUrl({url: params.url as string[]});
    console.log(params)

    await ragChat.context.add({
        type:"html",
        source:reconstructedUrl,
        config:{chunkOverlap:50,chunkSize:500 },
    })
    return <p>Hello</p>
}

export default page