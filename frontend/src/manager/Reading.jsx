import { useEffect, useState } from "react";

function Reading({
  onBack,
  project: selectedProject,
}) {

  const API_BASE =
  `${import.meta.env.VITE_API_URL}/api`;

  const [activeReading, setActiveReading] =
    useState(null);

  return (
    <div className="reading-page">

      {!activeReading ? (

        <>
          <button
            type="button"
            className="reading-back-btn"
            onClick={onBack}
          >
            ← Back
          </button>

          <h5 className="reading-main-title">
             Meter Reading
          </h5>

          <div className="reading-grid">

            <ReadingCard
              icon="💧"
              title="Water Reading"
              className="water-reading-card"
              onClick={() =>
                setActiveReading({
                  type: "Water Reading",
                  icon: "💧",
                  unit: "KL",
                })
              }
            />

            <ReadingCard
              icon="⚡"
              title="Electricity Reading"
              className="electricity-reading-card"
              onClick={() =>
                setActiveReading({
                  type: "Electricity Reading",
                  icon: "⚡",
                  unit: "kWh",
                })
              }
            />

            <ReadingCard
              icon="⛽"
              title="Diesel Reading"
              className="diesel-reading-card"
              onClick={() =>
                setActiveReading({
                  type: "Diesel Reading",
                  icon: "⛽",
                  unit: "L",
                })
              }
            />

          </div>

          <ReadingStyle />

        </>

      ) : (

  <ReadingForm
  type={activeReading.type}
  icon={activeReading.icon}
  unit={activeReading.unit}
  API_BASE={API_BASE}
  project={selectedProject}
  onBack={() =>
    setActiveReading(null)
  }
/>

      )}

    </div>
  );
}


/* ================================================= */
/* READING CARD */
/* ================================================= */

function ReadingCard({
  icon,
  title,
  className,
  onClick,
}) {

  return (
    <button
      type="button"
      className={`reading-card ${className}`}
      onClick={onClick}
    >

      <div className="reading-card-icon">
        {icon}
      </div>

      <div className="reading-card-title">
        {title}
      </div>

    </button>
  );
}


/* ================================================= */
/* READING FORM */
/* ================================================= */

function ReadingForm({
  type,
  icon,
  unit,
  API_BASE,
  project: selectedProject,
  onBack,
}) {

  const [meterNo, setMeterNo] =
    useState("");

  const [currentReading, setCurrentReading] =
    useState("");

  const [photo, setPhoto] =
    useState(null);

  const [photoPreview, setPhotoPreview] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [project, setProject] =
    useState(null);

    const today =
  new Date().toISOString().split("T")[0];


  /* ================================================= */
  /* CURRENT USER */
  /* ================================================= */

  const getCurrentUser = () => {

    try {

      const sessionUser =
        sessionStorage.getItem("user");

      const localUser =
        localStorage.getItem("user");

      return JSON.parse(
        sessionUser ||
        localUser ||
        "null"
      );

    } catch {

      return null;

    }
  };


  /* ================================================= */
  /* LOAD ASSIGNED PROJECT + HISTORY */
  /* ================================================= */

  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);

        const user =
          getCurrentUser();


        if (!user?.id) {

          alert(
            "User session not found. Please login again."
          );

          return;

        }


        /* =============================================
           GET ASSIGNED PROJECT
        ============================================= */

        const projectResponse =
          await fetch(
            `${API_BASE}/users/${user.id}/projects`
          );


        const projectData =
          await projectResponse.json();


        if (
          !projectResponse.ok ||
          !projectData.success
        ) {

          throw new Error(
            projectData.message ||
            "Assigned project not found."
          );

        }


        const assignedProjects =
          projectData.projects || [];


        if (
          assignedProjects.length === 0
        ) {

          setProject(null);
          setHistory([]);

          return;

        }


        const assignedProject =
  selectedProject ||
  assignedProjects[0];

if (!assignedProject?.id) {
  setProject(null);
  setHistory([]);
  return;
}

setProject(
  assignedProject
);


        /* =============================================
           GET READING HISTORY
        ============================================= */

        const historyResponse =
          await fetch(
            `${API_BASE}/projects/${assignedProject.id}/readings`
          );


        const historyData =
          await historyResponse.json();


        if (
          historyResponse.ok &&
          historyData.success
        ) {

          setHistory(
            historyData.readings || []
          );

        } else {

          setHistory([]);

        }

      } catch (error) {

        console.error(
          "Reading Load Error:",
          error
        );

        alert(
          error.message ||
          "Failed to load reading data."
        );

      } finally {

        setLoading(false);

      }

    };


    loadData();

  }, [API_BASE]);


//* ================================================= */
/* PREVIOUS READING - METER WISE */
/* ================================================= */

const selectedMeterNo =
  String(meterNo || "").trim();


const meterHistory = history
  .filter((reading) => {

    const readingType =
      String(reading.reading_type || "").trim();

    const readingMeterNo =
      String(reading.meter_no || "").trim();

    return (
      readingType === type &&
      readingMeterNo === selectedMeterNo
    );

  })
  .sort((a, b) => {

    const dateA =
      new Date(a.reading_date).getTime();

    const dateB =
      new Date(b.reading_date).getTime();

    if (dateB !== dateA) {
      return dateB - dateA;
    }

    return (
      Number(b.id || 0) -
      Number(a.id || 0)
    );

  });


/* ================================================= */
/* PREVIOUS READING */
/* ================================================= */

const previousReading =
  meterHistory.length > 0
    ? Number(
        meterHistory[0].reading_value
      )
    : null;


/* ================================================= */
/* CURRENT READING */
/* ================================================= */

const current =
  currentReading === ""
    ? null
    : Number(currentReading);


/* ================================================= */
/* AUTO CALCULATION */
/* ================================================= */

let consumption = "";

if (
  previousReading !== null &&
  current !== null &&
  !isNaN(previousReading) &&
  !isNaN(current)
) {

  consumption =
    current - previousReading;

}

  /* ================================================= */
  /* PHOTO */
  /* ================================================= */

  const handlePhotoChange =
    (e) => {

      const selectedPhoto =
        e.target.files?.[0];

      if (!selectedPhoto) {
        return;
      }


      setPhoto(
        selectedPhoto
      );


      const previewURL =
        URL.createObjectURL(
          selectedPhoto
        );


      setPhotoPreview(
        previewURL
      );

    };


  /* ================================================= */
  /* SUBMIT READING */
  /* ================================================= */

  const handleSubmit =
    async () => {

      if (
  type === "Electricity Reading" &&
  meterNo.trim() === ""
) {

  alert(
    "Please enter Meter No."
  );

  return;

}

      if (
        currentReading === ""
      ) {

        alert(
          "Please enter Current Reading."
        );

        return;

      }


      /* =============================================
         ELECTRICITY READING VALIDATION
         ============================================= */
         

if (
  type === "Electricity Reading" &&
  meterNo.trim() !== "" &&
  meterHistory.length > 0 &&
  current <= previousReading
) {

  alert(
    `Invalid Electricity Reading!\nToday's reading must be greater than previous reading (${previousReading} ${unit}).`
  );

  return;

}


      /* =============================================
         WATER / DIESEL VALIDATION
         ============================================= */

      if (
        type !== "Electricity Reading" &&
        current < previousReading
      ) {

        alert(
          `Current Reading cannot be less than Previous Reading (${previousReading} ${unit}).`
        );

        return;

      }


      const user =
        getCurrentUser();


      if (!user?.id) {

        alert(
          "User session not found. Please login again."
        );

        return;

      }


      if (!project?.id) {

        alert(
          "No project is assigned to this user."
        );

        return;

      }


      try {

        setSaving(true);


        /* =========================================
           SAVE READING
        ========================================= */

        const response =
          await fetch(
            `${API_BASE}/readings`,
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                project_id:
                  project.id,

                user_id:
                  user.id,

                reading_type:
                  type,

                reading_value:
                  current,

                reading_date:
                  today,

                meter_no:
                  meterNo.trim() ||
                  null,

              }),

            }
          );


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.message ||
            "Failed to save reading."
          );

        }


        /* =========================================
           RELOAD HISTORY
        ========================================= */

       const historyResponse =
  await fetch(
    `${API_BASE}/projects/${project.id}/readings`
  );

        const historyData =
          await historyResponse.json();


        if (
          historyResponse.ok &&
          historyData.success
        ) {

          setHistory(
            historyData.readings || []
          );

        }


        /* =========================================
           CLEAR FORM
        ========================================= */

        setMeterNo("");

        setCurrentReading("");

        setPhoto(null);

        setPhotoPreview(null);


        alert(
          "Reading Submitted Successfully ✅"
        );

      } catch (error) {

        console.error(
          "Reading Submit Error:",
          error
        );

        alert(
          error.message ||
          "Failed to save reading."
        );

      } finally {

        setSaving(false);

      }

    };


  return (

    <div className="reading-page">

      <button
        type="button"
        className="reading-back-btn"
        onClick={onBack}
      >
        ← Back
      </button>


     <div className="reading-form-container reading-form">


        {/* ================================================= */}
        {/* PROJECT INFORMATION */}
        {/* ================================================= */}

        {project && (

          <div className="reading-project-info">

            <strong>
               {project.name}
            </strong>

          </div>

        )}


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="reading-form-header">

          <div className="form-title-icon">
            {icon}
          </div>

          <div>

            <h1>
              {type}
            </h1>

            <p>
              Enter today's meter reading
            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading ? (

          <div className="reading-loading">
            Loading project and reading history...
          </div>

        ) : (

          <>


            {/* ================================================= */}
            {/* FORM CARD */}
            {/* ================================================= */}

            <div className="reading-form-card">

              <div className="form-grid">


                {/* DATE */}

                <div className="form-group">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={today}
                    readOnly
                  />

                </div>


                {/* METER NO */}

                <div className="form-group">

                  <label>

                    Meter No.

                    <span className="optional-text">
                      {" "}
                      (Optional)
                    </span>

                  </label>

                  <input
                    type="text"
                    placeholder="Enter Meter No."
                    value={meterNo}
                    onChange={(e) =>
                      setMeterNo(
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* CURRENT */}

                <div className="form-group">

                  <label>
                    Current Reading
                  </label>

                  <div className="reading-input-wrapper">

                    <input
                      type="number"
                      min="0"
                      placeholder="Enter Current Reading"
                      value={currentReading}
                      onChange={(e) =>
                        setCurrentReading(
                          e.target.value
                        )
                      }
                    />

                    <span className="reading-unit">
                      {unit}
                    </span>

                  </div>

                </div>


                {/* =================================================
                    PREVIOUS READING REMOVED FROM USER FORM
                    ================================================= */}


                {/* CONSUMPTION */}

                <div className="form-group">

                  <label>
  Units Consumed
</label>
                  <div className="reading-input-wrapper">

                    <input
                      type="text"
                      value={
                        consumption === ""
                          ? "Auto Calculate"
                          : consumption
                      }
                      readOnly
                      className="readonly-input"
                    />

                    <span className="reading-unit">
                      {unit}
                    </span>

                  </div>

                </div>


                {/* PHOTO */}

                <div className="form-group full-width">

                  <label>

                    Meter Photo

                    <span className="optional-text">
                      {" "}
                      (Optional)
                    </span>

                  </label>


                  <div className="photo-buttons">

                    <label className="photo-btn camera-btn">

                      📷 Click Photo

                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={
                          handlePhotoChange
                        }
                        hidden
                      />

                    </label>


                    <label className="photo-btn upload-btn">

                      📁 Upload Photo

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handlePhotoChange
                        }
                        hidden
                      />

                    </label>

                  </div>


                  {photoPreview && (

                    <div className="photo-preview-box">

                      <img
                        src={photoPreview}
                        alt="Meter"
                        className="meter-photo-preview"
                      />

                      <div className="photo-selected-text">
                        ✅ Photo Selected
                      </div>

                    </div>

                  )}

                </div>

              </div>


              {/* SUBMIT */}

              <div className="submit-btn-wrapper">

                <button
                  type="button"
                  className="submit-reading-btn"
                  onClick={
                    handleSubmit
                  }
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : "Submit"}

                </button>

              </div>

            </div>


            {/* ================================================= */}
            {/* HISTORY */}
            {/* ================================================= */}

            <div className="reading-history">

              <h6>
                 Reading History
              </h6>


              {history.length === 0 ? (

                <div className="no-history">
                  No Reading History Available
                </div>

              ) : (

                <div className="history-card">

                  <div className="history-header">

                    <span>Date</span>

                    <span>Meter No.</span>

                    <span>Previous</span>

                    <span>Current</span>

                    <span>Consumption</span>

                  </div>


                  {history
                    .map(
                      (reading) => (

                        <div
                          className="history-row"
                          key={reading.id}
                        >

                          <span>
                            {reading.reading_date}
                          </span>

                          <span>
                            {reading.meter_no ||
                              "Not Provided"}
                          </span>

                          <span>
                            {reading.previous_reading ??
                              0}{" "}
                            {unit}
                          </span>

                          <span>
                            {reading.current_reading ??
                              reading.reading_value}{" "}
                            {unit}
                          </span>

                          <span>
                            {reading.consumption ??
                              "-"}{" "}
                            {unit}
                          </span>

                        </div>

                      )
                    )}

                </div>

              )}

            </div>

          </>

        )}

      </div>


      <ReadingStyle />

    </div>
  );
}


/* ================================================= */
/* STYLE */
/* ================================================= */

function ReadingStyle() {

  return (

    <style>{`

      * {
        box-sizing: border-box;
      }

      .reading-page {
        width: 100%;
        min-height: 100%;
        padding: 20px;
        overflow-x: hidden;
      }

      .reading-back-btn {
        border: none;
        background: transparent;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 15px;
      }

      .reading-main-title {
        font-size: 28px;
        margin-bottom: 25px;
        color: #222;
      }

      .reading-grid {
        display: grid;
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
        gap: 20px;
      }

      .reading-card {
        border: none;
        border-radius: 18px;
        min-height: 170px;
        padding: 25px;
        cursor: pointer;
        background: white;
        box-shadow:
          0 8px 25px rgba(0,0,0,0.10);
        transition: 0.25s ease;
      }

      .reading-card:hover {
        transform: translateY(-8px);
        box-shadow:
          0 15px 35px rgba(0,0,0,0.18);
      }

      .reading-card-icon {
        font-size: 50px;
        margin-bottom: 15px;
      }

      .reading-card-title {
        font-size: 20px;
        font-weight: 700;
      }

      .reading-form-container {
        width: 100%;
        max-width: 1100px;
        margin: auto;
      }

      .reading-project-info {
        display: flex;
        align-items: center;
        gap: 25px;
        background: white;
        border-radius: 14px;
        padding: 14px 18px;
        margin-bottom: 20px;
        box-shadow:
          0 5px 18px rgba(0,0,0,0.07);
      }

      .reading-project-info span {
        color: #6c757d;
      }

      .reading-form-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
      }

      .form-title-icon {
        font-size: 48px;
      }

      .reading-form-header h1 {
        margin: 0;
        font-size: 28px;
      }

      .reading-form-header p {
        margin: 5px 0 0;
        color: #777;
      }

      .reading-loading {
        background: white;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        color: #666;
      }

      .reading-form-card {
        background: white;
        border-radius: 18px;
        padding: 25px;
        box-shadow:
          0 8px 30px rgba(0,0,0,0.10);
      }

      .form-grid {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        font-weight: 600;
        margin-bottom: 8px;
      }

      .form-group input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #ddd;
        border-radius: 10px;
        font-size: 15px;
        outline: none;
      }

      .form-group input:focus {
        border-color: #198754;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .optional-text {
        color: #888;
        font-weight: 400;
      }

      .reading-input-wrapper {
        position: relative;
      }

      .reading-input-wrapper input {
        padding-right: 65px;
      }

      .reading-unit {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
        font-weight: 600;
      }

      .readonly-input {
        background: #f5f5f5;
      }

      .photo-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .photo-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 20px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        border: 1px solid #ddd;
        transition: 0.2s ease;
      }

      .camera-btn {
        background: #eef7ff;
      }

      .upload-btn {
        background: #f4f4f4;
      }

      .photo-preview-box {
        margin-top: 15px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 12px;
        width: fit-content;
        max-width: 100%;
      }

      .meter-photo-preview {
        width: 220px;
        max-width: 100%;
        max-height: 250px;
        object-fit: contain;
        border-radius: 8px;
      }

      .photo-selected-text {
        margin-top: 8px;
        font-size: 13px;
        color: #198754;
        font-weight: 600;
      }

      .submit-btn-wrapper {
        display: flex;
        justify-content: flex-end;
        margin-top: 25px;
      }

      .submit-reading-btn {
        background: #198754;
        color: white;
        border: none;
        padding: 13px 40px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
      }

      .submit-reading-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .reading-history {
        margin-top: 30px;
      }

      .reading-history h2 {
        font-size: 22px;
        margin-bottom: 15px;
      }

      .history-card {
        background: white;
        border-radius: 15px;
        overflow-x: auto;
        box-shadow:
          0 6px 20px rgba(0,0,0,0.08);
      }

      .history-header,
      .history-row {
        display: grid;
        grid-template-columns:
          1.1fr
          1.2fr
          1.1fr
          1.1fr
          1.2fr;
        min-width: 750px;
        padding: 14px 18px;
        gap: 10px;
      }

      .history-header {
        background: #f3f3f3;
        font-weight: 700;
      }

      .history-row {
        border-top: 1px solid #eee;
        font-size: 14px;
      }

      .no-history {
        background: white;
        padding: 25px;
        border-radius: 15px;
        text-align: center;
        color: #777;
      }

      @media (max-width: 900px) {

        .reading-grid {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .full-width {
          grid-column: auto;
        }

      }

      @media (max-width: 768px) {

  .reading-form {
    height: calc(100dvh - 30px);
    max-height: calc(100dvh - 30px);

    overflow-y: auto !important;
    overflow-x: hidden !important;

    padding-right: 8px;
    padding-bottom: 30px;

    -webkit-overflow-scrolling: touch;
  }

}

    `}</style>
  );
}

export default Reading;