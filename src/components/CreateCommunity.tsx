import { QueryClient, useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { supabase } from "../supabase-client";
import { useNavigate } from "react-router-dom";

interface Community {
    name: string;
    description: string;
}

const createCommunity = async ({ name, description }: Community): Promise<Community[]> => {
    const { data, error } = await supabase.from("communities").insert({
        name: name,
        description: description,
    });

    if (error) throw new Error(error.message);

    return data as Community[];
};

const queryClient = new QueryClient();

function CreateCommunity() {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const navigate = useNavigate();

    const { mutate, isError, isPending } = useMutation({
        mutationFn: createCommunity,
        onSuccess: () => {
        navigate('/communities');
        },
        onError: (error: any) => {
            alert(`Error creating community: ${error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate({ name, description });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Create New Community
            </h2>
            <div>
                <label htmlFor="name" className="block mb-2 font-medium">
                    Community Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-white/10 bg-transparent p-2 rounded"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block mb-2 font-medium">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-white/10 bg-transparent p-2 rounded"
                    rows={3}
                />
            </div>
            <button
                type="submit"
                className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
            >
                {isPending ? "Creating..." : "Create Community"}
            </button>
            {isError && <p className="text-red-500">Error creating community.</p>}
        </form>
    );
}

export default CreateCommunity;