import React, { useState } from 'react';

const FeedForm = ({ onAddFeed }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) {
      setError('URL is required');
      return;
    }

    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!urlPattern.test(url)) {
      setError('Invalid URL format');
      return;
    }

    onAddFeed(url);
    setUrl('');
    setError('');
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default FeedForm;

