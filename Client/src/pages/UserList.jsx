import React, { useState } from 'react';
import { useGetUsersQuery, useDeleteUserMutation } from '../store/api/userApi';
import { useGetRolesQuery } from '../store/api/authApi';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Box, Typography, TextField, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button, CircularProgress, TablePagination } from '@mui/material';
import { hasPermission } from '../utils/permissions';
import DeleteConfirmationModal from '../components/modal/DeleteConfirmationModal';

const UsersList = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');

  const { data: usersResponse, isLoading, error } = useGetUsersQuery(
    { page: page + 1, limit: rowsPerPage, search }, 
    { skip: !accessToken || !hasPermission(user, 'users', 'read') }
  );
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();

  const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useGetRolesQuery(undefined, {
    skip: !accessToken || !hasPermission(user, 'users', 'read'),
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const totalPages = usersResponse?.pagination?.totalPages || 1;
  const totalUsers = usersResponse?.pagination?.totalUsers || 0;

  const getErrorMessage = (error) => {
    switch (error?.status) {
      case 401: return 'Please log in again';
      case 403: return 'You do not have permission to view users';
      case 404: return 'Users endpoint not found. Please check the server configuration.';
      case 500: return 'Server error, please try again later';
      default: return 'Failed to load users';
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const handleDelete = async (userId) => {
    if (userId === user.id) {
      toast.error('Cannot delete your own account');
      return;
    }
    setUserIdToDelete(userId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(userIdToDelete).unwrap();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete user');
    } finally {
      setDeleteModalOpen(false);
      setUserIdToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: '100vh', bgcolor: 'grey.100' }}>
      {(isLoading || rolesLoading) && (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
        </Box>
      )}
      {(error || rolesError) && (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fef2f2', borderRadius: 1 }}>
          {error && toast.error(getErrorMessage(error))}
          {rolesError && toast.error(getErrorMessage(rolesError))}
          <Typography variant="body1" color="error">
            {error ? getErrorMessage(error) : rolesError ? getErrorMessage(rolesError) : ''}
          </Typography>
        </Box>
      )}
      {!(isLoading || rolesLoading || error || rolesError) && usersResponse?.users?.length > 0 && (
        <>
          <Typography variant="h4" component="h2" align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary' }}>
            User Management
          </Typography>

          {hasPermission(user, 'users', 'search') && (
            <Box sx={{ mb: 4, maxWidth: { sm: '50%', md: '40%' } }}>
              <TextField
                fullWidth
                variant="outlined"
                value={search}
                onChange={handleSearch}
                placeholder="Search users by name or email..."
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>
          )}

          <TableContainer sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1, }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.200' }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>View</TableCell>
                  <TableCell>Status</TableCell>
                  {hasPermission(user, 'users', 'delete') && (
                    <TableCell>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {usersResponse?.users?.map((u) => {
                  // console.log("u==>", u);
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.firstName} {u.lastName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>{u.role?.name || u.role}</TableCell>
                      <TableCell>
                        <Link to={`/users/${u.id}`}>
                          <Button variant="text" sx={{ textTransform: 'none', color: '#1976d2' }}>
                            View
                          </Button>
                        </Link>
                      </TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>{u.isActive === true ? 'Active' : 'Inactive'}</TableCell>
                      {hasPermission(user, 'users', 'delete') && (
                        <TableCell>
                          <Button
                            variant="text"
                            color="error"
                            onClick={() => handleDelete(u.id)}
                            disabled={deleteLoading || u.id === user.id}
                            sx={{ textTransform: 'none' }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
              <DeleteConfirmationModal
                open={deleteModalOpen}
                onClose={() => {
                  setDeleteModalOpen(false);
                  setUserIdToDelete(null);
                }}
                onConfirm={confirmDelete}
              />
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[2, 5, 10, 25]}
            labelRowsPerPage="Rows per page:"
            sx={{ mt: 2, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}
          />
        </>
      )}
      {!(isLoading || rolesLoading || error || rolesError) && usersResponse?.users?.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="body1">No users found.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default UsersList;