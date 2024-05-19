import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./Experience";
import { UI } from "./UI";
import {ChatProvider} from "../../hooks/useChat"

function CombinedAvatar() {
  return (
    <ChatProvider>
      <>
        <Loader />
        <Leva />
        <UI />
        <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <Experience />
        </Canvas>
      </>
    </ChatProvider>
  );
}

export default CombinedAvatar;
