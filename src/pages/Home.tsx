import React from 'react'
import PostList from '../components/PostList'

function Home() {
  return (
    <div className="flex flex-col  items-center pt-20">
      <h2 className="text-6xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
      Recent Posts
      </h2>
      <div className="w-full  my-3">
      <PostList />
      </div>
    </div>
  )
}

export default Home