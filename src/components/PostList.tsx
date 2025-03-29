import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase-client';
import { PostItem } from './PostItem';


export interface Post{
    id: string;
    title: string;
    content: string;
    image_url?: string;
}
const fetchPosts = async (): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false }); // Ensure all necessary fields are selected

        // console.log('Supabase response:', { data, error }); 
    if (error) {
        console.error('Error fetching posts:', error);
        throw new Error(error.message);
    }

    return data as Post[];
};

function PostList() {
    const { data, error, isLoading } = useQuery<Post[], Error>({
        queryKey: ['posts'],
        queryFn: fetchPosts,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data || data.length === 0) return <div>No posts available.</div>;

    // console.log(data);

    return (
        <div className="flex flex-wrap gap-6 justify-center">
            {data.map((post) => (
                <PostItem key={post.id} post={post} />
            ))}
        </div>
    );
}

export default PostList;