import React, { useEffect } from "react";
import { PostList } from "./PostList";

export const Home = () => {
    useEffect(() => {
        const revealElements = document.querySelectorAll(".reveal");
        const handleScroll = () => {
            revealElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add("visible");
                }
            });
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="home-container">
            <h1 className="text-center text-4xl font-bold mt-4 mb-8 text-white">
                Welcome to Social Media
            </h1>
            <div className="post-list reveal">
                <PostList />
            </div>
        </div>
    );
};
