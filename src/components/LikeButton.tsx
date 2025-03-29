import React from 'react';
import { supabase } from '../supabase-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '../store/Auth';

interface Props {
  postId: number;
}

interface Vote {
  id: number;
  vote: number;
  post_id: number;
  user_id: string;
}

const vote = async (voteValue: number, postId: number, userId: string | undefined) => {
  if (!userId) {
    throw new Error('User is not authenticated');
  }

  try {
    const { data: existingVote, error: fetchError } = await supabase
      .from('votes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingVote) {
      if (existingVote.vote === voteValue) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
        if (error) throw error;
        return { action: 'deleted' };
      } else {
        const { error } = await supabase
          .from('votes')
          .update({ vote: voteValue })
          .eq('id', existingVote.id);
        if (error) throw error;
        return { action: 'updated' };
      }
    } else {
      const { error } = await supabase.from('votes').insert({
        vote: voteValue,
        post_id: postId,
        user_id: userId,
      });
      if (error) throw error;
      return { action: 'inserted' };
    }
  } catch (error) {
    console.error('Vote operation failed:', error);
    throw error;
  }
};

const fetchVotes = async (postId: number): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('post_id', postId);

  if (error) {
    console.error('Failed to fetch votes:', error);
    throw error;
  }

  return data || [];
};

function LikeButton({ postId }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient(); // React Query's query client

  const { data: votes, error, isLoading } = useQuery({
    queryKey: ['votes', postId],
    queryFn: () => fetchVotes(postId),
    refetchInterval: 5000
  });

  const { mutate } = useMutation({
    mutationFn: (voteValue: number) => vote(voteValue, postId, user?.id),
    onSuccess: () => {
      // Invalidate the 'votes' query to trigger a re-fetch
      queryClient.invalidateQueries(['votes', postId]);
    },
    onError: (error: any) => {
      alert(`Error submitting vote: ${error.message}`);
    },
  });

  const handleVote = (voteValue: number) => {
    if (!user) {
      alert('You must be logged in to vote');
      return;
    }
    mutate(voteValue);
  };

  const likes = votes?.filter((v) => v.vote === 1).length || 0;
  const dislikes = votes?.filter((v) => v.vote === -1).length || 0;
  const userVote = votes?.find((v) => v.user_id === user?.id)?.vote;

  return (
    <div>
      <button
        onClick={() => handleVote(1)}
        className={`px-3 py-1 cursor-pointer rounded transition-colors duration-150 ${userVote === 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'
          }`}
      >
        👍 {likes}
      </button>
      <button
        onClick={() => handleVote(-1)}
        className={`px-3 mx-3 py-1 cursor-pointer rounded transition-colors duration-150 ${userVote === -1 ? 'bg-red-500 text-white' : 'bg-gray-200 text-black'
          }`}
      >
        👎 {dislikes}
      </button>
    </div>
  );
}

export default LikeButton;