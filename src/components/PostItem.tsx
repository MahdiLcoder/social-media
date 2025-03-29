import { Link } from "react-router-dom";
import { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { useQuery } from "@tanstack/react-query";

interface Props {
    post: Post;
}

export const PostItem = ({ post }: Props) => {
    // Fetch likes count
    const fetchLikesCount = async () => {
        const { count, error } = await supabase
            .from("votes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id); // Filter by post ID

        if (error) throw new Error(error.message);
        return count;
    };

    // Fetch comments count
    const fetchCommentsCount = async () => {
        const { count, error } = await supabase
            .from("comments") // Use the correct table for comments
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id); // Filter by post ID

        if (error) throw new Error(error.message);
        return count;
    };

    // React Query hooks for fetching counts
    const { data: likesCount, isLoading: likesLoading } = useQuery({
        queryKey: ["likesCount", post.id],
        queryFn: fetchLikesCount,
    });

    const { data: commentsCount, isLoading: commentsLoading } = useQuery({
        queryKey: ["commentsCount", post.id],
        queryFn: fetchCommentsCount,
    });

    // Handle loading state
    if (likesLoading || commentsLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="relative group">
            <div className="absolute -inset-1 rounded-[20px] bg-gradient-to-r from-pink-600 to-purple-600 blur-sm opacity-0 group-hover:opacity-50 transition duration-300 pointer-events-none"></div>
            <Link to={`/post/${post.id}`} className="block relative z-10">
                <div className="w-80 h-76 bg-[rgb(24,27,32)] border border-[rgb(84,90,106)] rounded-[20px] text-white flex flex-col p-5 overflow-hidden transition-colors duration-300 group-hover:bg-gray-800">
                    {/* Header: Avatar and Title */}
                    <div className="flex items-center space-x-2">
                        {post.avatar_url ? (
                            <img
                                src={post.avatar_url}
                                alt="User Avatar"
                                className="w-[35px] h-[35px] rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-[35px] h-[35px] rounded-full bg-gradient-to-tl from-[#8A2BE2] to-[#491F70]" />
                        )}
                        <div className="flex flex-col flex-1">
                            <div className="text-[20px] leading-[22px] font-semibold mt-2">
                                {post.title}
                            </div>
                        </div>
                    </div>

                    {/* Image Banner */}
                    <div className="mt-2 flex-1">
                        {post.image_url ? (
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="w-full rounded-[20px] object-cover max-h-[150px] mx-auto"
                            />
                        ) : (
                            <div className="w-full h-[150px] rounded-[20px] bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-gray-400">
                                No Image Available
                            </div>
                        )}
                    </div>

                    {/* Dynamic Like and Comment Counts */}
                    <div className="flex justify-around items-center">
                        <span className="cursor-pointer h-10 w-[50px] px-1 flex items-center justify-center font-extrabold rounded-lg">
                            ❤️ <span className="ml-2">{likesCount ?? 0}</span>
                        </span>
                        <span className="cursor-pointer h-10 w-[50px] px-1 flex items-center justify-center font-extrabold rounded-lg">
                            💬 <span className="ml-2">{commentsCount ?? 0}</span>
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
};