import React from 'react'
import PostDetails from '../components/PostDetails'
import { useParams } from 'react-router-dom'

function PostPage() {

    const { id } = useParams<{id: string}>();
  return (
    <div className="pt-20">
        <PostDetails postId = {Number(id)} />
    </div>
  )
}

export default PostPage