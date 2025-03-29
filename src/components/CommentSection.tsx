import React, { useState } from "react";
import useAuth from "../store/Auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { CommentItem } from "./CommentItem";

interface Props {
    postId: number;
}

export interface Comment {
    id: number;
    postId: number;
    parent_comment_id: number | null;
    content: string;
    user_id: string;
    created_at: string;
    author: string;
}

interface newComment {
    content: string;
    parent_comment_id?: number | null;
}

const createComment = async (newComment: newComment, postId: number, userId?: string, author?: string) => {
    if (!userId || !author) throw new Error("You must be logged in to comment");

    const { error } = await supabase.from("comments").insert({
        post_id: postId,
        content: newComment.content,
        parent_comment_id: newComment.parent_comment_id,
        user_id: userId,
        author: author,
    });

    if (error) {
        console.error("Error creating comment:", error.message);
        throw new Error(error.message);
    }
};

const fetchComments = async (postId: number): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error.message);
        throw new Error(error.message);
    }

    return data as Comment[];
};

function CommentSection({ postId }: Props) {
    const [newCommentText, setNewCommentText] = useState<string>("");
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: comments = [], error, isLoading } = useQuery<Comment[], Error>({
        queryKey: ["comments", postId],
        queryFn: () => fetchComments(postId),
        refetchOnWindowFocus: true,
    });

    const { mutate, isError } = useMutation({
        mutationFn: (newComment: newComment) =>
            createComment(newComment, postId, user?.id, user?.user_metadata.user_name || "Anonymous"),
        onSuccess: () => {
            queryClient.invalidateQueries(["comments", postId]);
        },
        onError: (error: any) => {
            alert(`Error posting comment: ${error.message}`);
        },
    });

    const buildCommentTree = (flatComments: Comment[]): (Comment & { children?: Comment[] })[] => {
        if (!Array.isArray(flatComments)) {
            console.error("Invalid data passed to buildCommentTree:", flatComments);
            return [];
        }

        const map = new Map<number, Comment & { children?: Comment[] }>();
        const roots: (Comment & { children?: Comment[] })[] = [];

        flatComments.forEach((comment) => {
            map.set(comment.id, { ...comment, children: [] });
        });

        flatComments.forEach((comment) => {
            if (comment.parent_comment_id) {
                const parent = map.get(comment.parent_comment_id);
                if (parent) {
                    parent.children!.push(map.get(comment.id)!);
                }
            } else {
                roots.push(map.get(comment.id)!);
            }
        });

        return roots;
    };

    const commentTree = Array.isArray(comments) ? buildCommentTree(comments) : [];

    if (error) return <div className="text-red-500">Error loading comments: {error.message}</div>;
    if (isLoading) return <div>Loading Comments...</div>;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCommentText.trim()) {
            alert("Comment cannot be empty");
            return;
        }
        mutate({ content: newCommentText, parent_comment_id: null });
        setNewCommentText("");
    };

    return (
        <div className="p-4 border border-gray-300 rounded-lg">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Comments</h3>
            <div>
                {commentTree.length === 0 ? (
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                ) : (
                    commentTree.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} postId={postId} />
                    ))
                )}
            </div>
            {user ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <textarea
                        rows={3}
                        placeholder="Write a comment"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!newCommentText.trim() || isLoading}
                        className={`px-4 py-2 text-white rounded-md text-base ${isLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                            }`}
                    >
                        {isLoading ? "Posting Comment..." : "Post Comment"}
                    </button>
                    {isError && <p className="text-red-500 text-sm">Error posting comment</p>}
                </form>
            ) : (
                <p className="text-gray-600 text-base">You must be logged in to post a comment</p>
            )}
        </div>
    );
}

export default CommentSection;