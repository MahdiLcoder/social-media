import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import CreatePostPage from '../pages/CreatePostPage'
import PostPage from '../pages/PostPage'
import CreateCommunityPage from '../pages/CreateCommunityPage'
import CommunitiesPage from '../pages/CommunitiesPage'
import { CommunityPage } from '../pages/CommunityPage'

function AllRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/community/create" element={<CreateCommunityPage />} /> 
            <Route path="/community/:id" element={<CommunityPage />} />
        </Routes>
    )
}

export default AllRoutes