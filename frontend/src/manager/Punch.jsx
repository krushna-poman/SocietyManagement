import { useEffect, useRef, useState } from "react";

function Punch({
  mode = "in",
  onBack,
  project,
}) {
  const isPunchIn = mode === "in";

  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] =
    useState("Capturing location...");
  const [locationName, setLocationName] = useState("");

  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  /* ==========================================
     START CAMERA + LOCATION
  ========================================== */

  useEffect(() => {
    if (isPunchIn) {
      startCamera();
      getLocation();
    }

    return () => {
      stopCamera();
    };
  }, [isPunchIn]);

  /* ==========================================
     START CAMERA
  ========================================== */

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
      console.error("Camera Error:", error);

      setCameraError(
        "Camera permission is required."
      );
    }
  };

  /* ==========================================
     STOP CAMERA
  ========================================== */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }
  };

  /* ==========================================
     AUTO LOCATION
  ========================================== */

  const getLocation = () => {

    setLocationStatus("Capturing location...");
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
        // GPS COORDINATES
        // Backend साठी internally ठेवायचे
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

          const response = await fetch(
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
          // FULL LOCATION
          // =====================================

          const addressParts = [

            // House / Building
            address.house_number,

            // Road / Lane
            address.road,

            // Neighbourhood
            address.neighbourhood,

            // Suburb / Area
            address.suburb,

            address.quarter,

            // Village / Town
            address.village,

            address.town,

            // City
            address.city,

            address.city_district,

            // District
            address.district,

            // State
            address.state,

            // PIN Code
            address.postcode,

            // Country
            address.country,

          ];

          // Empty values remove
          // Duplicate values remove

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

  /* ==========================================
     CAPTURE PHOTO
  ========================================== */

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (
      video.readyState <
      2
    ) {
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
          blob: blob,
          preview: imageUrl,
        });

        setMessage("");

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  /* ==========================================
     RETAKE PHOTO
  ========================================== */

  const retakePhoto = () => {
    setPhoto(null);
    setMessage("");

    startCamera();
  };

  /* ==========================================
     PUNCH IN
  ========================================== */

  const handlePunchIn = async () => {
    setMessage("");

    if (!photo) {
      setMessage(
        "📷 Please capture your photo first."
      );
      return;
    }

    if (!location) {
      setMessage(
        "📍 Location is required."
      );

      getLocation();
      return;
    }

    const storedUser = JSON.parse(
      sessionStorage.getItem("user") ||
      localStorage.getItem("user") ||
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
     const API_URL =
  `${import.meta.env.VITE_API_URL}/api/punch/in`;

      const formData = new FormData();

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

      formData.append(
        "latitude",
        location.latitude
      );

      formData.append(
        "longitude",
        location.longitude
      );

      formData.append(
        "photo",
        photo.blob,
        "punch-photo.jpg"
      );

      const response = await fetch(
        API_URL,
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
          "Punch In failed."
        );

        setLoading(false);
        return;
      }

      setMessage(
        "✅ Punch In successful!"
      );

      setPhoto(null);

    } catch (error) {
      console.error(
        "Punch In Error:",
        error
      );

      setMessage(
        "❌ Server connection failed."
      );
    }

    setLoading(false);
  };

  /* ==========================================
     PUNCH OUT
  ========================================== */

  const handlePunchOut = async () => {
    const storedUser = JSON.parse(
      sessionStorage.getItem("user") ||
      localStorage.getItem("user") ||
      "null"
    );

    if (!storedUser?.id) {
      setMessage(
        "User login information not found."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const API_URL =
  `${import.meta.env.VITE_API_URL}/api/punch/out`;

      const response = await fetch(
        API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: storedUser.id,
          }),
        }
      );

      const data =
        await response.json();

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

      setMessage(
        "✅ Punch Out successful!"
      );
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

  /* ==========================================
     UI
  ========================================== */

  return (
    <div className="punch-page">

      {/* BACK */}

      <button
        type="button"
        className="back-btn"
        onClick={onBack}
      >
        ← Back
      </button>

      <div className="punch-box">

        {isPunchIn ? (
          <>
            {/* =================================
                LIVE CAMERA
            ================================= */}

            <div className="camera-section">

              <div className="camera-circle">

                {photo ? (
                  <img
                    src={photo.preview}
                    alt="Captured"
                    className="captured-photo"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="live-camera"
                  />
                )}

              </div>

              {cameraError && (
                <div className="camera-error">
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
                CAPTURE PHOTO
            ================================= */}

            {!photo ? (
              <button
                type="button"
                className="capture-btn"
                onClick={capturePhoto}
              >
                📷 Capture Photo
              </button>
            ) : (
              <button
                type="button"
                className="retake-btn"
                onClick={retakePhoto}
              >
                🔄 Retake Photo
              </button>
            )}

            {/* =================================
                LOCATION
            ================================= */}

            <div className="location-box">

              <div className="location-icon">
                📍
              </div>

              <div className="location-info">

                <div className="location-title">
                  Location
                </div>

                <div
                  className={
                    location
                      ? "location-success"
                      : "location-loading"
                  }
                >
                  {locationStatus}
                </div>

                {location && (
                  <div className="location-name">
                    📍 {locationName || "Finding exact location..."}
                  </div>
                )}

              </div>

            </div>

            {/* =================================
                REFRESH LOCATION
            ================================= */}

            {!location && (
              <button
                type="button"
                className="location-btn"
                onClick={getLocation}
              >
                📍 Retry Location
              </button>
            )}

            {/* =================================
                PUNCH IN BUTTON
            ================================= */}

            <button
              type="button"
              className="punch-in-btn"
              onClick={handlePunchIn}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "🟢 Punch In"}
            </button>

          </>
        ) : (
          <>
            {/* =================================
                PUNCH OUT
            ================================= */}

            <div className="punch-out-icon">
              🔴
            </div>

            <p className="punch-out-text">
              End your working time
            </p>

            <button
              type="button"
              className="punch-out-btn"
              onClick={handlePunchOut}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "🔴 Punch Out"}
            </button>
          </>
        )}

        {/* MESSAGE */}

        {message && (
          <div className="punch-message">
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

        .punch-page {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        /* ==============================
           BACK
        ============================== */

        .back-btn {
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

       .punch-box {
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

    .camera-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.camera-circle {
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

.live-camera,
.captured-photo {
  width: 100%;
  height: 100%;

  object-fit: cover;

  display: block;
}

.camera-error {
  width: 100%;
  max-width: 300px;

  margin-top: 12px;

  text-align: center;

  color: #dc2626;

  font-size: 14px;
  line-height: 1.5;
}

        /* ==============================
           CAPTURE BUTTON
        ============================== */

        .capture-btn {
          width: 100%;

          margin-top: 10px;

          border: none;

          background: #2563eb;

          color: white;

          padding: 14px;

          border-radius: 12px;

          font-size: 17px;

          font-weight: 700;

          cursor: pointer;
        }

        .capture-btn:active {
          transform: scale(0.98);
        }

        /* ==============================
           RETAKE
        ============================== */

        .retake-btn {
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
.location-box {
  width: 100%;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  padding: 9px;

  margin-top: 10px;

  margin-bottom: 10px;

  background: #f8fafc;

  border: 1px solid #e5e7eb;

  border-radius: 11px;

  overflow: hidden;
}
       
.location-icon {
  font-size: 30px;

  margin-bottom: 4px;

  flex-shrink: 0;
}
.location-info {
  width: 100%;

  min-width: 0;

  text-align: center;
}

        .location-title {
          font-size: 16px;

          font-weight: 700;

          color: #172033;
        }

        .location-success {
          margin-top: 4px;

          color: #16a34a;

          font-size: 14px;

          font-weight: 600;
        }

        .location-loading {
          margin-top: 4px;

          color: #dc2626;

          font-size: 14px;

          font-weight: 600;
        }
  
        .location-name {
  margin-top: 6px;

  color: #374151;

  font-size: 14px;

  font-weight: 600;

  line-height: 1.5;
}

        /* ==============================
           RETRY LOCATION
        ============================== */

        .location-btn {
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
           PUNCH IN
        ============================== */

      .punch-in-btn {
  width: 100%;

  border: none;

  background: #16a34a;

  color: white;

  padding: 11px;

  border-radius: 10px;

  font-size: 16px;

  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

        .punch-in-btn:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 18px rgba(0,0,0,0.15);
        }

        .punch-in-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }

        /* ==============================
           PUNCH OUT
        ============================== */

        .punch-out-icon {
          font-size: 70px;

          margin: 20px 0;
        }

        .punch-out-text {
          color: #6b7280;

          margin-bottom: 30px;
        }

        .punch-out-btn {
          width: 100%;

          border: none;

          background: #dc2626;

          color: white;

          padding: 16px;

          border-radius: 12px;

          font-size: 19px;

          font-weight: 700;

          cursor: pointer;
        }

        /* ==============================
           MESSAGE
        ============================== */

        .punch-message {
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

          .punch-page {
            width: 100%;
            max-width: 100%;

            overflow-x: hidden;
          }

          .punch-box {
            width: 100%;
            max-width: 100%;

            margin: 15px 0 20px;

            padding: 24px 14px;

            border-radius: 18px;
          }

         .camera-circle {
  width: 200px;
  height: 200px;

  border-width: 5px;
}

.camera-error {
  width: 100%;
  max-width: 280px;
  text-align: center;
  margin-top: 12px;
}

          .capture-btn {
            font-size: 16px;

            padding: 13px;
          }

          .location-box {
            padding: 13px;
          }

          .punch-in-btn {
            font-size: 18px;

            padding: 15px;
          }
        }

        /* ==============================
           SMALL PHONE
        ============================== */

        @media (max-width: 400px) {

          .punch-box {
            padding: 20px 10px;
          }

          .camera-circle {
            width: 175px;
            height: 175px;
          }

          .location-box {
            gap: 9px;

            padding: 12px;
          }

          .location-title {
            font-size: 15px;
          }

          .location-success,
          .location-loading {
            font-size: 12px;
          }

          .coordinates {
            font-size: 11px;
          }

          .punch-in-btn {
            font-size: 17px;
          }
        }


/* ==========================================
   LAPTOP SCREEN
========================================== */

@media (min-width: 769px) {

  .punch-box {
    margin-top: 12px;
    padding: 22px;
  }

  .camera-circle {
    width: 210px;
    height: 210px;
  }

}


/* ==========================================
   PHONE
========================================== */

@media (max-width: 768px) {

  .punch-page {
    width: 100%;
    height: auto;
    max-height: 100vh;

    overflow: hidden !important;

    padding: 0;
  }

  .punch-box {
    width: calc(100% - 24px);
    max-width: 420px;

    margin: 10px auto;

    padding: 14px 12px;

    border-radius: 16px;

    box-shadow:
      0 5px 20px rgba(0,0,0,0.07);
  }

  /* smaller camera */

  .camera-circle {
    width: 165px;
    height: 165px;

    border-width: 5px;
  }

  /* buttons */

  .capture-btn {
    margin-top: 12px;

    padding: 11px;

    font-size: 15px;
  }

  .retake-btn {
    margin-top: 8px;

    padding: 8px 16px;

    font-size: 13px;
  }

  /* location */

  .location-box {
    margin-top: 10px;
    margin-bottom: 10px;

    padding: 10px;

    border-radius: 11px;
  }

  .location-icon {
    font-size: 24px;

    margin-bottom: 2px;
  }

  .location-title {
    font-size: 14px;
  }

  .location-success,
  .location-loading {
    font-size: 12px;
  }

  .location-name {
    font-size: 11px;

    line-height: 1.3;
  }

  /* punch button */

  .punch-in-btn {
    padding: 12px;

    font-size: 16px;

    border-radius: 10px;
  }

  .camera-error {
    font-size: 12px;

    margin-top: 8px;
  }

}


/* ==========================================
   SMALL PHONE
========================================== */

@media (max-width: 400px) {

  .punch-box {
    width: calc(100% - 16px);

    margin: 8px auto;

    padding: 10px;
  }

  .camera-circle {
    width: 145px;
    height: 145px;
  }

  .capture-btn {
    margin-top: 9px;

    padding: 10px;

    font-size: 14px;
  }

  .location-box {
    margin-top: 8px;
    margin-bottom: 8px;

    padding: 8px;
  }

  .location-title {
    font-size: 13px;
  }

  .location-name {
    font-size: 10px;
  }

  .punch-in-btn {
    padding: 10px;

    font-size: 15px;
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
  scrollbar-width: none !important;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar,
#root::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}



      `}</style>

    </div>
  );
}

export default Punch;