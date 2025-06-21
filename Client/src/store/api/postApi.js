import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/posts', 
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken; 
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery,
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: '/',
        params: { page, limit, search },
      }),
      providesTags: ['Post'],
    }),
    getPostById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['Post'],
    }),
    createPost: builder.mutation({
      query: (newPost) => ({
        url: '/',
        method: 'POST',
        body: newPost,
      }),
      invalidatesTags: ['Post'],
    }),
    updatePost: builder.mutation({
      query: ({ id, ...updatedPost }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: updatedPost,
      }),
      invalidatesTags: ['Post'],
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;
