import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, TablePagination, IconButton, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { toast } from 'react-hot-toast';
import { useGetPostsQuery, useDeletePostMutation, useCreatePostMutation, useUpdatePostMutation } from '../store/api/postApi';
import { hasPermission } from '../utils/permissions';
import DeleteConfirmationModal from '../components/modal/DeleteConfirmationModal';
import AddEditPostModal from '../components/modal/AddEditPostModal';
import ViewPostModal from '../components/modal/ViewPostModal';

const Dashboard = () => {
    const { user, accessToken } = useSelector((state) => state.auth);

    // console.log("user==>", user);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    // console.log("selectedPostID 😍😍", selectedPost, "isEditing:", isEditing);

    const { data: postsResponse, isLoading, error } = useGetPostsQuery(
        { page: page + 1, limit: rowsPerPage, search },
        { skip: !accessToken || !hasPermission(user, 'posts', 'read') }
    );

    const [deletePost, { isLoading: deleteLoading }] = useDeletePostMutation();
    const [createPost] = useCreatePostMutation();
    const [updatePost] = useUpdatePostMutation();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        category: '',
        description: '',
        status: 'Draft'
    });

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(0);
    };

    const handleAddOrEditPost = async () => {
        try {
            if (isEditing) {
                // console.log("✅✅✅ Updating post:", { id: selectedPost.id, ...newPost });
                await updatePost({ id: selectedPost.id, ...newPost }).unwrap();
                toast.success('Post updated successfully');
            } else {
                // console.log("❌❌❌ Creating new post:", newPost);
                await createPost(newPost).unwrap();
                toast.success('Post created successfully');
            }
            setAddModalOpen(false);
            setSelectedPost(null);
            setIsEditing(false);
            setNewPost({ title: '', category: '', description: '', status: 'Draft' });
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to save post');
        }
    };

    const handleDelete = (postId) => {
        const post = postsResponse.posts.find(p => p.id === postId);
        setSelectedPost(post);
        if (!hasPermission(user, 'posts', 'delete')) {
            toast.error('You do not have permission to delete posts');
            return;
        }
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deletePost(selectedPost.id).unwrap();
            toast.success('Post deleted successfully');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete post');
        } finally {
            setDeleteModalOpen(false);
            setSelectedPost(null);
        }
    };

    const handleMenuOpen = (event, post) => {
        // console.log("Opening menu for post:", post);
        setAnchorEl(event.currentTarget);
        setSelectedPost(post);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        // console.log("Editing post:", selectedPost);
        if (selectedPost) {
            setNewPost({ ...selectedPost });
            setIsEditing(true);
            setAddModalOpen(true);
        }
        handleMenuClose();
    };

    const handleView = () => {
        if (selectedPost) {
            setViewModalOpen(true);
        }
        handleMenuClose();
    };

    const handleAddPost = () => {
        setNewPost({ title: '', category: '', description: '', status: 'Draft' });
        setIsEditing(false);
        setAddModalOpen(true);
    };

    const totalPosts = postsResponse?.pagination?.totalPosts || 0;

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'grey.100' }}>
            {isLoading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                    <CircularProgress />
                    <Typography>Loading posts...</Typography>
                </Box>
            ) : error ? (
                <Typography color="error" align="center">Failed to load posts</Typography>
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2, 
                            mb: 4,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'text.primary' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, width: { xs: '100%', sm: 'auto' } }}>
                            {hasPermission(user, 'posts', 'create') && (
                                <Button
                                    sx={{
                                        color: "#ffffff",
                                        px: 2,
                                        bgcolor: '#1e2939',
                                        '&:hover': { bgcolor: '#1e2919' },
                                        width: { xs: '100%', sm: 'auto' }, 
                                    }}
                                    startIcon={<AddIcon />}
                                    onClick={handleAddPost}
                                >
                                    Add Post
                                </Button>
                            )}
                        </Box>
                    </Box>


                    <Box sx={{ mb: 4, maxWidth: { sm: '50%', md: '40%' } }}>
                        <TextField
                            fullWidth
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search posts by title or category..."
                        />
                    </Box>

                    <TableContainer sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.200' }}>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Author</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {postsResponse?.posts?.map((post) => (
                                    <TableRow key={post.id} hover>
                                        <TableCell>{post.title}</TableCell>
                                        <TableCell>{post.category}</TableCell>
                                        <TableCell
                                            sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                            title={post.description}
                                        >
                                            {post.description.slice(0, 50)}...
                                        </TableCell>
                                        <TableCell sx={{ textTransform: "capitalize" }}>{post.author?.firstName} {post.author?.lastName}</TableCell>
                                        <TableCell
                                            sx={{
                                                textTransform: "capitalize",
                                                color:
                                                    post.status === 'draft'
                                                        ? 'orange'
                                                        : post.status === 'published'
                                                            ? 'green'
                                                            : post.status === 'archived'
                                                                ? 'gray'
                                                                : 'black'
                                            }}
                                        >
                                            {post.status}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={(e) => handleMenuOpen(e, post)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                            <Menu
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl) && selectedPost?.id === post.id}
                                                onClose={handleMenuClose}
                                            >
                                                <MenuItem onClick={handleView}>View</MenuItem>
                                                {hasPermission(user, 'posts', 'update') && user.id === post.authorId && (
                                                    <MenuItem onClick={handleEdit}>Edit</MenuItem>
                                                )}
                                                {hasPermission(user, 'posts', 'delete') && (
                                                    <MenuItem onClick={() => handleDelete(post.id)}>Delete</MenuItem>
                                                )}
                                            </Menu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={totalPosts}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />

                    <DeleteConfirmationModal
                        open={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={confirmDelete}
                    />
                    <AddEditPostModal
                        open={addModalOpen}
                        onClose={() => {
                            setAddModalOpen(false);
                            setSelectedPost(null);
                            setIsEditing(false);
                            setNewPost({ title: '', category: '', description: '', status: 'Draft' });
                        }}
                        onSubmit={handleAddOrEditPost}
                        postData={newPost}
                        setPostData={setNewPost}
                        isEditing={isEditing}
                    />
                    <ViewPostModal
                        open={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                        post={selectedPost}
                    />
                </>
            )}
        </Box>
    );
};

export default Dashboard;