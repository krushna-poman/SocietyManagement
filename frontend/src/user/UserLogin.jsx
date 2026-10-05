import { useState } from "react";
import propertiesLogo from "../assets/properties-united-logo.png";

function UserLogin() {
  // const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter Email ID.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter Password.");
      return;
    }

    try {
      setLoading(true);

      const API_URL = "/api/users/login";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }

   const user = data.user;

// SAVE LOGGED-IN USER
sessionStorage.setItem(
  "user",
  JSON.stringify(user)
);

localStorage.setItem(
  "user",
  JSON.stringify(user)
);

// Role Based Login
if (user.role === "Admin") {
  window.location.href = "/admin-dashboard";
}
else if (user.role === "Project Manager") {
  window.location.href = "/project-manager-dashboard";
}
else if (user.role === "Manager") {
  window.location.href = "/manager-dashboard";
}
else {
  setError("Invalid user role.");
}

    } catch (error) {
      console.error("Login Error:", error);

      setError(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        backgroundColor: "#f5f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* MAIN CARD */}
      <div
        className="card border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "1050px",
          maxHeight: "calc(100dvh - 16px)",
          borderRadius: "22px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="row g-0">

          {/* ================= LEFT IMAGE ================= */}

         <div
  className="col-lg-6 d-none d-lg-flex align-items-stretch justify-content-center"
  style={{
    backgroundColor: "#f1f6ff",
    padding: "0",
  }}
>
  <div className="w-100 h-100">

    <img
      src="/images/society.png"
      alt="Society"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />

  </div>
</div>

          {/* ================= LOGIN SIDE ================= */}

          <div
            className="col-12 col-lg-6"
            style={{
              backgroundColor: "#ffffff",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                margin: "0 auto",
                padding: "18px",
                boxSizing: "border-box",
              }}
            >

              {/* LOGO */}

              <div className="text-center mb-2">
                <img
                  src={propertiesLogo}
                  alt="Properties United"
                  className="img-fluid d-block mx-auto"
                  style={{
                    width: "150px",
                    maxWidth: "55%",
                    height: "auto",
                  }}
                />
              </div>

              {/* WELCOME */}

              <div className="text-center mb-3">

                <h5
                  className="fw-bold mb-1"
                  style={{
                    color: "#111827",
                    fontSize: "clamp(25px, 5vw, 34px)",
                  }}
                >
                  Welcome Back
                </h5>

                <p
                  className="text-secondary mb-0"
                  style={{ fontSize: "14px" }}
                >
                  Login to access your account
                </p>

              </div>

              {error && (
                <div
                  className="alert alert-danger py-2 mb-3"
                  style={{ fontSize: "13px" }}
                >
                  {error}
                </div>
              )}

              {/* FORM */}

              <form onSubmit={handleLogin}>

                {/* EMAIL */}

                <div className="mb-2">

                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "14px" }}
                  >
                    Email address
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                   style={{
  height: "48px",
  borderRadius: "10px",
  fontSize: "15px",
  border: "1px solid #d7deea",
  padding: "0 15px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
}}
                  />

                </div>

                {/* PASSWORD */}

                <div className="mb-2">

                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "14px" }}
                  >
                    Password
                  </label>

                  <div className="input-group">

                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                     style={{
  height: "48px",
  borderRadius: "10px 0 0 10px",
  fontSize: "15px",
  border: "1px solid #d7deea",
  padding: "0 15px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
}}
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      style={{
                        width: "48px",
                        borderRadius: "0 9px 9px 0",
                      }}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>

                  </div>

                </div>

                {/* REMEMBER + FORGOT */}

                {/* FORGOT PASSWORD */}

<div className="d-flex justify-content-end align-items-center mb-3">
  <button
    type="button"
    className="btn btn-link p-0 text-decoration-none"
    style={{
      color: "#123d91",
      fontSize: "13px",
    }}
  >
    Forgot password?
  </button>
</div>
                {/* LOGIN */}

                <button
                  type="submit"
                  className="btn w-100 fw-semibold"
                  disabled={loading}
                style={{
  height: "50px",
  backgroundColor: "#123d91",
  color: "#ffffff",
  borderRadius: "10px",
  border: "none",
  fontSize: "16px",
  boxShadow: "0 5px 12px rgba(18,61,145,0.20)",
}}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

              </form>

              {/* SIGN UP */}

              <div className="text-center mt-3">

                <span
                  className="text-secondary"
                  style={{ fontSize: "13px" }}
                >
                  Don't have an account?
                </span>

                <button
                  type="button"
                  className="btn btn-link p-0 ms-1 text-decoration-none fw-semibold"
                  style={{
                    color: "#123d91",
                    fontSize: "13px",
                  }}
                >
                  Sign Up
                </button>

              </div>

              {/* FOOTER */}

              <div className="text-center mt-2">

                <small
                  className="text-secondary"
                  style={{ fontSize: "11px" }}
                >
                  © 2026 Properties United
                </small>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserLogin;
