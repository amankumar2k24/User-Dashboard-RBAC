import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/users',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithRefresh = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      const { refreshToken } = api.getState().auth;

      if (refreshToken) {
        // console.log('Refresh token available:', refreshToken.substring(0, 20) + '...');
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh-token',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResult.data;
          api.dispatch(setCredentials({ accessToken, refreshToken: newRefreshToken, user: api.getState().auth.user }));
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(setCredentials({ accessToken: null, refreshToken: null, user: null }));
        }
      } else {
        api.dispatch(setCredentials({ accessToken: null, refreshToken: null, user: null }));
      }
    } else if (result.error.status === 403) {
      api.dispatch(setCredentials({ accessToken: null, refreshToken: null, user: null }));
    }
  }

  return result;
};

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: '/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (passwords) => ({
        url: '/change-password',
        method: 'PUT',
        body: passwords,
      }),
    }),
    getUsers: builder.query({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
} = userApi;
