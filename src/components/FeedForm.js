import React, { useState } from 'react';

const FeedForm = ({ onAddFeed }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddFeed(url);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="url" 
        placeholder="Enter RSS feed URL" 
        value={url} 
        onChange={(e) => setUrl(e.target.value)} 
        required 
      />
      <button type="submit">Add Feed</button>
    </form>
  );
};

export default FeedForm;
