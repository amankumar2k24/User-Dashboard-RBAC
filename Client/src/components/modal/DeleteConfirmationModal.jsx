import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const DeleteConfirmationModal = ({ open, onClose, onConfirm }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        minWidth: { xs: '80%', sm: 400 },
        maxWidth: 500,
      }}>
        <Typography variant="h6" component="h2" className="font-bold text-gray-800 mb-4">
          Confirm Deletion
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6">
          Are you sure you want to delete this user? This action cannot be undone.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={onClose}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              '&:hover': { bgcolor: '#333333' },
              textTransform: 'none',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            sx={{
              bgcolor: '#dc2626',
              color: 'white',
              '&:hover': { bgcolor: '#b91c1c' },
              textTransform: 'none',
              px: 3,
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteConfirmationModal;