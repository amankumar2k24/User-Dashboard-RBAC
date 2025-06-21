import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Avatar, TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import moment from 'moment';
import CancelIcon from '@mui/icons-material/Cancel';

const ViewPostModal = ({ open, onClose, post }) => {
    const createdAt = post?.createdAt ? new Date(post.createdAt) : new Date();
    // console.log("post==>", post)

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        alt="Profile"
                        src={post?.author?.profileImage
                            ? `http://localhost:3333/uploads/profiles/${post?.author?.profileImage}`
                            : 'U'
                        }
                        sx={{ width: 64, height: 64, border: '4px solid #e0f7fa' }}
                    />
                    <Typography variant="h6">{post?.author?.firstName} {post?.author?.lastName}</Typography>
                </Box>
                <Box sx={{ cursor: 'pointer' }}>
                    <CancelIcon onClick={onClose} />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="h5" gutterBottom>{post?.title}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {moment(createdAt).format('MMMM Do YYYY, h:mm:ss a')}
                </Typography>
                <Typography variant="body1" paragraph>{post?.description}</Typography>

                <TableContainer component={Paper} sx={{ maxWidth: 600, mt: 2 }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell>{post?.category || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell>{post?.status || '-'}</TableCell>
                            </TableRow>
                            {post?.tags && (
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tags</TableCell>
                                    <TableCell>{post.tags.join(', ')}</TableCell>
                                </TableRow>
                            )}
                            {post?.readingTime && (
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Reading Time</TableCell>
                                    <TableCell>{post.readingTime} minutes</TableCell>
                                </TableRow>
                            )}
                            {post?.excerpt && (
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Excerpt</TableCell>
                                    <TableCell>{post.excerpt}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    );
};

export default ViewPostModal;