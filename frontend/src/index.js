import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AvatarCreator from './components/AvatarCreator';
import Configuration from './components/Configuration';
import CombinedAvatar from "./components/avatar/CombinedAvatar";
import './index.css';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AvatarCreator />} />
        <Route path="/avatar" element={<CombinedAvatar/>} />
        
        <Route path="/configuration" element={<Configuration/>} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);