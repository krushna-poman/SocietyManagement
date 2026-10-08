const express = require("express");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// PUNCH PHOTO UPLOAD
// ===============================

const uploadDir = path.join(__dirname, "uploads", "punch");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `punch-${Date.now()}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const punchUpload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =====================================================
// ADMIN SIGN UP
// =====================================================

app.post("/api/admin/signup", async (req, res) => {

  try {

    const {
      full_name,
      email,
      mobile,
      password
    } = req.body;

    if (!full_name || !email || !mobile || !password) {

      return res.status(400).json({
        success: false,
        message: "Please fill all fields"
      });

    }

    const checkSql = `
      SELECT id
      FROM admin_users
      WHERE email = ? OR mobile = ?
    `;

    db.query(
      checkSql,
      [email, mobile],
      async (err, results) => {

        if (err) {

          console.error("Database Error:", err);

          return res.status(500).json({
            success: false,
            message: "Database error"
          });

        }

        if (results.length > 0) {

          return res.status(409).json({
            success: false,
            message: "Email or mobile already registered"
          });

        }

        const otp = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        console.log("Generated OTP:", otp);

        const hashedPassword =
          await bcrypt.hash(password, 10);

        const insertSql = `
          INSERT INTO admin_users
          (
            full_name,
            email,
            mobile,
            password,
            otp,
            otp_verified,
            status
          )
          VALUES (?, ?, ?, ?, ?, FALSE, 'Pending')
        `;

        db.query(
          insertSql,
          [
            full_name,
            email,
            mobile,
            hashedPassword,
            otp
          ],
          (err, result) => {

            if (err) {

              console.error("Insert Error:", err);

              return res.status(500).json({
                success: false,
                message: "Failed to create account"
              });

            }

            console.log(
              `OTP generated for ${mobile}: ${otp}`
            );

            return res.status(201).json({
              success: true,
              message:
                "Account created. OTP verification required.",
              userId: result.insertId
            });

          }
        );

      }
    );

  } catch (error) {

    console.error("Server Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});


// =====================================================
// VERIFY OTP
// =====================================================

app.post("/api/admin/verify-otp", (req, res) => {

  const {
    userId,
    otp
  } = req.body;

  if (!userId || !otp) {

    return res.status(400).json({
      success: false,
      message: "User ID and OTP are required"
    });

  }

  const sql = `
    SELECT id, otp
    FROM admin_users
    WHERE id = ?
  `;

  db.query(
    sql,
    [userId],
    (err, results) => {

      if (err) {

        console.error("Database Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database error"
        });

      }

      if (results.length === 0) {

        return res.status(404).json({
          success: false,
          message: "User not found"
        });

      }

      const user = results[0];

      if (user.otp !== otp) {

        return res.status(401).json({
          success: false,
          message: "Invalid OTP"
        });

      }

      const updateSql = `
        UPDATE admin_users
        SET
          otp_verified = TRUE,
          status = 'Active',
          otp = NULL
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [userId],
        (err) => {

          if (err) {

            console.error("Update Error:", err);

            return res.status(500).json({
              success: false,
              message: "Failed to verify OTP"
            });

          }

          return res.json({
            success: true,
            message: "OTP verified successfully!"
          });

        }
      );

    }
  );

});


// ===============================
// ADMIN FORGOT PASSWORD
// ===============================

app.post("/api/admin/forgot-password", (req, res) => {

  const { email } = req.body;

  // Check email
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  // Find admin
  const sql = `
    SELECT id, email
    FROM admin_users
    WHERE email = ?
  `;

  db.query(sql, [email], (err, results) => {

    if (err) {
      console.error("Database Error:", err);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    // Email not found
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not registered"
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log("Forgot Password OTP:", otp);

    // Save OTP
    const updateSql = `
      UPDATE admin_users
      SET otp = ?
      WHERE id = ?
    `;

    db.query(
      updateSql,
      [otp, results[0].id],
      (err) => {

        if (err) {
          console.error("OTP Save Error:", err);

          return res.status(500).json({
            success: false,
            message: "Failed to generate OTP"
          });
        }

        return res.json({
          success: true,
          message: "OTP generated successfully",
          userId: results[0].id
        });

      }
    );

  });

});

// =====================================================
// ADMIN LOGIN
// =====================================================

app.post("/api/admin/login", (req, res) => {

  const {
    email,
    password
  } = req.body;

  if (!email || !password) {

    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });

  }

  const sql = `
    SELECT
      id,
      full_name,
      email,
      password,
      status,
      otp_verified
    FROM admin_users
    WHERE email = ?
  `;

  db.query(
    sql,
    [email],
    async (err, results) => {

      if (err) {

        console.error("Database Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database error"
        });

      }

      if (results.length === 0) {

        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });

      }

      const admin = results[0];

      const passwordMatch =
        await bcrypt.compare(
          password,
          admin.password
        );

      if (!passwordMatch) {

        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });

      }

      if (
        admin.status !== "Active" ||
        !admin.otp_verified
      ) {

        return res.status(403).json({
          success: false,
          message: "Please verify your OTP first",
          userId: admin.id
        });

      }

      return res.json({
        success: true,
        message: "Login successful",
        user: {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email
        }
      });

    }
  );

});


// =====================================================
// CREATE USER
// =====================================================

app.post("/api/users", async (req, res) => {

  try {

    const {
      name,
      role,
      email,
      mobile,
      password,
      location_name,
      latitude,
      longitude,
      radius
    } = req.body;


    // -----------------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------------

    if (
      !name ||
      !role ||
      !email ||
      !mobile ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });

    }


    // -----------------------------------------------
    // CHECK EMAIL / MOBILE
    // -----------------------------------------------

    const checkSql = `
      SELECT id
      FROM users
      WHERE email = ? OR mobile = ?
    `;

    db.query(
      checkSql,
      [email, mobile],
      async (err, results) => {

        if (err) {

          console.error(
            "Database Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message: "Database error"
          });

        }


        if (results.length > 0) {

          return res.status(409).json({
            success: false,
            message:
              "Email or mobile already exists"
          });

        }


        // -------------------------------------------
        // HASH PASSWORD
        // -------------------------------------------

        const hashedPassword =
          await bcrypt.hash(password, 10);


        // -------------------------------------------
        // INSERT USER
        // -------------------------------------------

        const insertSql = `
          INSERT INTO users
          (
            name,
            role,
            email,
            mobile,
            password,
            location_name,
            latitude,
            longitude,
            radius
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
          insertSql,
          [
            name,
            role,
            email,
            mobile,
            hashedPassword,
            location_name || null,
            latitude || null,
            longitude || null,
            radius || 100
          ],
          (err, result) => {

            if (err) {

              console.error(
                "Insert User Error:",
                err
              );

              return res.status(500).json({
                success: false,
                message:
                  "Failed to create user"
              });

            }


            // ---------------------------------------
            // SUCCESS
            // ---------------------------------------

            return res.status(201).json({

              success: true,

              message:
                "User created successfully",

              userId:
                result.insertId

            });

          }
        );

      }
    );

  } catch (error) {

    console.error(
      "Create User Server Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

});


// =====================================================
// GET ALL USERS
// =====================================================

app.get("/api/users", (req, res) => {

  const sql = `
  SELECT
  id,
  name,
  role,
  email,
  mobile,
  location_name,
  latitude,
  longitude,
  radius,
  created_at
FROM users
    ORDER BY id DESC
  `;

  db.query(
    sql,
    (err, results) => {

      if (err) {

        console.error("Database Error:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch users"
        });

      }

      return res.json({
        success: true,
        users: results
      });

    }
  );

});


// =====================================================
// UPDATE USER
// =====================================================

app.put("/api/users/:id", async (req, res) => {

  try {

    const userId =
      req.params.id;


    const {
      name,
      role,
      email,
      mobile,
      password,
      location_name,
      latitude,
      longitude,
      radius
    } = req.body;


    // -----------------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------------

    if (
      !name ||
      !role ||
      !email ||
      !mobile
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Please fill all required fields"

      });

    }


    // -----------------------------------------------
    // UPDATE WITH PASSWORD
    // -----------------------------------------------

    if (
      password &&
      password.trim() !== ""
    ) {

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      const sql = `
        UPDATE users
        SET
          name = ?,
          role = ?,
          email = ?,
          mobile = ?,
          password = ?,
          location_name = ?,
          latitude = ?,
          longitude = ?,
          radius = ?
        WHERE id = ?
      `;


      const values = [

        name,

        role,

        email,

        mobile,

        hashedPassword,

        location_name || null,

        latitude || null,

        longitude || null,

        radius || 100,

        userId

      ];


      db.query(
        sql,
        values,
        (err, result) => {

          if (err) {

            console.error(
              "Update User Error:",
              err
            );


            if (
              err.code === "ER_DUP_ENTRY"
            ) {

              return res.status(409).json({

                success: false,

                message:
                  "Email already exists"

              });

            }


            return res.status(500).json({

              success: false,

              message:
                "Failed to update user"

            });

          }


          if (
            result.affectedRows === 0
          ) {

            return res.status(404).json({

              success: false,

              message:
                "User not found"

            });

          }


          return res.json({

            success: true,

            message:
              "User updated successfully"

          });

        }
      );

      return;

    }


    // -----------------------------------------------
    // UPDATE WITHOUT PASSWORD
    // -----------------------------------------------

    const sql = `
      UPDATE users
      SET
        name = ?,
        role = ?,
        email = ?,
        mobile = ?,
        location_name = ?,
        latitude = ?,
        longitude = ?,
        radius = ?
      WHERE id = ?
    `;


    const values = [

      name,

      role,

      email,

      mobile,

      location_name || null,

      latitude || null,

      longitude || null,

      radius || 100,

      userId

    ];


    db.query(
      sql,
      values,
      (err, result) => {

        if (err) {

          console.error(
            "Update User Error:",
            err
          );


          if (
            err.code === "ER_DUP_ENTRY"
          ) {

            return res.status(409).json({

              success: false,

              message:
                "Email already exists"

            });

          }


          return res.status(500).json({

            success: false,

            message:
              "Failed to update user"

          });

        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({

            success: false,

            message:
              "User not found"

          });

        }


        return res.json({

          success: true,

          message:
            "User updated successfully"

        });

      }
    );

  } catch (error) {

    console.error(
      "Update User Server Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

});


// =====================================================
// DELETE USER
// =====================================================

app.delete("/api/users/:id", (req, res) => {

  const userId = req.params.id;

  const sql = `
    DELETE FROM users
    WHERE id = ?
  `;

  db.query(
    sql,
    [userId],
    (err, result) => {

      if (err) {

        console.error(
          "Delete Error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to delete user"
        });

      }

      if (result.affectedRows === 0) {

        return res.status(404).json({
          success: false,
          message: "User not found"
        });

      }

      return res.json({
        success: true,
        message: "User deleted successfully"
      });

    }
  );

});


// =====================================================
// USER LOGIN
// =====================================================

app.post("/api/users/login", (req, res) => {

  const {
    email,
    password
  } = req.body;

  if (!email || !password) {

    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });

  }

  const sql = `
    SELECT
      id,
      name,
      role,
      email,
      mobile,
      password
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [email],
    async (err, results) => {

      if (err) {

        console.error("Database Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database error"
        });

      }

      if (results.length === 0) {

        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });

      }

      const user = results[0];

      try {

        const passwordMatch =
          await bcrypt.compare(
            password,
            user.password
          );

        if (!passwordMatch) {

          return res.status(401).json({
            success: false,
            message: "Invalid email or password"
          });

        }

        return res.status(200).json({

          success: true,

          message: "Login successful",

          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role
          }

        });

      } catch (error) {

        console.error(
          "Password Check Error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Server error during password verification"
        });

      }

    }
  );

});


// =====================================================
// PROJECT MANAGEMENT
// =====================================================


// =====================================================
// CREATE PROJECT
// =====================================================

app.post("/api/projects", async (req, res) => {

  try {

    const {
      name,
      location,
      status,

      projectManagerName,
      projectManagerEmail,
      projectManagerPassword,

      managerName,
      managerEmail,
      managerPassword

    } = req.body;


    // -----------------------------------------------
    // REQUIRED PROJECT FIELDS
    // -----------------------------------------------

    if (
      !name ||
      !name.trim() ||
      !location ||
      !location.trim() ||
      !status
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Project name, location and status are required."
      });

    }


    // -----------------------------------------------
    // OPTIONAL ACCESS VALIDATION
    // -----------------------------------------------

    const projectManagerAccessProvided =
      projectManagerName ||
      projectManagerEmail ||
      projectManagerPassword;

    const managerAccessProvided =
      managerName ||
      managerEmail ||
      managerPassword;


    if (projectManagerAccessProvided) {

      if (
        !projectManagerName ||
        !projectManagerEmail ||
        !projectManagerPassword
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Project Manager access साठी Name, Email आणि Password तिन्ही required आहेत."
        });

      }

    }


    if (managerAccessProvided) {

      if (
        !managerName ||
        !managerEmail ||
        !managerPassword
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Manager access साठी Name, Email आणि Password तिन्ही required आहेत."
        });

      }

    }


    // -----------------------------------------------
    // CREATE PROJECT
    // -----------------------------------------------

    const projectSql = `
      INSERT INTO projects
      (
        name,
        location,
        status
      )
      VALUES (?, ?, ?)
    `;

    db.query(
      projectSql,
      [
        name.trim(),
        location.trim(),
        status
      ],
      async (projectError, projectResult) => {

        if (projectError) {

          console.error(
            "Project Create Error:",
            projectError
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to create project."
          });

        }

        const projectId =
          projectResult.insertId;


        // =================================================
        // PROJECT MANAGER ACCESS
        // =================================================

        if (projectManagerAccessProvided) {

          try {

            const hashedPassword =
              await bcrypt.hash(
                projectManagerPassword,
                10
              );

            const checkManagerSql = `
              SELECT id
              FROM users
              WHERE email = ?
              LIMIT 1
            `;

            db.query(
              checkManagerSql,
              [projectManagerEmail.trim()],
              (managerCheckError, managerResults) => {

                if (managerCheckError) {

                  console.error(
                    "Project Manager Check Error:",
                    managerCheckError
                  );

                  return;
                }


                if (managerResults.length > 0) {

                  const managerUserId =
                    managerResults[0].id;

                  const assignSql = `
                    INSERT INTO project_users
                    (
                      project_id,
                      user_id,
                      access_role
                    )
                    VALUES (?, ?, 'Project Manager')
                  `;

                  db.query(
                    assignSql,
                    [
                      projectId,
                      managerUserId
                    ],
                    (assignError) => {

                      if (assignError) {

                        console.error(
                          "Project Manager Assignment Error:",
                          assignError
                        );

                      }

                    }
                  );

                } else {

                  const createManagerSql = `
                    INSERT INTO users
                    (
                      name,
                      role,
                      email,
                      mobile,
                      password
                    )
                    VALUES (?, 'Project Manager', ?, '', ?)
                  `;

                  db.query(
                    createManagerSql,
                    [
                      projectManagerName.trim(),
                      projectManagerEmail.trim(),
                      hashedPassword
                    ],
                    (managerCreateError, managerResult) => {

                      if (managerCreateError) {

                        console.error(
                          "Project Manager Create Error:",
                          managerCreateError
                        );

                        return;
                      }

                      const newUserId =
                        managerResult.insertId;

                      const assignSql = `
                        INSERT INTO project_users
                        (
                          project_id,
                          user_id,
                          access_role
                        )
                        VALUES (?, ?, 'Project Manager')
                      `;

                      db.query(
                        assignSql,
                        [
                          projectId,
                          newUserId
                        ],
                        (assignError) => {

                          if (assignError) {

                            console.error(
                              "Project Manager Assignment Error:",
                              assignError
                            );

                          }

                        }
                      );

                    }
                  );

                }

              }
            );

          } catch (error) {

            console.error(
              "Project Manager Password Error:",
              error
            );

          }

        }


        // =================================================
        // MANAGER ACCESS
        // =================================================

        if (managerAccessProvided) {

          try {

            const hashedPassword =
              await bcrypt.hash(
                managerPassword,
                10
              );

            const checkManagerSql = `
              SELECT id
              FROM users
              WHERE email = ?
              LIMIT 1
            `;

            db.query(
              checkManagerSql,
              [managerEmail.trim()],
              (managerCheckError, managerResults) => {

                if (managerCheckError) {

                  console.error(
                    "Manager Check Error:",
                    managerCheckError
                  );

                  return;
                }


                if (managerResults.length > 0) {

                  const managerUserId =
                    managerResults[0].id;

                  const assignSql = `
                    INSERT INTO project_users
                    (
                      project_id,
                      user_id,
                      access_role
                    )
                    VALUES (?, ?, 'Manager')
                  `;

                  db.query(
                    assignSql,
                    [
                      projectId,
                      managerUserId
                    ],
                    (assignError) => {

                      if (assignError) {

                        console.error(
                          "Manager Assignment Error:",
                          assignError
                        );

                      }

                    }
                  );

                } else {

                  const createManagerSql = `
                    INSERT INTO users
                    (
                      name,
                      role,
                      email,
                      mobile,
                      password
                    )
                    VALUES (?, 'Manager', ?, '', ?)
                  `;

                  db.query(
                    createManagerSql,
                    [
                      managerName.trim(),
                      managerEmail.trim(),
                      hashedPassword
                    ],
                    (managerCreateError, managerResult) => {

                      if (managerCreateError) {

                        console.error(
                          "Manager Create Error:",
                          managerCreateError
                        );

                        return;
                      }

                      const newUserId =
                        managerResult.insertId;

                      const assignSql = `
                        INSERT INTO project_users
                        (
                          project_id,
                          user_id,
                          access_role
                        )
                        VALUES (?, ?, 'Manager')
                      `;

                      db.query(
                        assignSql,
                        [
                          projectId,
                          newUserId
                        ],
                        (assignError) => {

                          if (assignError) {

                            console.error(
                              "Manager Assignment Error:",
                              assignError
                            );

                          }

                        }
                      );

                    }
                  );

                }

              }
            );

          } catch (error) {

            console.error(
              "Manager Password Error:",
              error
            );

          }

        }


        // -----------------------------------------------
        // PROJECT CREATED
        // -----------------------------------------------

        return res.status(201).json({

          success: true,

          message:
            "Project created successfully.",

          projectId: projectId

        });

      }
    );

  } catch (error) {

    console.error(
      "Create Project Server Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Server error while creating project."

    });

  }

});


// =====================================================
// GET ALL PROJECTS
// =====================================================

app.get("/api/projects", (req, res) => {

  const sql = `
    SELECT
      p.id,
      p.name,
      p.location,
      p.status,
      p.created_at,
      u.name AS project_manager_name

    FROM projects p

    LEFT JOIN (
      SELECT
        project_id,
        MAX(user_id) AS user_id
      FROM project_users
      WHERE access_role = 'Project Manager'
      GROUP BY project_id
    ) pu
      ON pu.project_id = p.id

    LEFT JOIN users u
      ON u.id = pu.user_id

    ORDER BY p.id DESC
  `;

  db.query(
    sql,
    (err, results) => {

      if (err) {

        console.error(
          "Get Projects Error:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch projects."
        });

      }

      return res.json({
        success: true,
        projects: results
      });

    }
  );

});


// =====================================================
// GET PROJECT USERS
// =====================================================

app.get(
  "/api/projects/:projectId/users",
  (req, res) => {

    const projectId =
      req.params.projectId;

    const sql = `
      SELECT
        pu.id,
        pu.project_id,
        pu.user_id,
        pu.access_role,
        u.name,
        u.email,
        u.mobile,
        u.role
      FROM project_users pu

      INNER JOIN users u
        ON u.id = pu.user_id

      WHERE pu.project_id = ?

      ORDER BY pu.id ASC
    `;

    db.query(
      sql,
      [projectId],
      (err, results) => {

        if (err) {

          console.error(
            "Get Project Users Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to fetch project users."
          });

        }

        return res.json({
          success: true,
          users: results
        });

      }
    );

  }
);


// =====================================================
// UPDATE PROJECT SETTINGS
// =====================================================

app.put(
  "/api/projects/:projectId",
  async (req, res) => {

    try {

      const projectId =
        req.params.projectId;

      const {
        name,
        location,
        status,

        managerName,
        managerEmail,
        managerPassword,

        projectManagerName,
        projectManagerEmail,
        projectManagerPassword

      } = req.body;


      if (
        !name ||
        !name.trim() ||
        !location ||
        !location.trim() ||
        !status
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Project Name, Location and Status are required."
        });

      }


      // =================================================
      // UPDATE PROJECT
      // =================================================

      const updateProjectSql = `
        UPDATE projects
        SET
          name = ?,
          location = ?,
          status = ?
        WHERE id = ?
      `;


      db.query(
        updateProjectSql,
        [
          name.trim(),
          location.trim(),
          status,
          projectId
        ],
        async (err, result) => {

          if (err) {

            console.error(
              "Update Project Error:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to update project."
            });

          }


          if (
            result.affectedRows === 0
          ) {

            return res.status(404).json({
              success: false,
              message:
                "Project not found."
            });

          }


          // =================================================
          // MANAGER UPDATE / CREATE
          // =================================================

          if (
            managerEmail &&
            managerName
          ) {

            try {

              const managerPasswordHash =
                managerPassword
                  ? await bcrypt.hash(
                    managerPassword,
                    10
                  )
                  : null;


              db.query(
                `
                SELECT id
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [
                  managerEmail.trim()
                ],
                (checkErr, users) => {

                  if (checkErr) {

                    console.error(
                      "Manager Check Error:",
                      checkErr
                    );

                    return;

                  }


                  if (
                    users.length > 0
                  ) {

                    const userId =
                      users[0].id;


                    const updateSql =
                      managerPasswordHash
                        ? `
                          UPDATE users
                          SET
                            name = ?,
                            email = ?,
                            role = 'Manager',
                            password = ?
                          WHERE id = ?
                        `
                        : `
                          UPDATE users
                          SET
                            name = ?,
                            email = ?,
                            role = 'Manager'
                          WHERE id = ?
                        `;


                    const values =
                      managerPasswordHash
                        ? [
                          managerName.trim(),
                          managerEmail.trim(),
                          managerPasswordHash,
                          userId
                        ]
                        : [
                          managerName.trim(),
                          managerEmail.trim(),
                          userId
                        ];


                    db.query(
                      updateSql,
                      values,
                      () => {

                        db.query(
                          `
                          INSERT IGNORE INTO project_users
                          (
                            project_id,
                            user_id,
                            access_role
                          )
                          VALUES (?, ?, 'Manager')
                          `,
                          [
                            projectId,
                            userId
                          ]
                        );

                      }
                    );

                  } else {

                    if (
                      !managerPassword
                    ) {

                      return;

                    }


                    bcrypt.hash(
                      managerPassword,
                      10,
                      (hashErr, hash) => {

                        if (hashErr) {

                          console.error(
                            hashErr
                          );

                          return;

                        }


                        db.query(
                          `
                          INSERT INTO users
                          (
                            name,
                            role,
                            email,
                            mobile,
                            password
                          )
                          VALUES (?, 'Manager', ?, '', ?)
                          `,
                          [
                            managerName.trim(),
                            managerEmail.trim(),
                            hash
                          ],
                          (
                            createErr,
                            createResult
                          ) => {

                            if (createErr) {

                              console.error(
                                "Manager Create Error:",
                                createErr
                              );

                              return;

                            }


                            db.query(
                              `
                              INSERT IGNORE INTO project_users
                              (
                                project_id,
                                user_id,
                                access_role
                              )
                              VALUES (?, ?, 'Manager')
                              `,
                              [
                                projectId,
                                createResult.insertId
                              ]
                            );

                          }
                        );

                      }
                    );

                  }

                }
              );

            } catch (error) {

              console.error(
                "Manager Settings Error:",
                error
              );

            }

          }


          // =================================================
          // PROJECT MANAGER UPDATE / CREATE
          // =================================================

          if (
            projectManagerEmail &&
            projectManagerName
          ) {

            try {

              const pmPasswordHash =
                projectManagerPassword
                  ? await bcrypt.hash(
                    projectManagerPassword,
                    10
                  )
                  : null;


              db.query(
                `
                SELECT id
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [
                  projectManagerEmail.trim()
                ],
                (checkErr, users) => {

                  if (checkErr) {

                    console.error(
                      "Project Manager Check Error:",
                      checkErr
                    );

                    return;

                  }


                  if (
                    users.length > 0
                  ) {

                    const userId =
                      users[0].id;


                    const updateSql =
                      pmPasswordHash
                        ? `
                          UPDATE users
                          SET
                            name = ?,
                            email = ?,
                            role = 'Project Manager',
                            password = ?
                          WHERE id = ?
                        `
                        : `
                          UPDATE users
                          SET
                            name = ?,
                            email = ?,
                            role = 'Project Manager'
                          WHERE id = ?
                        `;


                    const values =
                      pmPasswordHash
                        ? [
                          projectManagerName.trim(),
                          projectManagerEmail.trim(),
                          pmPasswordHash,
                          userId
                        ]
                        : [
                          projectManagerName.trim(),
                          projectManagerEmail.trim(),
                          userId
                        ];


                    db.query(
                      updateSql,
                      values,
                      () => {

                        db.query(
                          `
                          INSERT IGNORE INTO project_users
                          (
                            project_id,
                            user_id,
                            access_role
                          )
                          VALUES (?, ?, 'Project Manager')
                          `,
                          [
                            projectId,
                            userId
                          ]
                        );

                      }
                    );

                  } else {

                    if (
                      !projectManagerPassword
                    ) {

                      return;

                    }


                    bcrypt.hash(
                      projectManagerPassword,
                      10,
                      (hashErr, hash) => {

                        if (hashErr) {

                          console.error(
                            hashErr
                          );

                          return;

                        }


                        db.query(
                          `
                          INSERT INTO users
                          (
                            name,
                            role,
                            email,
                            mobile,
                            password
                          )
                          VALUES (?, 'Project Manager', ?, '', ?)
                          `,
                          [
                            projectManagerName.trim(),
                            projectManagerEmail.trim(),
                            hash
                          ],
                          (
                            createErr,
                            createResult
                          ) => {

                            if (createErr) {

                              console.error(
                                "Project Manager Create Error:",
                                createErr
                              );

                              return;

                            }


                            db.query(
                              `
                              INSERT IGNORE INTO project_users
                              (
                                project_id,
                                user_id,
                                access_role
                              )
                              VALUES (?, ?, 'Project Manager')
                              `,
                              [
                                projectId,
                                createResult.insertId
                              ]
                            );

                          }
                        );

                      }
                    );

                  }

                }
              );

            } catch (error) {

              console.error(
                "Project Manager Settings Error:",
                error
              );

            }

          }


          return res.json({

            success: true,

            message:
              "Project settings updated successfully."

          });

        }
      );

    } catch (error) {

      console.error(
        "Project Settings Server Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error while updating project."

      });

    }

  }
);

// =====================================================
// PROJECT HISTORY
// =====================================================


// =====================================================
// GET PROJECT PUNCH HISTORY
// =====================================================

app.get(
  "/api/projects/:projectId/punch-history",
  (req, res) => {

    const projectId =
      req.params.projectId;

    const sql = `
      SELECT
        p.id,
        p.project_id,
        p.user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.role,
        p.punch_in,
          p.punch_in_distance_meters,
        p.punch_out,
           p.punch_out_distance_meters,
        p.created_at
      FROM punch_records p
      LEFT JOIN users u
        ON p.user_id = u.id
      WHERE p.project_id = ?
      ORDER BY p.id DESC
    `;

    db.query(
      sql,
      [projectId],
      (err, results) => {

        if (err) {

          console.error(
            "Punch History Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load punch history"
          });

        }

        return res.json({
          success: true,
          records: results
        });

      }
    );

  }
);


// =====================================================
// GET PROJECT STAFF ATTENDANCE
// =====================================================

app.get(
  "/api/projects/:projectId/staff-attendance",
  (req, res) => {

    const projectId =
      req.params.projectId;

    const sql = `
      SELECT
        id,
        project_id,
        staff_name,
        attendance_date,
        status,
        punch_in,
        punch_out,
        created_at
      FROM staff_attendance
      WHERE project_id = ?
      ORDER BY attendance_date DESC, id DESC
    `;

    db.query(
      sql,
      [projectId],
      (err, results) => {

        if (err) {

          console.error(
            "Staff Attendance Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load staff attendance"
          });

        }

        return res.json({
          success: true,
          records: results
        });

      }
    );

  }
);

// =====================================================
// GET PROJECT READINGS
// =====================================================

app.get(
  "/api/projects/:projectId/readings",
  (req, res) => {

    const projectId =
      req.params.projectId;

    const sql = `
      SELECT
        r.id,
        r.project_id,
        r.user_id,
        r.reading_type,
        r.meter_no,
        r.reading_value,
        r.reading_date,
        r.created_at,
        u.name AS user_name,
        u.email AS user_email
      FROM readings r
      LEFT JOIN users u
        ON u.id = r.user_id
      WHERE r.project_id = ?
      ORDER BY
        r.reading_date ASC,
        r.id ASC
    `;

    db.query(
      sql,
      [projectId],
      (err, rows) => {

        if (err) {

          console.error(
            "Get Project Readings Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load readings."
          });

        }


        // =========================================
        // METER-WISE CALCULATION
        // =========================================

        const previousByMeter = {};


        const calculatedRows =
          rows.map((reading) => {

            const meterKey =
              `${reading.reading_type}_${String(
                reading.meter_no || ""
              ).trim()}`;


            const currentReading =
              Number(
                reading.reading_value
              );


            const previousReading =
              previousByMeter[meterKey] !== undefined
                ? previousByMeter[meterKey]
                : null;


            const consumption =
              previousReading !== null
                ? currentReading - previousReading
                : 0;


            previousByMeter[meterKey] =
              currentReading;


            return {

              ...reading,

              current_reading:
                currentReading,

              previous_reading:
                previousReading,

              consumption:
                consumption

            };

          });


        // Newest reading first

        calculatedRows.reverse();


        return res.json({

          success: true,

          readings:
            calculatedRows

        });

      }
    );

  }
);

// =====================================================
// GET PROJECT TASKS
// =====================================================

app.get(
  "/api/projects/:projectId/tasks",
  (req, res) => {

    const projectId =
      req.params.projectId;

    const sql = `
      SELECT
        t.id,
        t.project_id,
        t.task_name,
        t.description,
        t.assigned_user_id,
        u.name AS assigned_user_name,
        u.email AS assigned_user_email,
        t.status,
        t.created_date,
        t.completed_date,
        t.created_at
      FROM tasks t
      LEFT JOIN users u
        ON t.assigned_user_id = u.id
      WHERE t.project_id = ?
      ORDER BY t.id DESC
    `;

    db.query(
      sql,
      [projectId],
      (err, results) => {

        if (err) {

          console.error(
            "Task History Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load task history"
          });

        }

        return res.json({
          success: true,
          records: results
        });

      }
    );

  }
);


// =====================================================
// GET COMPLETE PROJECT HISTORY
// =====================================================

app.get(
  "/api/projects/:projectId/history",
  (req, res) => {

    const projectId = req.params.projectId;

    const history = {
      punchRecords: [],
      staffAttendance: [],
      readings: [],
      tasks: []
    };

    // -----------------------------------------------
    // PUNCH
    // -----------------------------------------------

const punchSql = `
  SELECT
    p.id,
    p.project_id,
    p.user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.role,
    p.punch_in,
    p.punch_in_distance_meters,
    p.punch_out,
    p.punch_out_distance_meters,
    p.created_at
  FROM punch_records p
  LEFT JOIN users u
    ON p.user_id = u.id
  WHERE p.project_id = ?
  ORDER BY p.id DESC
`;

    db.query(
      punchSql,
      [projectId],
      (err, punchRows) => {

        if (err) {
          console.error(
            "History Punch Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message: "Failed to load punch history"
          });
        }

        history.punchRecords = punchRows;

        // -------------------------------------------
        // STAFF ATTENDANCE
        // -------------------------------------------

        const attendanceSql = `
          SELECT
            id,
            project_id,
            staff_name,
            attendance_date,
            status,
            punch_in,
            punch_out,
            created_at
          FROM staff_attendance
          WHERE project_id = ?
          ORDER BY attendance_date DESC, id DESC
        `;

        db.query(
          attendanceSql,
          [projectId],
          (err, attendanceRows) => {

            if (err) {
              console.error(
                "History Attendance Error:",
                err
              );

              return res.status(500).json({
                success: false,
                message:
                  "Failed to load attendance history"
              });
            }

            history.staffAttendance =
              attendanceRows;

            // -----------------------------------------
            // READINGS
            // -----------------------------------------

            const readingSql = `
              SELECT
                r.id,
                r.project_id,
                r.user_id,
                r.reading_type,
                r.meter_no,
                r.reading_value,
                r.reading_date,
                r.created_at,
                u.name AS user_name,
                u.email AS user_email
              FROM readings r
              LEFT JOIN users u
                ON u.id = r.user_id
              WHERE r.project_id = ?
              ORDER BY
                r.reading_date ASC,
                r.id ASC
            `;

            db.query(
              readingSql,
              [projectId],
              (err, readingRows) => {

                if (err) {
                  console.error(
                    "History Reading Error:",
                    err
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      "Failed to load reading history"
                  });
                }

                // -----------------------------------
                // METER-WISE CALCULATION
                // -----------------------------------

                const previousByMeter = {};

                const calculatedRows =
                  readingRows.map((reading) => {

                    const meterKey =
                      `${reading.reading_type}_${String(
                        reading.meter_no || ""
                      ).trim()}`;

                    const currentReading =
                      Number(
                        reading.reading_value
                      );

                    const previousReading =
                      previousByMeter[meterKey] !== undefined
                        ? previousByMeter[meterKey]
                        : null;

                    const consumption =
                      previousReading !== null
                        ? currentReading - previousReading
                        : 0;

                    previousByMeter[meterKey] =
                      currentReading;

                    return {
                      ...reading,

                      previous_reading:
                        previousReading,

                      current_reading:
                        currentReading,

                      consumption:
                        consumption
                    };

                  });

                // Newest first
                calculatedRows.reverse();

                history.readings =
                  calculatedRows;

                // -----------------------------------------
                // TASKS
                // -----------------------------------------

                const taskSql = `
                  SELECT
                    t.id,
                    t.project_id,
                    t.task_name,
                    t.description,
                    t.assigned_user_id,
                    u.name AS assigned_user_name,
                    u.email AS assigned_user_email,
                    t.status,
                    t.created_date,
                    t.completed_date,
                    t.created_at
                  FROM tasks t
                  LEFT JOIN users u
                    ON t.assigned_user_id = u.id
                  WHERE t.project_id = ?
                  ORDER BY t.id DESC
                `;

                db.query(
                  taskSql,
                  [projectId],
                  (err, taskRows) => {

                    if (err) {
                      console.error(
                        "History Task Error:",
                        err
                      );

                      return res.status(500).json({
                        success: false,
                        message:
                          "Failed to load task history"
                      });
                    }

                    history.tasks =
                      taskRows;

                    // ---------------------------------
                    // FINAL RESPONSE
                    // ---------------------------------

                    return res.json({
                      success: true,
                      projectId: projectId,
                      history: history
                    });

                  }
                );

              }
            );

          }
        );

      }
    );

  }
);

// =====================================================
// PUNCH IN
// =====================================================

app.post(
  "/api/punch/in",
  punchUpload.single("photo"),
  (req, res) => {

    const {
      user_id,
      project_id,
      latitude,
      longitude
    } = req.body;

    // -----------------------------------------------
    // REQUIRED DATA
    // -----------------------------------------------

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }

    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === "" ||
      longitude === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Location is required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required"
      });
    }

    // =================================================
    // CHECK SELECTED PROJECT ASSIGNMENT
    // =================================================

    const userSql = `
      SELECT
        u.id,
        u.name,
        u.location_name,
        u.latitude AS assigned_latitude,
        u.longitude AS assigned_longitude,
        u.radius,

        p.id AS project_id,
        p.name AS project_name

      FROM users u

      INNER JOIN project_users pu
        ON pu.user_id = u.id
        AND pu.project_id = ?

      INNER JOIN projects p
        ON p.id = pu.project_id

      WHERE u.id = ?

        AND LOWER(TRIM(p.status)) = 'active'

      LIMIT 1
    `;

    db.query(
      userSql,
      [
        project_id,
        user_id
      ],
      (userError, userRows) => {

        if (userError) {

          console.error(
            "Punch In User Error:",
            userError
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to verify project access"
          });

        }

        // -----------------------------------------------
        // PROJECT NOT ASSIGNED
        // -----------------------------------------------

        if (userRows.length === 0) {

          return res.status(403).json({
            success: false,
            message:
              "This project is not assigned to this user or project is not active."
          });

        }

        const user =
          userRows[0];

        // =================================================
        // CHECK ASSIGNED LOCATION
        // =================================================

        if (
          user.assigned_latitude === null ||
          user.assigned_longitude === null
        ) {

          return res.status(403).json({
            success: false,
            message:
              "Punch Location is not assigned by Admin."
          });

        }

        const currentLat =
          Number(latitude);

        const currentLng =
          Number(longitude);

        const assignedLat =
          Number(
            user.assigned_latitude
          );

        const assignedLng =
          Number(
            user.assigned_longitude
          );

        const allowedRadius =
          Number(
            user.radius || 100
          );

        // =================================================
        // HAVERSINE DISTANCE
        // =================================================

        const toRadians = (value) => {
          return value * Math.PI / 180;
        };

        const earthRadius =
          6371000;

        const latDifference =
          toRadians(
            assignedLat -
            currentLat
          );

        const lngDifference =
          toRadians(
            assignedLng -
            currentLng
          );

        const a =
          Math.sin(
            latDifference / 2
          ) *
          Math.sin(
            latDifference / 2
          ) +

          Math.cos(
            toRadians(currentLat)
          ) *

          Math.cos(
            toRadians(assignedLat)
          ) *

          Math.sin(
            lngDifference / 2
          ) *
          Math.sin(
            lngDifference / 2
          );

        const c =
          2 *
          Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
          );

        const distance =
          earthRadius * c;

        console.log(
          "Punch In Location Check:",
          {
            user_id,
            project_id,
            currentLat,
            currentLng,
            assignedLat,
            assignedLng,
            allowedRadius,
            distance
          }
        );

        // =================================================
        // OUTSIDE RADIUS
        // =================================================

        if (
          distance > allowedRadius
        ) {

          return res.status(403).json({
            success: false,
            message:
              `Punch In not allowed. You are ${Math.round(distance)} meters away from the assigned location. Allowed radius is ${allowedRadius} meters.`
          });

        }

        // =================================================
        // SAVE PUNCH IN
        // =================================================

        const photoPath =
          `/uploads/punch/${req.file.filename}`;

        const sql = `
          INSERT INTO punch_records
          (
            project_id,
            user_id,
            punch_in,
            latitude,
            longitude,
            photo,
            location_name,
            punch_in_distance_meters
          )
          VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            project_id,
            user_id,
            currentLat,
            currentLng,
            photoPath,
            user.location_name || null,
            Number(
              distance.toFixed(2)
            )
          ],
          (err, result) => {

            if (err) {

              console.error(
                "Punch In Error:",
                err
              );

              return res.status(500).json({
                success: false,
                message:
                  "Punch In failed"
              });

            }

            return res.json({

              success: true,

              message:
                "Punch In successful",

              punchId:
                result.insertId,

              projectId:
                Number(project_id),

              photo:
                photoPath

            });

          }
        );

      }
    );

  }
);


// =====================================================
// PUNCH OUT
// =====================================================

app.post(
  "/api/punch/out",
  punchUpload.single("photo"),
  (req, res) => {

    const {
      user_id,
      project_id,
      latitude,
      longitude
    } = req.body;

    // -----------------------------------------------
    // REQUIRED DATA
    // -----------------------------------------------

    if (!user_id) {

      return res.status(400).json({
        success: false,
        message:
          "User ID is required"
      });

    }

    if (!project_id) {

      return res.status(400).json({
        success: false,
        message:
          "Project ID is required"
      });

    }

    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === "" ||
      longitude === ""
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Location is required"
      });

    }

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message:
          "Photo is required"
      });

    }

    // =================================================
    // CHECK SELECTED PROJECT ASSIGNMENT
    // =================================================

    const userSql = `
      SELECT
        u.id,
        u.name,
        u.location_name,
        u.latitude AS assigned_latitude,
        u.longitude AS assigned_longitude,
        u.radius,

        p.id AS project_id,
        p.name AS project_name

      FROM users u

      INNER JOIN project_users pu
        ON pu.user_id = u.id
        AND pu.project_id = ?

      INNER JOIN projects p
        ON p.id = pu.project_id

      WHERE u.id = ?

        AND LOWER(TRIM(p.status)) = 'active'

      LIMIT 1
    `;

    db.query(
      userSql,
      [
        project_id,
        user_id
      ],
      (userError, userRows) => {

        if (userError) {

          console.error(
            "Punch Out User Error:",
            userError
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to verify project access"
          });

        }

        if (
          userRows.length === 0
        ) {

          return res.status(403).json({
            success: false,
            message:
              "This project is not assigned to this user or project is not active."
          });

        }

        const user =
          userRows[0];

        // =================================================
        // CHECK ASSIGNED LOCATION
        // =================================================

        if (
          user.assigned_latitude === null ||
          user.assigned_longitude === null
        ) {

          return res.status(403).json({
            success: false,
            message:
              "Punch Location is not assigned by Admin."
          });

        }

        const currentLat =
          Number(latitude);

        const currentLng =
          Number(longitude);

        const assignedLat =
          Number(
            user.assigned_latitude
          );

        const assignedLng =
          Number(
            user.assigned_longitude
          );

        const allowedRadius =
          Number(
            user.radius || 100
          );

        // =================================================
        // HAVERSINE DISTANCE
        // =================================================

        const toRadians = (value) => {
          return value * Math.PI / 180;
        };

        const earthRadius =
          6371000;

        const latDifference =
          toRadians(
            assignedLat -
            currentLat
          );

        const lngDifference =
          toRadians(
            assignedLng -
            currentLng
          );

        const a =
          Math.sin(
            latDifference / 2
          ) *
          Math.sin(
            latDifference / 2
          ) +

          Math.cos(
            toRadians(currentLat)
          ) *

          Math.cos(
            toRadians(assignedLat)
          ) *

          Math.sin(
            lngDifference / 2
          ) *
          Math.sin(
            lngDifference / 2
          );

        const c =
          2 *
          Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
          );

        const distance =
          earthRadius * c;

        console.log(
          "Punch Out Location Check:",
          {
            user_id,
            project_id,
            currentLat,
            currentLng,
            assignedLat,
            assignedLng,
            allowedRadius,
            distance
          }
        );

        // =================================================
        // OUTSIDE RADIUS
        // =================================================

        if (
          distance > allowedRadius
        ) {

          return res.status(403).json({
            success: false,
            message:
              `Punch Out not allowed. You are ${Math.round(distance)} meters away from the assigned location. Allowed radius is ${allowedRadius} meters.`
          });

        }

        // =================================================
        // FIND OPEN PUNCH IN
        // SAME USER + SAME PROJECT
        // =================================================

        const findPunchSql = `
          SELECT
            id,
            project_id
          FROM punch_records
          WHERE user_id = ?
            AND project_id = ?
            AND punch_out IS NULL
          ORDER BY id DESC
          LIMIT 1
        `;

        db.query(
          findPunchSql,
          [
            user_id,
            project_id
          ],
          (findError, punchRows) => {

            if (findError) {

              console.error(
                "Find Punch Error:",
                findError
              );

              return res.status(500).json({
                success: false,
                message:
                  "Failed to find Punch In record"
              });

            }

            if (
              punchRows.length === 0
            ) {

              return res.status(404).json({
                success: false,
                message:
                  "No active Punch In record found for this project."
              });

            }

            const punchId =
              punchRows[0].id;

            const photoPath =
              `/uploads/punch/${req.file.filename}`;

            // =================================================
            // UPDATE PUNCH OUT
            // =================================================

            const updateSql = `
              UPDATE punch_records
              SET
                punch_out = NOW(),
                punch_out_latitude = ?,
                punch_out_longitude = ?,
                punch_out_photo = ?,
                punch_out_distance_meters = ?
              WHERE id = ?
                AND project_id = ?
                AND user_id = ?
                AND punch_out IS NULL
            `;

            db.query(
              updateSql,
              [
                currentLat,
                currentLng,
                photoPath,
                Number(
                  distance.toFixed(2)
                ),
                punchId,
                project_id,
                user_id
              ],
              (err, result) => {

                if (err) {

                  console.error(
                    "Punch Out Error:",
                    err
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      "Punch Out failed"
                  });

                }

                if (
                  result.affectedRows === 0
                ) {

                  return res.status(404).json({
                    success: false,
                    message:
                      "Punch record not found or already punched out"
                  });

                }

                return res.json({

                  success: true,

                  message:
                    "Punch Out successful",

                  punchId:
                    punchId,

                  projectId:
                    Number(project_id),

                  photo:
                    photoPath

                });

              }
            );

          }
        );

      }
    );

  }
);


// =====================================================
// ADD STAFF ATTENDANCE
// =====================================================

app.post(
  "/api/staff-attendance",
  (req, res) => {

    const {
      project_id,
      staff_name,
      attendance_date,
      status,
      punch_in,
      punch_out
    } = req.body;

    if (
      !project_id ||
      !staff_name ||
      !attendance_date ||
      !status
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Required attendance fields are missing"
      });

    }

    const sql = `
      INSERT INTO staff_attendance
      (
        project_id,
        staff_name,
        attendance_date,
        status,
        punch_in,
        punch_out
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        project_id,
        staff_name,
        attendance_date,
        status,
        punch_in || null,
        punch_out || null
      ],
      (err, result) => {

        if (err) {

          console.error(
            "Staff Attendance Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Attendance save failed"
          });

        }

        return res.json({
          success: true,
          message:
            "Attendance saved successfully",
          attendanceId:
            result.insertId
        });

      }
    );

  }
);



// =====================================================
// ADD TASK
// =====================================================

app.post(
  "/api/tasks",
  (req, res) => {

    const {
      project_id,
      task_name,
      description,
      assigned_user_id,
      status,
      created_date,
      completed_date
    } = req.body;

    if (
      !project_id ||
      !task_name ||
      !created_date
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Project ID, Task Name and Created Date are required"
      });

    }

    const sql = `
      INSERT INTO tasks
      (
        project_id,
        task_name,
        description,
        assigned_user_id,
        status,
        created_date,
        completed_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        project_id,
        task_name,
        description || null,
        assigned_user_id || null,
        status || "Pending",
        created_date,
        completed_date || null
      ],
      (err, result) => {

        if (err) {

          console.error(
            "Task Save Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Task save failed"
          });

        }

        return res.json({
          success: true,
          message:
            "Task created successfully",
          taskId:
            result.insertId
        });

      }
    );

  }
);


// =====================================================
// UPDATE TASK STATUS
// =====================================================

app.put(
  "/api/tasks/:id",
  (req, res) => {

    const taskId =
      req.params.id;

    const {
      status,
      completed_date
    } = req.body;

    const sql = `
      UPDATE tasks
      SET
        status = ?,
        completed_date = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        status,
        completed_date || null,
        taskId
      ],
      (err) => {

        if (err) {

          console.error(
            "Task Update Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Task update failed"
          });

        }

        return res.json({
          success: true,
          message:
            "Task updated successfully"
        });

      }
    );

  }
);

// =====================================================
// USER ASSIGNED PROJECTS
// =====================================================

app.get(
  "/api/users/:userId/projects",
  (req, res) => {

    const userId =
      req.params.userId;

    const sql = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.location,
        p.status,
        pu.access_role
      FROM project_users pu

      INNER JOIN projects p
        ON p.id = pu.project_id

      INNER JOIN users u
        ON u.id = pu.user_id

      WHERE
        pu.user_id = ?
        AND pu.access_role = 'Project Manager'

      ORDER BY p.id DESC
    `;

    db.query(
      sql,
      [userId],
      (err, rows) => {

        if (err) {

          console.error(
            "Assigned Projects Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to load assigned projects."
          });

        }

        console.log(
          `Projects assigned to Project Manager ${userId}:`,
          rows
        );

        return res.json({
          success: true,
          projects: rows
        });

      }
    );

  }
);

// =====================================================
// CREATE READING
// =====================================================

app.post(
  "/api/readings",
  (req, res) => {

    const {
      project_id,
      user_id,
      reading_type,
      reading_value,
      reading_date,
      meter_no
    } = req.body;


    // -----------------------------------------------
    // REQUIRED DATA
    // -----------------------------------------------

    if (
      !project_id ||
      !user_id ||
      !reading_type ||
      reading_value === undefined ||
      !reading_date
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Project, User, Reading Type, Value and Date are required."
      });

    }


    const currentReading =
      Number(reading_value);


    if (isNaN(currentReading)) {

      return res.status(400).json({
        success: false,
        message:
          "Reading value must be a valid number."
      });

    }


    // -----------------------------------------------
    // ELECTRICITY NEEDS METER NO.
    // -----------------------------------------------

    if (
      reading_type === "Electricity Reading" &&
      (!meter_no || meter_no.trim() === "")
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Meter No. is required for Electricity Reading."
      });

    }


    const cleanMeterNo =
      meter_no
        ? meter_no.trim()
        : null;


    // -----------------------------------------------
    // CHECK USER IS ASSIGNED TO PROJECT
    // -----------------------------------------------

    const accessSql = `
      SELECT id
      FROM project_users
      WHERE project_id = ?
        AND user_id = ?
      LIMIT 1
    `;


    db.query(
      accessSql,
      [
        project_id,
        user_id
      ],
      (accessErr, accessRows) => {

        if (accessErr) {

          console.error(
            "Reading Access Error:",
            accessErr
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to verify project access."
          });

        }


        if (
          accessRows.length === 0
        ) {

          return res.status(403).json({
            success: false,
            message:
              "This user is not assigned to this project."
          });

        }


        // -------------------------------------------
        // GET PREVIOUS READING
        // SAME PROJECT + TYPE + METER
        // -------------------------------------------

        const previousSql = `
          SELECT
            id,
            reading_value,
            reading_date
          FROM readings
          WHERE project_id = ?
            AND reading_type = ?
            AND (
              meter_no = ?
              OR (
                meter_no IS NULL
                AND ? IS NULL
              )
            )
          ORDER BY
            reading_date DESC,
            id DESC
          LIMIT 1
        `;


        db.query(
          previousSql,
          [
            project_id,
            reading_type,
            cleanMeterNo,
            cleanMeterNo
          ],
          (previousErr, previousRows) => {

            if (previousErr) {

              console.error(
                "Previous Reading Error:",
                previousErr
              );

              return res.status(500).json({
                success: false,
                message:
                  "Failed to get previous reading."
              });

            }


            // ---------------------------------------
            // PREVIOUS READING
            // ---------------------------------------

            const previousReading =
              previousRows.length > 0
                ? Number(
                  previousRows[0].reading_value
                )
                : null;


            // ---------------------------------------
            // ELECTRICITY VALIDATION
            // ---------------------------------------

            if (
              reading_type === "Electricity Reading" &&
              previousReading !== null &&
              currentReading <= previousReading
            ) {

              return res.status(400).json({
                success: false,
                message:
                  `Invalid Electricity Reading. Today's reading must be greater than previous reading (${previousReading} kWh).`
              });

            }


            // ---------------------------------------
            // WATER / DIESEL VALIDATION
            // ---------------------------------------

            if (
              reading_type !== "Electricity Reading" &&
              previousReading !== null &&
              currentReading < previousReading
            ) {

              return res.status(400).json({
                success: false,
                message:
                  `Current reading cannot be less than previous reading (${previousReading}).`
              });

            }


            // ---------------------------------------
            // CHECK SAME METER TODAY
            // ELECTRICITY ONLY
            // ---------------------------------------

            if (
              reading_type === "Electricity Reading"
            ) {

              const todaySql = `
                SELECT
                  id
                FROM readings
                WHERE project_id = ?
                  AND reading_type = 'Electricity Reading'
                  AND reading_date = ?
                  AND meter_no = ?
                LIMIT 1
              `;


              db.query(
                todaySql,
                [
                  project_id,
                  reading_date,
                  cleanMeterNo
                ],
                (todayErr, todayRows) => {

                  if (todayErr) {

                    console.error(
                      "Today's Electricity Check Error:",
                      todayErr
                    );

                    return res.status(500).json({
                      success: false,
                      message:
                        "Failed to check today's electricity reading."
                    });

                  }


                  if (
                    todayRows.length > 0
                  ) {

                    return res.status(400).json({
                      success: false,
                      message:
                        `Today's Electricity Reading for Meter ${cleanMeterNo} is already submitted.`
                    });

                  }


                  saveReading();

                }
              );

            } else {

              saveReading();

            }


            // ---------------------------------------
            // SAVE READING
            // ---------------------------------------

            function saveReading() {

              const consumption =
                previousReading === null
                  ? 0
                  : currentReading - previousReading;


              const insertSql = `
                INSERT INTO readings
                (
                  project_id,
                  user_id,
                  reading_type,
                  meter_no,
                  reading_value,
                  reading_date
                )
                VALUES (?, ?, ?, ?, ?, ?)
              `;


              db.query(
                insertSql,
                [
                  project_id,
                  user_id,
                  reading_type,
                  cleanMeterNo,
                  currentReading,
                  reading_date
                ],
                (insertErr, result) => {

                  if (insertErr) {

                    console.error(
                      "Insert Reading Error:",
                      insertErr
                    );

                    return res.status(500).json({
                      success: false,
                      message:
                        "Failed to save reading."
                    });

                  }


                  return res.json({

                    success: true,

                    message:
                      "Reading saved successfully.",

                    reading: {

                      id:
                        result.insertId,

                      project_id,

                      user_id,

                      reading_type,

                      meter_no:
                        cleanMeterNo,

                      reading_value:
                        currentReading,

                      previous_reading:
                        previousReading,

                      consumption,

                      reading_date

                    }

                  });

                }
              );

            }

          }
        );

      }
    );

  }
);



// =====================================================
// DELETE PROJECT
// =====================================================

app.delete("/api/projects/:projectId", (req, res) => {
  const projectId = parseInt(req.params.projectId);

  console.log("DELETE PROJECT REQUEST:", projectId);

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Invalid project ID"
    });
  }

  db.query(
    "DELETE FROM project_users WHERE project_id = ?",
    [projectId],
    (err) => {

      if (err) {
        console.error("project_users delete error:", err);

        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      db.query(
        "DELETE FROM projects WHERE id = ?",
        [projectId],
        (err, result) => {

          if (err) {
            console.error("projects delete error:", err);

            return res.status(500).json({
              success: false,
              message: err.message
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Project not found"
            });
          }

          console.log(
            "PROJECT DELETED:",
            projectId
          );

          return res.json({
            success: true,
            message: "Project deleted successfully"
          });

        }
      );
    }
  );
});
// =====================================================
// TEST SERVER
// =====================================================

app.get("/", (req, res) => {

  res.json({
    message:
      "Society Management Backend is running!"
  });

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

