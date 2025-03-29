import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase-client';
import { Link } from 'react-router-dom';

export interface Community {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

export const fetchCommunity = async (): Promise<Community[]> => {
    const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
};

function CommunityList() {
    const { data: communities, isLoading, isError } = useQuery<Community[], Error>({
        queryKey: ['communities'],
        queryFn: fetchCommunity,
        refetchInterval: 5000,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error loading communities.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            {communities?.map((community) => (
                <div
                    key={community.id}
                    className="border border-white/10 p-4 rounded hover:-translate-y-1 transition transform"
                >
                    <Link
                        to={`/community/${community.id}`}
                        className="text-2xl font-bold text-purple-500 hover:underline"
                    >
                        {community.name}
                    </Link>
                    <p className="text-gray-400 mt-2">{community.description}</p>
                </div>
            ))}
        </div>
    );
}

export default CommunityList;