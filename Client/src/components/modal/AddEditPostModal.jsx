import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Switch, FormControlLabel } from '@mui/material';

const AddEditPostModal = ({ open, onClose, onSubmit, postData, setPostData, isEditing }) => {

  // console.log("isEditing 😏😏😏😏", isEditing)
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Edit Post Modal' : 'Add New Post'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Title"
          value={postData.title}
          onChange={(e) => setPostData({ ...postData, title: e.target.value })}
          required
        />
        <TextField
          fullWidth
          margin="dense"
          label="Category"
          value={postData.category}
          onChange={(e) => setPostData({ ...postData, category: e.target.value })}
          required
        />
        <TextField
          fullWidth
          margin="dense"
          label="Description"
          multiline
          minRows={3}
          value={postData.description}
          onChange={(e) => setPostData({ ...postData, description: e.target.value })}
          required
        />
        <TextField
          fullWidth
          margin="dense"
          label="Tags (comma-separated)"
          value={postData.tags ? postData.tags.join(', ') : ''}
          onChange={(e) => setPostData({ ...postData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
        />
        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          value={postData.status}
          onChange={(e) => setPostData({ ...postData, status: e.target.value })}
          required
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </TextField>
        <FormControlLabel
          control={
            <Switch
              checked={postData.featured}
              onChange={(e) => setPostData({ ...postData, featured: e.target.checked })}
            />
          }
          label="Featured"
        />
        <TextField
          fullWidth
          margin="dense"
          label="Reading Time (minutes)"
          type="number"
          value={postData.readingTime || ''}
          onChange={(e) => setPostData({ ...postData, readingTime: parseInt(e.target.value) || null })}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Excerpt"
          multiline
          minRows={2}
          value={postData.excerpt || ''}
          onChange={(e) => setPostData({ ...postData, excerpt: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button sx={{ color: '#1e2939', }} onClick={onClose}>Cancel</Button>
        <Button sx={{ color: "white", bgcolor: '#1e2939', '&:hover': { bgcolor: '#1e2919' } }} onClick={onSubmit}>{isEditing ? 'Save' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditPostModal;