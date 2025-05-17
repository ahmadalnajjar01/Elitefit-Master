import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import * as cam from "@mediapipe/camera_utils";
import {
  ZoomIn,
  ZoomOut,
  Timer,
  ArrowUp,
  Camera,
  Ruler,
  Info,
  AlertTriangle,
} from "lucide-react";

export default function BodySizeEstimator() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [measurements, setMeasurements] = useState({
    shoulderCM: null,
    hipCM: null,
  });
  const [finalSize, setFinalSize] = useState(null);
  const [pixelsPerCM, setPixelsPerCM] = useState(8.5);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(5);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const measurementsRef = useRef([]);
  const timerRef = useRef(null);

  // Size chart with realistic ranges
  const sizeChart = {
    XXS: { shoulder: [30, 35], hip: [70, 76] },
    XS: { shoulder: [36, 39], hip: [77, 84] },
    S: { shoulder: [40, 43], hip: [85, 92] },
    M: { shoulder: [44, 47], hip: [93, 100] },
    L: { shoulder: [22, 25], hip: [11, 15] },
    XL: { shoulder: [25, 28], hip: [17, 20] },
    XXL: { shoulder: [56, 60], hip: [117, 124] },
  };

  const getRecommendedSize = (shoulder, hip) => {
    let bestMatch = "XS"; // Default fallback
    let smallestDiff = Infinity;

    for (const [size, range] of Object.entries(sizeChart)) {
      const shoulderMid = (range.shoulder[0] + range.shoulder[1]) / 2;
      const hipMid = (range.hip[0] + range.hip[1]) / 2;

      const shoulderDiff = Math.abs(shoulder - shoulderMid);
      const hipDiff = Math.abs(hip - hipMid);
      const totalDiff = shoulderDiff + hipDiff;

      if (totalDiff < smallestDiff) {
        smallestDiff = totalDiff;
        bestMatch = size;
      }
    }

    return bestMatch;
  };

  const startMeasurement = () => {
    setIsMeasuring(true);
    setTimer(5);
    measurementsRef.current = [];
    setFinalSize(null);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          calculateFinalSize();
          setIsMeasuring(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const calculateFinalSize = () => {
    if (measurementsRef.current.length === 0) return;

    // Calculate average of last measurements
    const avgShoulder =
      measurementsRef.current.reduce((sum, m) => sum + m.shoulder, 0) /
      measurementsRef.current.length;
    const avgHip =
      measurementsRef.current.reduce((sum, m) => sum + m.hip, 0) /
      measurementsRef.current.length;

    setFinalSize(getRecommendedSize(avgShoulder, avgHip));
  };

  useEffect(() => {
    if (isMeasuring && measurements.shoulderCM && measurements.hipCM) {
      measurementsRef.current.push({
        shoulder: parseFloat(measurements.shoulderCM),
        hip: parseFloat(measurements.hipCM),
      });
    }
  }, [measurements, isMeasuring]);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      canvas.width = 640;
      canvas.height = 480;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        if (results.image) {
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        }

        if (results.poseLandmarks) {
          drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2,
          });
          drawLandmarks(ctx, results.poseLandmarks, {
            color: "#FF0000",
            lineWidth: 1,
          });

          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const leftHip = results.poseLandmarks[23];
          const rightHip = results.poseLandmarks[24];

          if (leftShoulder && rightShoulder && leftHip && rightHip) {
            setIsDetecting(true);

            const toPixels = (landmark) => ({
              x: landmark.x * canvas.width,
              y: landmark.y * canvas.height,
            });

            const shoulderWidth = Math.hypot(
              toPixels(leftShoulder).x - toPixels(rightShoulder).x,
              toPixels(leftShoulder).y - toPixels(rightShoulder).y
            );

            const hipWidth = Math.hypot(
              toPixels(leftHip).x - toPixels(rightHip).x,
              toPixels(leftHip).y - toPixels(rightHip).y
            );

            setMeasurements({
              shoulderCM: (shoulderWidth / pixelsPerCM).toFixed(1),
              hipCM: (hipWidth / pixelsPerCM).toFixed(1),
            });
          } else {
            setIsDetecting(false);
          }
        }
      } catch (e) {
        console.error("Error processing results:", e);
        setError("Error processing body measurements");
      } finally {
        ctx.restore();
      }
    });

    let camera;
    if (videoRef.current) {
      try {
        camera = new cam.Camera(videoRef.current, {
          onFrame: async () => {
            try {
              await pose.send({ image: videoRef.current });
            } catch (e) {
              console.error("Camera frame error:", e);
              setError("Error processing video feed");
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
      } catch (e) {
        console.error("Camera initialization error:", e);
        setError("Failed to start camera");
      }
    }

    return () => {
      if (camera) camera.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pixelsPerCM]);

  const adjustCalibration = (adjustment) => {
    setPixelsPerCM((prev) => Math.max(5, Math.min(15, prev + adjustment)));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          {error}
        </div>
      )}

      <video
        ref={videoRef}
        style={{ display: "none" }}
        autoPlay
        muted
        playsInline
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border rounded-lg shadow-lg"
          width={640}
          height={480}
        />
        <button
          className="fixed bottom-6 right-6 bg-[#F0BB78] text-white rounded-full p-3 shadow-lg hover:bg-[#F0BB78] z-10 hover:scale-110 transition-transform"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <ArrowUp size={24} />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {/* <button
          onClick={() => adjustCalibration(-0.5)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
        >
          <ZoomOut size={18} className="mr-2 text-[#F0BB78]" />
          Zoom Out
        </button> */}
        {/* <button
          onClick={() => adjustCalibration(0.5)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
        >
          <ZoomIn size={18} className="mr-2 text-[#F0BB78]" />
          Zoom In
        </button> */}
      </div>

      {!isMeasuring ? (
        <button
          onClick={startMeasurement}
          className="px-6 py-3 bg-[#F0BB78] text-white rounded-lg hover:bg-[#e4af6d] flex items-center shadow-md transition-colors"
        >
          <Camera size={20} className="mr-2" />
          Start 5-Second Measurement
        </button>
      ) : (
        <div className="px-6 py-3 bg-[#F0BB78] bg-opacity-20 text-[#F0BB78] rounded-lg flex items-center shadow-md">
          <Timer size={20} className="mr-2 animate-pulse" />
          Measuring... {timer}s remaining
        </div>
      )}

      <div className="text-left w-full max-w-md bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <p className="mb-3 flex items-center">
          <Ruler size={18} className="mr-2 text-[#F0BB78]" />
          <strong className="text-lg">Calibration:</strong>{" "}
          <span className="ml-2">{pixelsPerCM.toFixed(2)} pixels/cm</span>
        </p>

        <div className="mb-3 p-4 bg-gray-50 rounded-lg">
          <p className="mb-2">
            <strong>Shoulder Width:</strong>{" "}
            <span className="font-semibold text-[#F0BB78]">
              {measurements.shoulderCM ||
                (isDetecting ? "Calculating..." : "—")}{" "}
              cm
            </span>
          </p>
          <p>
            <strong>Hip Width:</strong>{" "}
            <span className="font-semibold text-[#F0BB78]">
              {measurements.hipCM || (isDetecting ? "Calculating..." : "—")} cm
            </span>
          </p>
        </div>

        {finalSize && (
          <div className="p-4 bg-[#F0BB78] bg-opacity-10 rounded-lg border border-[#F0BB78] border-opacity-30">
            <p className="text-lg font-bold flex items-center">
              <strong>Nearest Size:</strong>{" "}
              <span className="text-black ml-2 text-xl">{finalSize}</span>
            </p>
            <p className="text-sm mt-1 text-gray-700">
              Shoulder: {measurements.shoulderCM}cm | Hip: {measurements.hipCM}
              cm
            </p>
          </div>
        )}

        <div className="mt-5 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p className="font-medium flex items-center mb-2">
            <Info size={16} className="mr-2 text-[#F0BB78]" />
            Instructions:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Stand 1.5-2 meters from camera</li>
            <li>Face directly forward with arms slightly away from body</li>
            <li>Click "Start Measurement" and hold still for 5 seconds</li>
            <li>Your size will be calculated automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
