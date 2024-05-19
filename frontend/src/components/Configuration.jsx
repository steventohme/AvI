import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function Configuration() {
  const [description, setDescription] = useState('');
  const [name, setName] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe yourself here..."
          rows="4"
          cols="50"
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
      <button onClick={() => {
            setIsLoading(true);
            fetch('http://localhost:3001/load-user-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ user_name: name, user_prompt: description })
            })
            .then(() => {
              setTimeout(() => {
                setIsLoading(false);
                navigate("/avatar");
              }, 45000);
            })
            .catch(err => {
              setIsLoading(false);
              console.error(err);
            });
        }}>
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};