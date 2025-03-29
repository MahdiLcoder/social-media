import { ChangeEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import useAuth from "../store/Auth";
import { Community, fetchCommunity } from "./CommunityList";

export interface PostInput {
    title: string;
    content: string;
    image_url?: string;
    avatar_url: string | null;
    community_id: number | null;
}

const createPost = async (post: PostInput, imageFile?: File) => {
    let imageUrl = null;

    // If an image file is provided, upload it to Supabase Storage
    if (imageFile) {
        const sanitizeFileName = (name: string) => {
            return name.replace(/[^a-zA-Z0-9-_]/g, "_"); // Replace invalid characters with "_"
        };

        const truncateFileName = (name: string, maxLength: number) => {
            if (name.length <= maxLength) return name;
            const extension = name.substring(name.lastIndexOf("."));
            const baseName = name.substring(0, maxLength - extension.length);
            return `${baseName}${extension}`;
        };

        const sanitizedFileName = truncateFileName(sanitizeFileName(imageFile.name), 100);
        const filePath = `${sanitizeFileName(post.title)}-${Date.now()}-${sanitizedFileName}`;

        const { error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(filePath, imageFile);

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicURLData } = supabase.storage
            .from("post-images")
            .getPublicUrl(filePath);

        imageUrl = publicURLData.publicUrl;
    }

    // Insert the post into the "posts" table
    const { data, error } = await supabase
        .from("posts")
        .insert({ ...post, image_url: imageUrl });

    if (error) throw new Error(error.message);

    return data;
};

export const CreatePost = () => {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [communityId, setCommunityId] = useState<number | null>(null);

    const { user } = useAuth();

    const { data: communities, isLoading: isCommunitiesLoading, isError: isCommunitiesError } = useQuery<Community[], Error>({
        queryKey: ['communities'],
        queryFn: fetchCommunity,
        refetchInterval: 5000,
    });

    const { mutate, isPending, isError } = useMutation({
        mutationFn: (data: { post: PostInput; imageFile?: File }) => {
            return createPost(data.post, data.imageFile);
        },
        onSuccess: () => {
            alert("Post created successfully!");
            setTitle("");
            setContent("");
            setSelectedFile(null);
        },
        onError: (error: any) => {
            alert(`Error creating post: ${error.message}`);
        },
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        mutate({
            post: {
                title,
                content,
                avatar_url: user?.user_metadata.avatar_url || null,
                communitie_id: communityId
            },
            imageFile: selectedFile || undefined,
        });
    };

    const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setCommunityId(value ? Number(value) : null);
    };
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div>
                <label htmlFor="title" className="block mb-2 font-medium">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-white/10 bg-transparent p-2 rounded"
                    required
                />
            </div>
            <div>
                <label htmlFor="content" className="block mb-2 font-medium">
                    Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border border-white/10 bg-transparent p-2 rounded"
                    rows={5}
                    required
                />
            </div>
            <div>
                <label htmlFor="community" className="block mb-2 font-medium">
                    Select Community
                </label>
                <select
                    id="community"
                    onChange={handleCommunityChange}
                    className="w-full border border-white/10 bg-transparent p-2 rounded"
                >
                    <option value={""} className="text-gray-500">
                        -- Choose a Community --
                    </option>
                    {communities?.map((community, key) => (
                        <option key={key} value={community.id} className="text-black">
                            {community.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="image" className="block mb-2 font-medium">
                    Upload Image (Optional)
                </label>
                <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-gray-200"
                />
            </div>
            <button
                type="submit"
                className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
                disabled={isPending}
            >
                {isPending ? "Creating..." : "Create Post"}
            </button>

            {isError && <p className="text-red-500 mt-2">Error creating post.</p>}
        </form>
    );
};