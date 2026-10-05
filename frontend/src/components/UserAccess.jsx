import { useEffect, useMemo, useState } from "react";

const API_URL = `${window.location.protocol}//${window.location.hostname}:5000/api/users`;

const initialForm = {
  id: null,
  name: "",
  email: "",
  mobile: "",
  password: "",
  role: "",
  location_name: "",
  latitude: "",
  longitude: "",
  radius: "100",
};

function UserAccess() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD USERS FROM DATABASE
  // =========================
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load users");
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("Load Users Error:", err);
      setError(
        "Users load झाले नाहीत. Backend server चालू आहे का ते check करा."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================
  // GET ADMIN CURRENT LOCATION
  // =========================
  const handleUseCurrentLocation = () => {

    if (!navigator.geolocation) {
      setError(
        "Your browser does not support location."
      );
      return;
    }

    setError("");
    setSuccess("");

    navigator.geolocation.getCurrentPosition(
      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setForm((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        setSuccess(
          "Location coordinates captured successfully."
        );

      },

      (error) => {

        console.error(
          "Admin Location Error:",
          error
        );

        setError(
          "Location permission denied. Please allow location access."
        );

      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // =========================
  // ADD / UPDATE USER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic validation
    if (!form.name.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.mobile.trim()) {
      setError("Mobile number is required.");
      return;
    }

    if (!form.role) {
      setError("Please select a role.");
      return;
    }

    // Password required only while adding
    if (!form.id && !form.password) {
      setError("Password is required.");
      return;
    }

    try {
      setSaving(true);

      let response;

      if (form.id) {
        // =========================
        // UPDATE USER
        // =========================
        response = await fetch(`${API_URL}/${form.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            role: form.role,
            email: form.email,
            mobile: form.mobile,
            password: form.password,
            location_name: form.location_name,
            latitude: form.latitude,
            longitude: form.longitude,
            radius: form.radius,
          }),
        });
      } else {
        // =========================
        // CREATE USER
        // =========================
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            role: form.role,
            email: form.email,
            mobile: form.mobile,
            password: form.password,
            location_name: form.location_name,
            latitude: form.latitude,
            longitude: form.longitude,
            radius: form.radius,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      if (form.id) {
        setSuccess("User updated successfully.");
      } else {
        setSuccess("User access given successfully.");
      }

      // Database मधून fresh data घेणे
      await loadUsers();

      // Form reset
      setForm(initialForm);
    } catch (err) {
      console.error("Save User Error:", err);
      setError(err.message || "User save failed.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT USER
  // =========================
  const handleEdit = (user) => {
    setForm({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "",
      role: user.role || "",
      location_name: user.location_name || "",
      latitude: user.latitude || "",
      longitude: user.longitude || "",
      radius: user.radius || "100",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  // =========================
  // DELETE USER
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this user?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      setSuccess("User removed successfully.");

      await loadUsers();

      // जर deleted user edit mode मध्ये असेल
      if (form.id === id) {
        setForm(initialForm);
      }
    } catch (err) {
      console.error("Delete User Error:", err);
      setError(err.message || "User delete failed.");
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const handleCancel = () => {
    setForm(initialForm);
    setError("");
    setSuccess("");
  };

  // =========================
  // SEARCH
  // =========================
  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return users;

    return users.filter((user) => {
      return (
        (user.name || "").toLowerCase().includes(value) ||
        (user.email || "").toLowerCase().includes(value) ||
        (user.mobile || "").toLowerCase().includes(value) ||
        (user.role || "").toLowerCase().includes(value)
      );
    });
  }, [users, search]);

  // =========================
  // STATISTICS
  // =========================
  const totalUsers = users.length;

  const adminCount = users.filter(
    (user) => user.role === "Admin"
  ).length;

  const projectManagerCount = users.filter(
    (user) => user.role === "Project Manager"
  ).length;

  const managerCount = users.filter(
    (user) => user.role === "Manager"
  ).length;

  return (
   <div className="user-access-scroll container-fluid py-4 px-3 px-md-4">
      {/* =========================
          HEADER
      ========================= */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h5 className="fw-bold mb-1">
            <i className="bi bi-shield-lock me-2"></i>
            User Access
          </h5>

        </div>
      </div>

      {/* =========================
          ALERTS
      ========================= */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle me-2"></i>
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {/* =========================
          STAT CARDS
      ========================= */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Users</p>
                  <h3 className="fw-bold mb-0">{totalUsers}</h3>
                </div>

                <div className="fs-2 text-primary">
                  <i className="bi bi-people"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Admins</p>
                  <h3 className="fw-bold mb-0">{adminCount}</h3>
                </div>

                <div className="fs-2 text-danger">
                  <i className="bi bi-person-badge"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Project Managers</p>
                  <h3 className="fw-bold mb-0">{projectManagerCount}</h3>
                </div>

                <div className="fs-2 text-warning">
                  <i className="bi bi-person-workspace"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Managers</p>
                  <h3 className="fw-bold mb-0">{managerCount}</h3>
                </div>

                <div className="fs-2 text-success">
                  <i className="bi bi-person-gear"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          GIVE USER ACCESS FORM
      ========================= */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">
                {form.id ? "Edit User" : "Give User Access"}
              </h5>

              <small className="text-muted">
                {form.id
                  ? "Update user details and role."
                  : "Create a new system user."}
              </small>
            </div>

            {form.id && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleCancel}
              >
                <i className="bi bi-x-circle me-1"></i>
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* FULL NAME */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              {/* EMAIL */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Email <span className="text-danger">*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {/* MOBILE */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Mobile Number <span className="text-danger">*</span>
                </label>

                <input
                  type="tel"
                  name="mobile"
                  className="form-control"
                  placeholder="Enter mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                />
              </div>

              {/* ROLE */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Role <span className="text-danger">*</span>
                </label>

                <select
                  name="role"
                  className="form-select"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Project Manager">
                    Project Manager
                  </option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              {/* PASSWORD */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Password{" "}
                  {!form.id && <span className="text-danger">*</span>}
                </label>

                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder={
                    form.id
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  value={form.password}
                  onChange={handleChange}
                />

                {form.id && (
                  <small className="text-muted">
                    Leave blank if you don't want to change the password.
                  </small>
                )}
              </div>

              {/* =========================
    PUNCH LOCATION
========================= */}

              <div className="col-12">

                <hr className="my-2" />

                <h6 className="fw-bold mb-3">
                  📍 Punch Location
                </h6>

              </div>

              {/* LOCATION NAME */}

              <div className="col-12 col-md-6">

                <label className="form-label fw-semibold">
                  Location Name
                </label>

                <input
                  type="text"
                  name="location_name"
                  className="form-control"
                  placeholder="e.g. Properties United Office"
                  value={form.location_name}
                  onChange={handleChange}
                />

              </div>
              
              {/* USE CURRENT LOCATION */}

<div className="col-12 col-md-6">

  <label className="form-label fw-semibold">
    GPS Location
  </label>

  <button
    type="button"
    className="btn btn-outline-primary w-100"
    onClick={handleUseCurrentLocation}
  >
    📍 Use Current Location
  </button>

  {form.latitude && form.longitude && (
    <small className="text-success d-block mt-2">
      ✓ Location coordinates captured
    </small>
  )}

</div>


              {/* RADIUS */}

              <div className="col-12 col-md-6">

                <label className="form-label fw-semibold">
                  Allowed Radius (Meters)
                </label>

                <input
                  type="number"
                  name="radius"
                  className="form-control"
                  min="10"
                  max="5000"
                  placeholder="100"
                  value={form.radius}
                  onChange={handleChange}
                />

                <small className="text-muted">
                  User या radius च्या आत असेल तरच Punch In / Punch Out करता येईल.
                </small>

              </div>

              {/* BUTTON */}
              <div className="col-12 col-md-6 d-flex align-items-end">
                <div className="d-flex gap-2 w-100">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i
                          className={`bi ${form.id ? "bi-pencil-square" : "bi-person-plus"
                            } me-2`}
                        ></i>

                        {form.id ? "Update User" : "Give Access"}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* =========================
          SYSTEM USERS
      ========================= */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h5 className="fw-bold mb-1">System Users</h5>
              <small className="text-muted">
                Users stored in the database.
              </small>
            </div>

            <div style={{ minWidth: "260px" }}>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-2 mb-0">
                Loading users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5 px-3">
              <i className="bi bi-people fs-1 text-muted"></i>

              <h6 className="mt-3">No users found</h6>

              <p className="text-muted mb-0">
                {search
                  ? "Try another search."
                  : "Give access to your first user."}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="fw-semibold">
                          {user.name}
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>{user.mobile}</td>

                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          {user.role}
                        </span>
                      </td>

                      <td>
                        {user.created_at
                          ? new Date(
                            user.created_at
                          ).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary px-3 py-2"
                            title="Edit User"
                            onClick={() => handleEdit(user)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger px-3 py-2"
                            title="Remove User"
                            onClick={() => handleDelete(user.id)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


const userAccessStyles = `
  .user-access-scroll {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .user-access-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .user-access-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  .user-access-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  @media (max-width: 768px) {
    .user-access-scroll {
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
`;

const style = document.createElement("style");
style.innerHTML = userAccessStyles;
document.head.appendChild(style);

export default UserAccess;