import { Environment, Sparkles } from "@react-three/drei";
import CreateSceneContent from "./CreateSceneContent.jsx";
import GuestSceneContent from "./GuestSceneContent.jsx";
import SummarySceneContent from "./SummarySceneContent.jsx";

const PAPER_COLOR = "#fff7d7";
const ACCENT_COLOR = "#5c7c93";

export default function ReceiptScene({ screen }) {
  return (
    <>
      <ambientLight intensity={0.5} color={PAPER_COLOR} />
      <directionalLight position={[3, 5, 4]} intensity={0.6} color={ACCENT_COLOR} />
      <Environment preset="apartment" />
      <Sparkles count={40} scale={[10, 6, 6]} size={2} speed={0.2} color={ACCENT_COLOR} opacity={0.35} />

      {screen === "create" && <CreateSceneContent />}
      {screen === "guest" && <GuestSceneContent />}
      {screen === "summary" && <SummarySceneContent />}
    </>
  );
}