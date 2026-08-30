import { Environment } from "@react-three/drei";
import CreateSceneContent from "./CreateSceneContent.jsx";
import GuestSceneContent from "./GuestSceneContent.jsx";
import SummarySceneContent from "./SummarySceneContent.jsx";

const PAPER_COLOR = "#fff7d7"; // --butter-100
const ACCENT_COLOR = "#5c7c93"; // --blue-600

export default function ReceiptScene({ screen }) {
  return (
    <>
      <ambientLight intensity={0.5} color={PAPER_COLOR} />
      <directionalLight position={[3, 5, 4]} intensity={0.6} color={ACCENT_COLOR} />
      <Environment preset="apartment" />

      {screen === "create" && <CreateSceneContent />}
      {screen === "guest" && <GuestSceneContent />}
      {screen === "summary" && <SummarySceneContent />}
    </>
  );
}