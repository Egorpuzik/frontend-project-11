import React from 'react';

const PostList = ({ posts }) => {
  return (
    <ul>
      {posts.map((post, index) => (
        <li key={index}>
          <a href={post.link} target="_blank" rel="noopener noreferrer">
            {post.title}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
