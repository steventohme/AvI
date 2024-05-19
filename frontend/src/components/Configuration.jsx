import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from "react-router-dom";

export default function Configuration() {
  const [audioSrc, setAudioSrc] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [description, setDescription] = useState('');
  const [name, setName] = useState(''); 
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'audio/*',
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setAudioFile(file);
        const audioURL = URL.createObjectURL(file);
        setAudioSrc(audioURL);
      }
    },
  });

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioSrc(audioURL);
        setAudioFile(audioBlob);
        audioChunksRef.current = [];
      });
      mediaRecorderRef.current.start();
      setRecording(true);
    });
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

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
      <div>
        <button onClick={recording ? stopRecording : startRecording}>
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
      { audioSrc && (
        <div style={{ marginTop: '20px' }}>
          <audio controls src={audioSrc} />
        </div>
      )}
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

            fetch('http://localhost:3001/load-user-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ user_name: name, user_prompt: description })
            })

            navigate("/avatar")
        }}>
          Submit
        </button>
      </div>
    </div>
  );
};