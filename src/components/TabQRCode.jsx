import { QRCodeSVG } from "qrcode.react";
import "../styles/TabQRCode.css";

export default function TabQRCode({ tabId, size = 168 }) {
  const url = `${window.location.origin}/tab/${tabId}`;

  return (
    <div className="tab-qr-card">
      <QRCodeSVG value={url} size={size} bgColor="transparent" fgColor="currentColor" level="M" />
      <span className="tab-qr-caption">Scan to join</span>
    </div>
  );
}