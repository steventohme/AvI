import { AvatarCreator, AvatarCreatorConfig, AvatarExportedEvent } from '@readyplayerme/react-avatar-creator';
import { useNavigate } from "react-router-dom";



const config: AvatarCreatorConfig = {
  clearCache: true,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'en',
};

const style = { width: '100%', height: '100vh', border: 'none' };

export default function App() {
  const navigate = useNavigate();
  navigate('/configuration');
  const handleOnAvatarExported = async (event: AvatarExportedEvent) => {
    const response = await fetch('http://localhost:3001/download-glb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: event.data.url })
    });
  
    if (!response.ok) {
      console.error('Failed to download file:', response.statusText);
    }

  };
  
 

  return (
      <>
      {/* avi-1tky8w.readyplayer.me?frameApi */}
        <AvatarCreator subdomain="demo" config={config} style={style} onAvatarExported={handleOnAvatarExported} />
      </>
  );
}