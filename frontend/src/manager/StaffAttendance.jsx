import { useEffect, useState } from "react";

function StaffAttendance({
  onBack,
  project: selectedProject,
}) {
  const API_BASE =
    `${window.location.protocol}//${window.location.hostname}:5000`;

  const [staffList, setStaffList] = useState([]);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendance, setAttendance] = useState({});

  const [showAddStaff, setShowAddStaff] = useState(false);

  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  // =================================================
  // SELECTED PROJECT ID
  // =================================================

  const projectId =
    selectedProject?.id || null;

  // =================================================
  // PROJECT CHANGE
  // =================================================

  useEffect(() => {
    setMessage("");

    setAttendance({});

    setStaffList([]);

    if (!projectId) {
      setMessage(
        "Please select a project from Project Manager Dashboard."
      );
      return;
    }

    /*
      Staff Master सध्या frontend/local state मध्ये आहे.
      त्यामुळे project बदलल्यावर नवीन project साठी
      temporary staff list रिकामी केली जाते.
    */

    setLoading(false);
  }, [projectId]);

  // =================================================
  // ADD STAFF
  // =================================================

  const addStaff = () => {
    setMessage("");

    if (!projectId) {
      setMessage(
        "Please select a project first."
      );
      return;
    }

    if (!name.trim()) {
      setMessage(
        "Please enter staff name."
      );
      return;
    }

    if (!designation.trim()) {
      setMessage(
        "Please enter designation."
      );
      return;
    }

    if (!joiningDate) {
      setMessage(
        "Please select joining date."
      );
      return;
    }

    const newStaff = {
      id: Date.now(),

      name:
        name.trim(),

      designation:
        designation.trim(),

      joiningDate:
        joiningDate,

      projectId:
        projectId,
    };

    setStaffList(
      (previous) => [
        ...previous,
        newStaff,
      ]
    );

    setName("");
    setDesignation("");
    setJoiningDate("");

    setShowAddStaff(false);

    setMessage(
      "✅ Staff added successfully."
    );
  };

  // =================================================
  // DELETE STAFF
  // =================================================

  const deleteStaff = (staffId) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this staff?"
      );

    if (!confirmDelete) {
      return;
    }

    setStaffList(
      (previous) =>
        previous.filter(
          (staff) =>
            staff.id !== staffId
        )
    );

    setAttendance(
      (previous) => {

        const updated = {
          ...previous,
        };

        delete updated[staffId];

        return updated;
      }
    );

    setMessage(
      "Staff removed."
    );
  };

  // =================================================
  // ATTENDANCE STATUS
  // =================================================

  const handleStatusChange = (
    staffId,
    status
  ) => {
    setAttendance(
      (previous) => ({
        ...previous,
        [staffId]:
          status,
      })
    );
  };

  // =================================================
  // SAVE ATTENDANCE
  // =================================================

  const saveAttendance = async () => {
    setMessage("");

    // -----------------------------------------------
    // PROJECT CHECK
    // -----------------------------------------------

    if (!projectId) {
      setMessage(
        "❌ Please select a project first."
      );
      return;
    }

    // -----------------------------------------------
    // STAFF CHECK
    // -----------------------------------------------

    if (staffList.length === 0) {
      setMessage(
        "Please add staff first."
      );
      return;
    }

    // -----------------------------------------------
    // ALL STAFF ATTENDANCE CHECK
    // -----------------------------------------------

    const missingStaff =
      staffList.filter(
        (staff) =>
          !attendance[staff.id]
      );

    if (
      missingStaff.length > 0
    ) {
      setMessage(
        "⚠️ Please select attendance for all staff."
      );
      return;
    }

    setSaving(true);

    try {

      // =================================================
      // SAVE EACH STAFF
      // =================================================

      for (
        const staff of staffList
      ) {

        const response =
          await fetch(
            `${API_BASE}/api/staff-attendance`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({

                  // IMPORTANT
                  // Selected Project ID

                  project_id:
                    Number(
                      projectId
                    ),

                  staff_name:
                    staff.name,

                  attendance_date:
                    attendanceDate,

                  status:
                    attendance[
                    staff.id
                    ],

                  punch_in:
                    null,

                  punch_out:
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
            "Attendance save failed."
          );
        }
      }

      // =================================================
      // SUCCESS
      // =================================================

      setMessage(
        `✅ Attendance saved successfully for ${selectedProject?.name || "selected project"}.`
      );

      setAttendance({});

    } catch (error) {

      console.error(
        "Attendance Save Error:",
        error
      );

      setMessage(
        `❌ ${error.message}`
      );

    } finally {

      setSaving(false);

    }
  };

  // =================================================
  // PAGE
  // =================================================

  return (
    <div className="container-fluid px-2 px-md-3 py-2">

      <div className="d-flex justify-content-between align-items-center mb-3">

        {/* Left - Back Button */}
        <button
          type="button"
          className="btn btn-light shadow-sm"
          onClick={onBack}
        >
          ← Back
        </button>

        {/* Right - Project Name */}
        {selectedProject && (
          <div className="fw-bold text-end">
            Project: {selectedProject.name}
          </div>
        )}

      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div
        className="card border-0 shadow-sm rounded-4 mx-auto"
        style={{
          maxWidth:
            "1050px",
        }}
      >

        <div className="card-body p-3 p-md-4">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">

            <div>

              <h6 className="fw-bold mb-1 fs-4 fs-md-3">
                Society Staff
              </h6>

            </div>

            <button
              type="button"
              className="add-staff-btn"
              onClick={() =>
                setShowAddStaff(
                  !showAddStaff
                )
              }
              disabled={!projectId}
            >
              {showAddStaff
                ? "✕ Close"
                : "＋ Add Staff"}
            </button>

          </div>

          {/* =================================================
              NO PROJECT
          ================================================= */}

          {!projectId && (

            <div className="alert alert-warning">
              ⚠️ Please select a project from the Project Manager Dashboard.
            </div>

          )}

          {/* =================================================
              ADD STAFF FORM
          ================================================= */}

          {showAddStaff && projectId && (

            <div className="bg-light border rounded-4 p-3 p-md-4 mb-4">

              <h5 className="fw-bold mb-3">
                Add Society Staff
              </h5>

              <div className="row g-3">

                {/* NAME */}

                <div className="col-12 col-md-4">

                  <label className="form-label fw-semibold">
                    Staff Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter staff name"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* DESIGNATION */}

                <div className="col-12 col-md-4">

                  <label className="form-label fw-semibold">
                    Designation
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Security Guard / Housekeeping"
                    value={designation}
                    onChange={(e) =>
                      setDesignation(
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* JOINING DATE */}

                <div className="col-12 col-md-4">

                  <label className="form-label fw-semibold">
                    Joining Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={joiningDate}
                    onChange={(e) =>
                      setJoiningDate(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div className="mt-3">

                <button
                  type="button"
                  className="btn btn-success fw-semibold w-100 w-md-auto"
                  onClick={addStaff}
                >
                  💾 Save Staff
                </button>

              </div>

            </div>

          )}

          {/* =================================================
              STAFF MASTER
          ================================================= */}

          {projectId && (

            <>
              <div className="d-flex justify-content-between align-items-center mb-3">


                <span className="badge bg-light text-dark border">
                  {staffList.length} Staff
                </span>

              </div>

              {staffList.length === 0 ? (

                <div className="alert alert-light text-center border">
                  No staff added yet for this project.
                </div>

              ) : (

                <div className="table-responsive border rounded-3">

                  <table className="table table-hover align-middle mb-0">

                    <thead className="table-light">

                      <tr>

                        <th>
                          #
                        </th>

                        <th>
                          Staff Name
                        </th>

                        <th>
                          Designation
                        </th>

                        <th>
                          Joining Date
                        </th>

                        <th className="text-center">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {staffList.map(
                        (
                          staff,
                          index
                        ) => (

                          <tr
                            key={
                              staff.id
                            }
                          >

                            <td>
                              {index + 1}
                            </td>

                            <td>
                              <strong>
                                👷{" "}
                                {
                                  staff.name
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                staff.designation
                              }
                            </td>

                            <td>
                              {new Date(
                                staff.joiningDate
                              ).toLocaleDateString(
                                "en-IN"
                              )}
                            </td>

                            <td className="text-center">

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  deleteStaff(
                                    staff.id
                                  )
                                }
                              >
                                🗑️ Delete
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </>

          )}

          {/* =================================================
              DAILY ATTENDANCE
          ================================================= */}

          {projectId && (

            <div className="mt-4">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <h6 className="fw-bold mb-0">
                  Daily Attendance
                </h6>

              </div>

              {/* DATE */}

              <div className="row mb-3">

                <div className="col-12 col-md-4">

                  <label className="form-label fw-semibold">
                    Attendance Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={
                      attendanceDate
                    }
                    onChange={(e) =>
                      setAttendanceDate(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* ATTENDANCE LIST */}

              {staffList.length > 0 && (

                <div className="border rounded-3 overflow-hidden">

                  {staffList.map(
                    (
                      staff,
                      index
                    ) => (

                      <div
                        key={
                          staff.id
                        }
                        className="row align-items-center g-2 p-3 border-bottom"
                      >

                        {/* STAFF */}

                        <div className="col-12 col-md-7">

                          <div className="d-flex align-items-center gap-2">

                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold"
                              style={{
                                width:
                                  "38px",
                                height:
                                  "38px",
                                minWidth:
                                  "38px",
                              }}
                            >
                              {index + 1}
                            </div>

                            <div>

                              <div className="fw-bold">
                                👷{" "}
                                {
                                  staff.name
                                }
                              </div>

                              <small className="text-muted">
                                {
                                  staff.designation
                                }
                              </small>

                            </div>

                          </div>

                        </div>

                        {/* STATUS */}

                        <div className="col-12 col-md-5">

                          <select
                            className="form-select"
                            value={
                              attendance[
                              staff.id
                              ] || ""
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                staff.id,
                                e.target.value
                              )
                            }
                          >

                            <option value="">
                              Select Attendance
                            </option>

                            <option value="Present">
                              🟢 Present
                            </option>

                            <option value="Absent">
                              🔴 Absent
                            </option>

                            <option value="Half Day">
                              🟡 Half Day
                            </option>

                            <option value="Weekly Off">
                              🔵 Weekly Off
                            </option>

                          </select>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

              {/* SAVE ATTENDANCE */}

              <button
                type="button"
                className="btn btn-primary fw-bold w-100 mt-3 py-3"
                onClick={
                  saveAttendance
                }
                disabled={
                  saving ||
                  staffList.length ===
                  0
                }
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Attendance"}
              </button>

            </div>

          )}

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (

            <div className="alert alert-light border text-center fw-semibold mt-3 mb-0">
              {message}
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

const staffAttendanceStyles = `
  .add-staff-btn {
    width: auto !important;
    min-width: 110px !important;

    padding: 7px 12px !important;

    border: none !important;
    border-radius: 8px !important;

    background: #2563eb !important;
    color: white !important;

    font-size: 13px !important;
    font-weight: 600 !important;

    cursor: pointer;
  }

  @media (max-width: 768px) {

    .add-staff-btn {
      width: auto !important;
      min-width: 95px !important;

      padding: 6px 10px !important;

      font-size: 12px !important;

      border-radius: 7px !important;

      margin-left: auto !important;
    }

  }
`;

const style = document.createElement("style");
style.innerHTML = staffAttendanceStyles;
document.head.appendChild(style);

export default StaffAttendance;