import { Post } from './PostList';
import { supabase } from '../supabase-client';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../store/Auth';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
const fetchPost = async (id: number): Promise<Post> => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching posts:', error);
        throw new Error(error.message);
    }

    return data as Post;
};

interface PostDetailsProps {
    postId: number;
}

function PostDetails({ postId }: PostDetailsProps) {

    const { user } = useAuth();
    const { data, error, isLoading } = useQuery<Post, Error>({
        queryKey: ['post', postId],
        queryFn: () => fetchPost(postId),
    });

    if (isLoading) return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;
    if (error) return <div className="text-center text-red-500 dark:text-red-400">Error: {error.message}</div>;
    if (!data) return <div className="text-center text-gray-500 dark:text-gray-400">No posts available.</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg space-y-6">

            {/* Header: Avatar and Title */}
            <div className="flex items-center space-x-2">
                {user.user_metadata?.avatar_url ? (
                    <img
                        src={user.user_metadata?.avatar_url}
                        alt="User Avatar"
                        className="w-[35px] h-[35px] rounded-full object-cover"
                    />
                ) : (
                    <div className="w-[35px] h-[35px] rounded-full bg-gradient-to-tl from-[#8A2BE2] to-[#491F70]" />
                )}
                <div className="flex flex-col flex-1">
                    <div className="text-[20px] leading-[22px] font-semibold mt-2">
                        {user?.user_metadata?.full_name}
                    </div>
                </div>
            </div>
            <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {data.title}
            </h2>
            {data.image_url && (
                <div className="overflow-hidden rounded-lg shadow-md">
                    <img
                        src={data.image_url}
                        alt={data.title}
                        className="w-full h-64 object-cover m-auto transition-transform duration-300 ease-in-out hover:scale-105 hover:brightness-110"
                    />
                </div>
            )}
            <p className="text-gray-700  dark:text-gray-300 text-lg leading-relaxed">{data.content}</p>
            <p className="text-gray-500 text-sm">n
                Posted on: {new Date(data!.created_at).toLocaleDateString()} 
                </p>
            <LikeButton postId={postId} />
            <CommentSection postId={postId} />
        </div>
    );
}

export default PostDetails;