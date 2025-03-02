import React from 'react';

const FeedList = ({ feeds }) => {
  return (
    <ul>
      {feeds.map(feed => (
        <li key={feed.id}>
          <h3>{feed.title}</h3>
          <p>{feed.description}</p>
        </li>
      ))}
    </ul>
  );
};

export default FeedList;
