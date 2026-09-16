import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import QRCode from "qrcode";

interface AttendanceQRCodeProps {
  locationId: string;
}

export interface AttendanceQRCodeRef {
  download: () => void;
}

export const AttendanceQRCode = forwardRef<
  AttendanceQRCodeRef,
  AttendanceQRCodeProps
>(({ locationId }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const url = `${window.location.origin}/attendance/${locationId}`;

    QRCode.toCanvas(canvasRef.current, url, {
      width: 220,
      margin: 2,
      color: {
        dark: "#5C4630",
        light: "#FFFFFF",
      },
    });
  }, [locationId]);

  useImperativeHandle(ref, () => ({
    download: () => {
      if (!canvasRef.current) return;

      const link = document.createElement("a");

      link.download = `qr-${locationId}.png`;
      link.href = canvasRef.current.toDataURL("image/png");

      link.click();
    },
  }));

  return <canvas ref={canvasRef} />;
});