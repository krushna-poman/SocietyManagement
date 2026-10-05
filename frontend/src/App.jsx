import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import UserLogin from "./user/UserLogin";

function UserLoginPage() {
  return <UserLogin />;
}

function App() {
  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState(1);
  const [forgotPassword, setForgotPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentPath =
    window.location.pathname.replace(/\/+$/, "") || "/";

  // USER LOGIN
  if (currentPath === "/user-login") {
    return <UserLogin />;
  }

  // MANAGER DASHBOARD
  if (currentPath === "/manager-dashboard") {
    return <Dashboard role="Manager" />;
  }

  // PROJECT MANAGER DASHBOARD
  if (currentPath === "/project-manager-dashboard") {
    return <Dashboard role="Project Manager" />;
  }

  // ADMIN DASHBOARD
  if (currentPath === "/admin-dashboard") {
    return <Dashboard role="Admin" />;
  }
const handleForgotPassword = async () => {
  if (!forgotEmail) {
    alert("Please enter your email address");
    return;
  }

  try {
    const response = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: forgotEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("OTP generated successfully. Check backend console.");

    setEmail(forgotEmail);
  } catch (error) {
    console.error("Forgot Password Error:", error);

    alert(
      "Cannot connect to server. Please make sure backend is running."
    );
  }
};

  const signIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter Email and Password");
      return;
    }

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      // ===============================
      // ACCOUNT NEEDS OTP VERIFICATION
      // ===============================

      if (response.status === 403) {

        if (data.userId) {
          setUserId(data.userId);
        }

        setOtp("");
        setStep(2);

        return;
      }

      // ===============================
      // OTHER ERRORS
      // ===============================

      if (!response.ok) {
        alert(data.message);
        return;
      }

      // ===============================
      // LOGIN SUCCESS
      // ===============================

      alert("Login successful!");

      console.log("Logged in admin:", data.user);

      // Save admin login
      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      // Go to Admin Dashboard
      window.location.href =
        "/admin-dashboard";

    } catch (error) {

      console.error("Login Error:", error);

      alert(
        "Cannot connect to server. Please make sure backend is running."
      );
    }
  };

  const verifyOtp = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter 6 digit OTP");
      return;
    }

    localStorage.setItem(
      "adminUser",
      JSON.stringify({
        id: userId,
        email: email,
        role: "Admin",
      })
    );

    window.location.href =
      "/admin-dashboard";
  };

  const signUp = async (e) => {
    e.preventDefault();

    if (!name || !email || !mobile || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (mobile.length !== 10) {
      alert("Please enter a valid 10 digit mobile number");
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            full_name: name,
            email: email,
            mobile: mobile,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setUserId(data.userId);
      setOtp("");
      setStep(2);
    } catch (error) {
      console.error("Signup Error:", error);

      alert(
        "Cannot connect to server. Please make sure backend is running."
      );
    }
  };

  const verifySignupOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter 6 digit OTP");
      return;
    }

    if (!userId) {
      alert("User ID not found. Please sign up again.");
      return;
    }

    try {
      const response = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("OTP verified successfully!");

      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          id: userId,
          email: email,
          role: "Admin",
        })
      );

      setOtp("");

      window.location.href =
        "/admin-dashboard";


    } catch (error) {
      console.error("OTP Verification Error:", error);

      alert(
        "Cannot connect to server. Please make sure backend is running."
      );
    }
  };


  return (
    <div className="page">

      {step === 3 ? (

        <Dashboard />

      ) : (

        <div className="login-card">

          {/* LEFT IMAGE */}
          <div className="left-panel">

            <img
              src="/images/society.png"
              alt="Society"
            />



          </div>


          {/* RIGHT LOGIN */}
          <div className="right-panel">

            <div className="form-container">

              <p className="subtitle">
                {mode === "signin"
                  ? "Sign in to your account"
                  : "Create your account"}
              </p>

 
 {/* ================= FORGOT PASSWORD ================= */}

{forgotPassword && (

  <div className="forgot-password-box">

    <h2>Forgot Password?</h2>

    <p>Enter your registered email address.</p>

    <div className="input-group">

      <label>Email Address</label>

      <div className="input-box">

        <span>✉</span>

        <input
          type="email"
          placeholder="Enter your email address"
          value={forgotEmail}
          onChange={(e) =>
            setForgotEmail(e.target.value)
          }
        />

      </div>

    </div>

    <button
      type="button"
      className="main-button"
      onClick={handleForgotPassword}
    >
      Send OTP
      <span>→</span>
    </button>

    <button
      type="button"
      className="back-button"
      onClick={() => {
        setForgotPassword(false);
        setForgotEmail("");
      }}
    >
      ← Back to Login
    </button>

  </div>

)}


              {/* ================= SIGN IN ================= */}

              {mode === "signin" && step === 1 && !forgotPassword && (
                <form onSubmit={signIn}>


                  <div className="input-group">

                    <label>Email Address</label>

                    <div className="input-box">

                      <span>✉</span>

                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />

                    </div>

                  </div>


                  <div className="input-group">

                    <label>Password</label>

                    <div className="input-box">

                      <span>🔒</span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="eye"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword ? "👁" : "◉"}
                      </button>

                    </div>

                  </div>


                  <div className="options">
                  <button
  type="button"
  onClick={() => {
    setForgotPassword(true);
  }}
>
  Forgot Password?
</button>
                  </div>


                  <button className="main-button">
                    Sign In
                  </button>

                 <button
  type="button"
  className="signup-bottom-button"
  onClick={() => {
    setMode("signup");
    setStep(1);
  }}
>
  Sign Up
</button>

                </form>
              )}


              {/* ================= OTP ================= */}

              {mode === "signin" && step === 2 && (

                <form onSubmit={verifyOtp}>

                  <div className="otp-box">

                    <div>✉</div>

                    <p>OTP has been sent to</p>

                    <strong>{email}</strong>

                  </div>

                  <div className="input-group">

                    <label>Enter 6 Digit OTP</label>

                    <div className="input-box">

                      <span>🔐</span>

                      <input
                        type="text"
                        maxLength="6"
                        inputMode="numeric"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                      />

                    </div>

                  </div>

                  <button className="main-button">
                    Verify & Login
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    className="back-button"
                    onClick={() => setStep(1)}
                  >
                    ← Back to Login
                  </button>

                </form>
              )}



              {/* ================= SIGN UP ================= */}

              {mode === "signup" && step === 1 && (

                <form onSubmit={signUp} className="signup-form">

                  <div className="input-group">

                    <label>Full Name</label>

                    <div className="input-box">

                      <span>👤</span>

                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                      />

                    </div>

                  </div>


                  <div className="input-group">

                    <label>Email Address</label>

                    <div className="input-box">

                      <span>✉</span>

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />

                    </div>

                  </div>


                  <div className="input-group">

                    <label>Mobile Number</label>

                    <div className="input-box">

                      <span>📱</span>

                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={mobile}
                        onChange={(e) =>
                          setMobile(e.target.value)
                        }
                      />

                    </div>

                  </div>


                  <div className="input-group">

                    <label>Password</label>

                    <div className="input-box">

                      <span>🔒</span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Create password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="eye"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        👁
                      </button>

                    </div>

                  </div>


                  <div className="input-group">

                    <label>Confirm Password</label>

                    <div className="input-box">

                      <span>🔒</span>

                      <input
                        type={
                          showConfirm
                            ? "text"
                            : "password"
                        }
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="eye"
                        onClick={() =>
                          setShowConfirm(!showConfirm)
                        }
                      >
                        👁
                      </button>

                    </div>

                  </div>


                  <button className="main-button">
                    Create Account
                    <span>→</span>
                  </button>
  <div className="signup-login-link">
  Already have an account?{" "}
  <button
    type="button"
    onClick={() => {
      setMode("signin");
      setStep(1);
    }}
  >
    Sign In
  </button>
</div>

                </form>

              )}

              {/* ================= SIGN UP OTP ================= */}

              {mode === "signup" && step === 2 && (

                <form onSubmit={verifySignupOtp}>

                  <div className="otp-box">

                    <div>🔐</div>

                    <p>OTP has been sent to</p>

                    <strong>******{mobile.slice(-4)}</strong>

                  </div>

                  <div className="input-group">

                    <label>Enter 6 Digit OTP</label>

                    <div className="input-box">

                      <span>🔐</span>

                      <input
                        type="text"
                        maxLength="6"
                        inputMode="numeric"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                      />

                    </div>

                  </div>

                  <button
                    type="submit"
                    className="main-button"
                  >
                    Verify OTP
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    className="back-button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                    }}
                  >
                    ← Back to Sign Up
                  </button>

                </form>

              )}
              {/* SECURITY */}

              <div className="security">
                🛡️ Secure &nbsp;•&nbsp; Reliable &nbsp;•&nbsp; Efficient
              </div>


              <div className="copyright">
                © 2026 Society Management System
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
