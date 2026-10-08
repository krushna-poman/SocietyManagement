import { useEffect, useRef, useState } from "react";

function PunchOut({
  onBack,
  project,
}) {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);

  const [locationStatus, setLocationStatus] =
    useState("Capturing location...");

  const [locationName, setLocationName] =
    useState("");

  const [cameraError, setCameraError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ==========================================
  // START CAMERA + LOCATION
  // ==========================================

  useEffect(() => {
    startCamera();
    getLocation();

    return () => {
      stopCamera();
    };
  }, []);

  // ==========================================
  // CAMERA
  // ==========================================

  const startCamera = async () => {
    try {
      setCameraError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Camera is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 500,
            },
            height: {
              ideal: 500,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error(
        "Camera Error:",
        error
      );

      setCameraError(
        "Camera permission is required."
      );
    }
  };

  // ==========================================
  // STOP CAMERA
  // ==========================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }
  };

  // ==========================================
  // LOCATION
  // ==========================================

  const getLocation = () => {
    setLocation(null);

    setLocationStatus(
      "Capturing location..."
    );

    setLocationName("");

    if (!navigator.geolocation) {
      setLocationStatus(
        "❌ Location not supported"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        // =====================================
        // SAVE GPS INTERNALLY
        // Backend साठी
        // =====================================

        setLocation({
          latitude,
          longitude,
        });

        setLocationStatus(
          "✅ Location captured"
        );

        // =====================================
        // GPS → FULL ADDRESS
        // =====================================

        try {
          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );

          if (!response.ok) {
            throw new Error(
              "Location service failed"
            );
          }

          const data =
            await response.json();

          const address =
            data.address || {};

          // =====================================
          // FULL ADDRESS PARTS
          // =====================================

          const addressParts = [
            address.house_number,
            address.road,
            address.neighbourhood,
            address.suburb,
            address.quarter,
            address.village,
            address.town,
            address.city,
            address.city_district,
            address.district,
            address.state,
            address.postcode,
            address.country,
          ];

          // =====================================
          // REMOVE EMPTY + DUPLICATE VALUES
          // =====================================

          const fullAddress = [
            ...new Set(
              addressParts.filter(
                (item) =>
                  item &&
                  String(item).trim() !== ""
              )
            ),
          ].join(", ");

          setLocationName(
            fullAddress ||
              data.display_name ||
              "Location not found"
          );
        } catch (error) {
          console.error(
            "Reverse Geocoding Error:",
            error
          );

          setLocationName(
            "Unable to get full location"
          );
        }
      },

      (error) => {
        console.error(
          "Location Error:",
          error
        );

        setLocation(null);

        setLocationStatus(
          "❌ Location permission required"
        );

        setLocationName("");
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================
  // CAPTURE PHOTO
  // ==========================================

  const capturePhoto = () => {
    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (video.readyState < 2) {
      setMessage(
        "Camera is not ready yet."
      );
      return;
    }

    const width =
      video.videoWidth || 500;

    const height =
      video.videoHeight || 500;

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setMessage(
            "Photo capture failed."
          );
          return;
        }

        const imageUrl =
          URL.createObjectURL(blob);

        setPhoto({
          blob,
          preview: imageUrl,
        });

        setMessage("");

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // ==========================================
  // RETAKE PHOTO
  // ==========================================

  const retakePhoto = () => {
    if (photo?.preview) {
      URL.revokeObjectURL(
        photo.preview
      );
    }

    setPhoto(null);

    setMessage("");

    startCamera();
  };

  // ==========================================
  // PUNCH OUT
  // ==========================================

  const handlePunchOut = async () => {
    setMessage("");

    // PHOTO CHECK
    if (!photo) {
      setMessage(
        "📷 Please capture your photo first."
      );
      return;
    }

    // LOCATION CHECK
    if (!location) {
      setMessage(
        "📍 Location is required."
      );

      getLocation();

      return;
    }

    // USER CHECK
    const storedUser =
      JSON.parse(
        sessionStorage.getItem(
          "user"
        ) ||
          localStorage.getItem(
            "user"
          ) ||
          "null"
      );

    if (!storedUser?.id) {
      setMessage(
        "User login information not found."
      );

      return;
    }

    setLoading(true);

    try {
      // =====================================
      // API
      // =====================================

     const API_URL =
  `${import.meta.env.VITE_API_URL}/api/punch/out`;

      // =====================================
      // FORM DATA
      // =====================================

      const formData =
        new FormData();

      formData.append(
        "user_id",
        storedUser.id
      );

      if (!project?.id) {
  setMessage(
    "Please select a project first."
  );
  setLoading(false);
  return;
}

formData.append(
  "project_id",
  project.id
);

      // GPS internally send
      formData.append(
        "latitude",
        location.latitude
      );

      formData.append(
        "longitude",
        location.longitude
      );

      // PHOTO
      formData.append(
        "photo",
        photo.blob,
        "punch-out-photo.jpg"
      );

      // =====================================
      // SEND REQUEST
      // =====================================

      const response =
        await fetch(
          API_URL,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      // =====================================
      // ERROR
      // =====================================

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "Punch Out failed."
        );

        setLoading(false);

        return;
      }

      // =====================================
      // SUCCESS
      // =====================================

      setMessage(
        "✅ Punch Out successful!"
      );

      if (photo?.preview) {
        URL.revokeObjectURL(
          photo.preview
        );
      }

      setPhoto(null);
    } catch (error) {
      console.error(
        "Punch Out Error:",
        error
      );

      setMessage(
        "❌ Server connection failed."
      );
    }

    setLoading(false);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="punch-out-page">

      {/* BACK */}

      <button
        type="button"
        className="punch-out-back"
        onClick={onBack}
      >
        ← Back
      </button>

      <div className="punch-out-box">

        {/* =================================
            CAMERA
        ================================= */}

        <div className="punch-out-camera-section">

          <div className="punch-out-camera-circle">

            {photo ? (
              <img
                src={photo.preview}
                alt="Punch Out"
                className="punch-out-photo"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="punch-out-live-camera"
              />
            )}

          </div>

          {cameraError && (
            <div className="punch-out-camera-error">
              {cameraError}
            </div>
          )}

        </div>

        {/* CANVAS */}

        <canvas
          ref={canvasRef}
          style={{
            display: "none",
          }}
        />

        {/* =================================
            PHOTO BUTTON
        ================================= */}

        {!photo ? (
          <button
            type="button"
            className="punch-out-capture-btn"
            onClick={capturePhoto}
          >
            📷 Capture Photo
          </button>
        ) : (
          <button
            type="button"
            className="punch-out-retake-btn"
            onClick={retakePhoto}
          >
            🔄 Retake Photo
          </button>
        )}

        {/* =================================
            LOCATION
        ================================= */}

        <div className="punch-out-location-box">

          <div className="punch-out-location-icon">
            📍
          </div>

          <div className="punch-out-location-info">

            <div className="punch-out-location-title">
              Location
            </div>

            <div
              className={
                location
                  ? "punch-out-location-success"
                  : "punch-out-location-loading"
              }
            >
              {locationStatus}
            </div>

            {/* FULL ADDRESS ONLY */}

            {location && (
              <div className="punch-out-location-name">
                {locationName ||
                  "Finding exact location..."}
              </div>
            )}

          </div>

        </div>

        {/* =================================
            RETRY LOCATION
        ================================= */}

        {!location && (
          <button
            type="button"
            className="punch-out-location-btn"
            onClick={getLocation}
          >
            📍 Retry Location
          </button>
        )}

        {/* =================================
            PUNCH OUT BUTTON
        ================================= */}

        <button
          type="button"
          className="punch-out-submit-btn"
          onClick={handlePunchOut}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : "🔴 Punch Out"}
        </button>

        {/* =================================
            MESSAGE
        ================================= */}

        {message && (
          <div className="punch-out-message">
            {message}
          </div>
        )}

      </div>

      {/* ==========================================
          CSS
      ========================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .punch-out-page {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        /* ==============================
           BACK
        ============================== */

        .punch-out-back {
          border: none;
          background: white;
          padding: 10px 16px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 16px;

          box-shadow:
            0 3px 10px rgba(0,0,0,0.06);
        }

        /* ==============================
           MAIN BOX
        ============================== */

      .punch-out-box {
  width: 500px;
  max-width: calc(100% - 30px);

  margin: 10px auto;

  background: white;

  border-radius: 18px;

  padding: 16px;

  text-align: center;

  box-shadow:
    0 6px 22px rgba(0,0,0,0.07);

  overflow: hidden;
}

        /* ==============================
           CAMERA
        ============================== */

        .punch-out-camera-section {
          width: 100%;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;
        }

        .punch-out-camera-circle {
          width: 175px;
          height: 175px;

          border-radius: 50%;

          overflow: hidden;

          background: #eef0f3;

          border: 6px solid #e5e7eb;

          display: flex;

          align-items: center;

          justify-content: center;

          box-shadow:
            0 8px 25px rgba(0,0,0,0.10);

          flex-shrink: 0;
        }

        .punch-out-live-camera,
        .punch-out-photo {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;
        }

        .punch-out-camera-error {
          margin-top: 12px;

          color: #dc2626;

          font-size: 14px;

          line-height: 1.5;
        }

        /* ==============================
           CAPTURE
        ============================== */
.punch-out-capture-btn {
  width: 100%;

  margin-top: 10px;

  border: none;

  background: #2563eb;

  color: white;

  padding: 10px;

  border-radius: 10px;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;
}

        .punch-out-capture-btn:active {
          transform: scale(0.98);
        }

        /* ==============================
           RETAKE
        ============================== */

        .punch-out-retake-btn {
          margin-top: 15px;

          border: none;

          background: #f3f4f6;

          color: #374151;

          padding: 10px 20px;

          border-radius: 10px;

          font-weight: 700;

          cursor: pointer;
        }

        /* ==============================
           LOCATION
        ============================== */

        .punch-out-location-box {
          width: 100%;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          padding: 16px;

          margin-top: 20px;

          margin-bottom: 18px;

          background: #f8fafc;

          border: 1px solid #e5e7eb;

          border-radius: 14px;

          overflow: hidden;
        }

        .punch-out-location-icon {
          font-size: 30px;

          margin-bottom: 4px;
        }

        .punch-out-location-info {
          width: 100%;

          min-width: 0;
        }

        .punch-out-location-title {
          font-size: 16px;

          font-weight: 700;

          color: #172033;
        }

        .punch-out-location-success {
          margin-top: 4px;

          color: #16a34a;

          font-size: 14px;

          font-weight: 600;
        }

        .punch-out-location-loading {
          margin-top: 4px;

          color: #dc2626;

          font-size: 14px;

          font-weight: 600;
        }

        /* ==============================
           FULL ADDRESS
        ============================== */

        .punch-out-location-name {
          margin-top: 7px;

          color: #374151;

          font-size: 14px;

          font-weight: 600;

          line-height: 1.5;

          word-break: break-word;
        }

        /* ==============================
           RETRY LOCATION
        ============================== */

        .punch-out-location-btn {
          border: none;

          background: #eef2ff;

          color: #2563eb;

          padding: 10px 18px;

          border-radius: 10px;

          font-weight: 700;

          cursor: pointer;

          margin-bottom: 18px;
        }

        /* ==============================
           PUNCH OUT
        ============================== */

        .punch-out-submit-btn {
          width: 100%;

          border: none;

          background: #dc2626;

          color: white;

          padding: 16px;

          border-radius: 12px;

          font-size: 19px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .punch-out-submit-btn:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 18px rgba(0,0,0,0.15);
        }

        .punch-out-submit-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }

        /* ==============================
           MESSAGE
        ============================== */

        .punch-out-message {
          width: 100%;

          margin-top: 18px;

          padding: 12px;

          border-radius: 10px;

          background: #f3f4f6;

          font-weight: 600;

          font-size: 14px;

          word-break: break-word;
        }

        /* ==============================
           TABLET
        ============================== */

        @media (max-width: 768px) {

          .punch-out-page {
            width: 100%;
            max-width: 100%;

            overflow-x: hidden;
          }

          .punch-out-box {
            width: 100%;

            max-width: 100%;

            margin: 15px 0 20px;

            padding: 24px 14px;

            border-radius: 18px;
          }

          .punch-out-camera-circle {
            width: 200px;
            height: 200px;

            border-width: 5px;
          }

          .punch-out-capture-btn {
            font-size: 16px;

            padding: 13px;
          }

          .punch-out-location-box {
            padding: 14px;
          }

          .punch-out-submit-btn {
            font-size: 18px;

            padding: 15px;
          }
        }

        /* ==============================
           SMALL PHONE
        ============================== */

        @media (max-width: 400px) {

          .punch-out-box {
            padding: 20px 10px;
          }

          .punch-out-camera-circle {
            width: 175px;
            height: 175px;
          }

          .punch-out-location-box {
            padding: 12px;
          }

          .punch-out-location-title {
            font-size: 15px;
          }

          .punch-out-location-success,
          .punch-out-location-loading {
            font-size: 12px;
          }

          .punch-out-location-name {
            font-size: 12px;
          }

          .punch-out-submit-btn {
            font-size: 17px;
          }
        }

        /* ==============================
           HIDE SCROLLBAR
        ============================== */

        html,
        body,
        #root {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden !important;
        }

        body {
          scrollbar-width: none;
        }

        body::-webkit-scrollbar {
          display: none;

          width: 0;
          height: 0;
        }

      `}</style>

    </div>
  );
}

export default PunchOut;