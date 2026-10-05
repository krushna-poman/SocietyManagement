import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

const API_URL =
  `${window.location.protocol}//${window.location.hostname}:5000/api/projects`;

function Project({
  projects,
  setProjects,
  onBack,
}) {


  // =====================================================
  // PROJECT STATES
  // =====================================================

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [projectName, setProjectName] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [status, setStatus] =
    useState("active");


  // =====================================================
  // ACCESS STATES
  // =====================================================

  const [projectManagerName, setProjectManagerName] =
    useState("");

  const [projectManagerEmail, setProjectManagerEmail] =
    useState("");

  const [projectManagerPassword, setProjectManagerPassword] =
    useState("");

  const [managerName, setManagerName] =
    useState("");

  const [managerEmail, setManagerEmail] =
    useState("");

  const [managerPassword, setManagerPassword] =
    useState("");


  // =====================================================
  // HISTORY
  // =====================================================

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [statusMenuOpen, setStatusMenuOpen] =
    useState(null);

  const [showHistory, setShowHistory] =
    useState(false);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [historyError, setHistoryError] =
    useState("");

  const [history, setHistory] = useState({
    punchRecords: [],
    staffAttendance: [],
    readings: [],
    tasks: [],
  });


  // =====================================================
  // SORT PROJECTS BY NUMBER
  // =====================================================

  const sortedProjects = [...projects].sort((a, b) => {
    const numA = parseInt(
      String(a.name || "").match(/^\s*(\d+)/)?.[1] || "999999",
      10
    );

    const numB = parseInt(
      String(b.name || "").match(/^\s*(\d+)/)?.[1] || "999999",
      10
    );

    return numA - numB;
  });


  // =====================================================
  // HISTORY PAGINATION
  // =====================================================

  const recordsPerPage = 10;

  const [punchPage, setPunchPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const [readingPage, setReadingPage] = useState(1);

  const [historyTab, setHistoryTab] =
    useState("history");

  const scrollToHistorySection = (section) => {

    setHistoryTab(section);

    const element =
      document.getElementById(
        `history-${section}`
      );

    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }

  };


  // =====================================================
  // REPORT STATES
  // =====================================================

  const [reportType, setReportType] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [reportUser, setReportUser] =
    useState("all");

  const [reportStaff, setReportStaff] =
    useState("all");

  const [reportStatus, setReportStatus] =
    useState("all");

  const [reportReadingType, setReportReadingType] =
    useState("all");

  const [reportAssignedUser, setReportAssignedUser] =
    useState("all");


  // =====================================================
  // REPORT PREVIEW
  // =====================================================

  const [showReportPreview, setShowReportPreview] =
    useState(false);

  const [previewData, setPreviewData] =
    useState([]);


  // =====================================================
  // SETTINGS
  // =====================================================

  const [showSettings, setShowSettings] =
    useState(false);

  const [settingsName, setSettingsName] =
    useState("");

  const [settingsLocation, setSettingsLocation] =
    useState("");

  const [settingsStatus, setSettingsStatus] =
    useState("active");

  const [settingsManagerName, setSettingsManagerName] =
    useState("");

  const [settingsManagerEmail, setSettingsManagerEmail] =
    useState("");

  const [settingsManagerPassword, setSettingsManagerPassword] =
    useState("");

  const [settingsPMName, setSettingsPMName] =
    useState("");

  const [settingsPMEmail, setSettingsPMEmail] =
    useState("");

  const [settingsPMPassword, setSettingsPMPassword] =
    useState("");

  const [savingSettings, setSavingSettings] =
    useState(false);


  // =====================================================
  // LOAD PROJECTS
  // =====================================================

  useEffect(() => {

    const loadProjects = async () => {

      try {

        const response =
          await fetch(API_URL);

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {

          setProjects(
            data.projects || []
          );

        }

      } catch (error) {

        console.error(
          "Load Projects Error:",
          error
        );

      }

    };

    loadProjects();

  }, [API_URL, setProjects]);


  // =====================================================
  // RESET CREATE FORM
  // =====================================================

  const resetCreateForm = () => {

    setProjectName("");
    setLocation("");
    setStatus("active");

    setProjectManagerName("");
    setProjectManagerEmail("");
    setProjectManagerPassword("");

    setManagerName("");
    setManagerEmail("");
    setManagerPassword("");

  };


  // =====================================================
  // CREATE PROJECT
  // =====================================================

  const handleCreateProject = async () => {

    if (
      !projectName.trim() ||
      !location.trim() ||
      !status
    ) {

      alert(
        "Project Name, Location and Status are required."
      );

      return;

    }


    const pmStarted =
      projectManagerName.trim() ||
      projectManagerEmail.trim() ||
      projectManagerPassword.trim();

    if (pmStarted) {

      if (
        !projectManagerName.trim() ||
        !projectManagerEmail.trim() ||
        !projectManagerPassword.trim()
      ) {

        alert(
          "Project Manager साठी Name, Email आणि Password तिन्ही भरा."
        );

        return;

      }

    }


    const managerStarted =
      managerName.trim() ||
      managerEmail.trim() ||
      managerPassword.trim();

    if (managerStarted) {

      if (
        !managerName.trim() ||
        !managerEmail.trim() ||
        !managerPassword.trim()
      ) {

        alert(
          "Manager साठी Name, Email आणि Password तिन्ही भरा."
        );

        return;

      }

    }


    try {

      const response =
        await fetch(API_URL, {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            name:
              projectName.trim(),

            location:
              location.trim(),

            status,

            projectManagerName:
              projectManagerName.trim(),

            projectManagerEmail:
              projectManagerEmail.trim(),

            projectManagerPassword,

            managerName:
              managerName.trim(),

            managerEmail:
              managerEmail.trim(),

            managerPassword,

          }),

        });


      const data =
        await response.json();


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Project creation failed."
        );

      }


      const projectsResponse =
        await fetch(API_URL);

      const projectsData =
        await projectsResponse.json();


      if (
        projectsResponse.ok &&
        projectsData.success
      ) {

        setProjects(
          projectsData.projects || []
        );

      }


      setShowCreateForm(false);

      resetCreateForm();

      alert(
        "Project created successfully."
      );

    } catch (error) {

      console.error(
        "Create Project Error:",
        error
      );

      alert(
        error.message ||
        "Project creation failed."
      );

    }

  };


  // =====================================================
  // OPEN PROJECT HISTORY
  // =====================================================

  const openProjectHistory = async (project) => {


    // PAGE TOP ला घेऊन जा
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    setSelectedProject(project);

    setShowHistory(true);

    setLoadingHistory(true);

    setPunchPage(1);
    setStaffPage(1);
    setReadingPage(1);

    setHistoryError("");

    setHistory({
      punchRecords: [],
      staffAttendance: [],
      readings: [],
      tasks: [],
    });


    // Reset report

    setReportType("");
    setFromDate("");
    setToDate("");
    setReportUser("all");
    setReportStaff("all");
    setReportStatus("all");
    setReportReadingType("all");
    setReportAssignedUser("all");


    try {

      const response =
        await fetch(
          `${API_URL}/${project.id}/history`
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Failed to load project history."
        );

      }


      setHistory(
        data.history || {
          punchRecords: [],
          staffAttendance: [],
          readings: [],
          tasks: [],
        }
      );

    } catch (error) {

      console.error(
        "Project History Error:",
        error
      );

      setHistoryError(
        error.message ||
        "Failed to load project history."
      );

    } finally {

      setLoadingHistory(false);

    }

  };


  // =====================================================
  // CLOSE HISTORY
  // =====================================================

  const closeHistory = () => {

    setShowHistory(false);

    setSelectedProject(null);

    setShowReportPreview(false);

  };

  // =====================================================
  // CHANGE PROJECT STATUS
  // =====================================================

  const handleProjectStatusChange = async (
    project,
    newStatus
  ) => {

    try {

      setStatusMenuOpen(null);

      const response =
        await fetch(
          `${API_URL}/${project.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name: project.name,
              location: project.location,
              status: newStatus,
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
          "Status update failed."
        );
      }

      setProjects((prevProjects) =>
        prevProjects.map((item) =>
          Number(item.id) === Number(project.id)
            ? {
              ...item,
              status: newStatus,
            }
            : item
        )
      );

      if (
        selectedProject &&
        Number(selectedProject.id) === Number(project.id)
      ) {
        setSelectedProject((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }

    } catch (error) {

      console.error(
        "Project Status Error:",
        error
      );

      alert(
        error.message ||
        "Project status update failed."
      );

    }

  };

  // =====================================================
  // OPEN SETTINGS
  // =====================================================

  const openSettings = () => {

    if (!selectedProject) {
      return;
    }

    setSettingsName(
      selectedProject.name || ""
    );

    setSettingsLocation(
      selectedProject.location || ""
    );

    setSettingsStatus(
      selectedProject.status || "active"
    );

    setSettingsManagerName("");
    setSettingsManagerEmail("");
    setSettingsManagerPassword("");

    setSettingsPMName("");
    setSettingsPMEmail("");
    setSettingsPMPassword("");

    setShowSettings(true);

  };


  // =====================================================
  // DELETE PROJECT
  // =====================================================

  const handleDeleteProject = async () => {
    if (!selectedProject?.id) {
      alert("Project ID not found.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${selectedProject.name}" project?`
    );

    if (!confirmDelete) return;

    try {
      const API_URL =
        `${window.location.protocol}//${window.location.hostname}:5000/api/projects/${selectedProject.id}`;

      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error("Delete API returned:", text);

        throw new Error(
          "Backend API response मिळाला नाही. Backend server check करा."
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Project delete failed."
        );
      }

      // Remove project from screen
      setProjects((prevProjects) =>
        prevProjects.filter(
          (project) =>
            Number(project.id) !== Number(selectedProject.id)
        )
      );

      // Close settings
      setShowSettings(false);
      setSelectedProject(null);
      setStatusMenuOpen(null);

      alert("Project deleted successfully.");

    } catch (error) {
      console.error("Delete Project Error:", error);

      alert(
        error.message ||
        "Project delete failed."
      );
    }
  };


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  const handleSaveSettings = async () => {

    if (
      !settingsName.trim() ||
      !settingsLocation.trim()
    ) {

      alert(
        "Project Name and Location are required."
      );

      return;

    }


    try {

      setSavingSettings(true);


      const response =
        await fetch(
          `${API_URL}/${selectedProject.id}`,
          {

            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({

              name:
                settingsName.trim(),

              location:
                settingsLocation.trim(),

              status:
                settingsStatus,

              managerName:
                settingsManagerName.trim(),

              managerEmail:
                settingsManagerEmail.trim(),

              managerPassword:
                settingsManagerPassword,

              projectManagerName:
                settingsPMName.trim(),

              projectManagerEmail:
                settingsPMEmail.trim(),

              projectManagerPassword:
                settingsPMPassword,

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
          "Failed to update project."
        );

      }


      const updatedProject = {

        ...selectedProject,

        name:
          settingsName.trim(),

        location:
          settingsLocation.trim(),

        status:
          settingsStatus,

      };


      setSelectedProject(
        updatedProject
      );


      setProjects(
        projects.map((item) =>
          item.id === selectedProject.id
            ? updatedProject
            : item
        )
      );


      setShowSettings(false);


      alert(
        "Project settings updated successfully."
      );

    } catch (error) {

      console.error(
        "Settings Update Error:",
        error
      );

      alert(
        error.message ||
        "Failed to update settings."
      );

    } finally {

      setSavingSettings(false);

    }

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatTime = (value) => {

    if (!value) {
      return "-";
    }

    try {

      return new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    } catch {

      return value;

    }

  };


  const formatDate = (value) => {

    if (!value) {
      return "-";
    }

    try {

      return new Date(value)
        .toLocaleDateString();

    } catch {

      return value;

    }

  };


  // =====================================================
  // WORKING HOURS
  // =====================================================

  const getWorkingHours = (
    punchIn,
    punchOut
  ) => {

    if (!punchIn || !punchOut) {
      return "-";
    }

    const start =
      new Date(punchIn);

    const end =
      new Date(punchOut);

    const difference =
      end - start;

    if (difference <= 0) {
      return "-";
    }

    const totalMinutes =
      Math.floor(
        difference / 60000
      );

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    return `${hours}h ${minutes}m`;

  };


  // =====================================================
  // DATE RANGE CHECK
  // =====================================================

  const isDateInRange = (value) => {

    if (!value) {
      return true;
    }

    const date =
      new Date(value);

    date.setHours(
      0,
      0,
      0,
      0
    );


    if (fromDate) {

      const from =
        new Date(fromDate);

      from.setHours(
        0,
        0,
        0,
        0
      );

      if (date < from) {
        return false;
      }

    }


    if (toDate) {

      const to =
        new Date(toDate);

      to.setHours(
        23,
        59,
        59,
        999
      );

      if (date > to) {
        return false;
      }

    }

    return true;

  };


  // =====================================================
  // REPORT USERS
  // =====================================================

  const reportUsers =
    useMemo(() => {

      const users = [];

      history.punchRecords.forEach(
        (item) => {

          if (
            item.user_id &&
            !users.some(
              (user) =>
                user.id === item.user_id
            )
          ) {

            users.push({
              id: item.user_id,
              name:
                item.user_name ||
                "Unknown",
            });

          }

        }
      );


      history.readings.forEach(
        (item) => {

          if (
            item.user_id &&
            !users.some(
              (user) =>
                user.id === item.user_id
            )
          ) {

            users.push({
              id: item.user_id,
              name:
                item.user_name ||
                "Unknown",
            });

          }

        }
      );


      history.tasks.forEach(
        (item) => {

          if (
            item.assigned_user_id &&
            !users.some(
              (user) =>
                user.id ===
                item.assigned_user_id
            )
          ) {

            users.push({
              id:
                item.assigned_user_id,
              name:
                item.assigned_user_name ||
                "Unknown",
            });

          }

        }
      );


      return users;

    }, [history]);


  // =====================================================
  // STAFF LIST
  // =====================================================

  const staffList =
    useMemo(() => {

      return [
        ...new Set(
          history.staffAttendance
            .map(
              (item) =>
                item.staff_name
            )
            .filter(Boolean)
        ),
      ];

    }, [history]);


  // =====================================================
  // READING TYPES
  // =====================================================

  const readingTypes =
    useMemo(() => {

      return [
        ...new Set(
          history.readings
            .map(
              (item) =>
                item.reading_type
            )
            .filter(Boolean)
        ),
      ];

    }, [history]);


  // =====================================================
  // REPORT DATA
  // =====================================================

  const getReportData = () => {

    if (!reportType) {
      return [];
    }


    // -----------------------------------------------
    // PUNCH REPORT
    // -----------------------------------------------

    if (
      reportType ===
      "punch"
    ) {

      return history.punchRecords
        .filter(
          (item) => {

            if (
              !isDateInRange(
                item.punch_in
              )
            ) {
              return false;
            }


            if (
              reportUser !==
              "all" &&
              String(item.user_id) !==
              String(reportUser)
            ) {

              return false;

            }

            return true;

          }
        );

    }


    // -----------------------------------------------
    // STAFF ATTENDANCE
    // -----------------------------------------------

    if (
      reportType ===
      "attendance"
    ) {

      return history.staffAttendance
        .filter(
          (item) => {

            if (
              !isDateInRange(
                item.attendance_date
              )
            ) {
              return false;
            }


            if (
              reportStaff !==
              "all" &&
              item.staff_name !==
              reportStaff
            ) {

              return false;

            }


            if (
              reportStatus !==
              "all" &&
              item.status !==
              reportStatus
            ) {

              return false;

            }

            return true;

          }
        );

    }


    // -----------------------------------------------
    // READING
    // -----------------------------------------------

    if (
      reportType ===
      "reading"
    ) {

      return history.readings
        .filter(
          (item) => {

            if (
              !isDateInRange(
                item.reading_date
              )
            ) {
              return false;
            }


            if (
              reportReadingType !==
              "all" &&
              item.reading_type !==
              reportReadingType
            ) {

              return false;

            }

            return true;

          }
        );

    }


    // -----------------------------------------------
    // TASKS
    // -----------------------------------------------

    if (
      reportType ===
      "tasks"
    ) {

      return history.tasks
        .filter(
          (item) => {

            if (
              !isDateInRange(
                item.created_date
              )
            ) {
              return false;
            }


            if (
              reportAssignedUser !==
              "all" &&
              String(
                item.assigned_user_id
              ) !==
              String(
                reportAssignedUser
              )
            ) {

              return false;

            }


            if (
              reportStatus !==
              "all" &&
              item.status !==
              reportStatus
            ) {

              return false;

            }

            return true;

          }
        );

    }


    return [];

  };


  // =====================================================
  // PAGINATION DATA
  // =====================================================

  const punchTotalPages =
    Math.ceil(
      history.punchRecords.length / recordsPerPage
    );

  const staffTotalPages =
    Math.ceil(
      history.staffAttendance.length / recordsPerPage
    );

  const readingTotalPages =
    Math.ceil(
      history.readings.length / recordsPerPage
    );

  const currentPunchRecords =
    history.punchRecords.slice(
      (punchPage - 1) * recordsPerPage,
      punchPage * recordsPerPage
    );

  const currentStaffAttendance =
    history.staffAttendance.slice(
      (staffPage - 1) * recordsPerPage,
      staffPage * recordsPerPage
    );

  const currentReadings =
    history.readings.slice(
      (readingPage - 1) * recordsPerPage,
      readingPage * recordsPerPage
    );

  // =====================================================
  // VIEW REPORT
  // =====================================================

  const handleViewReport = () => {

    if (!reportType) {

      alert(
        "Please select a report."
      );

      return;

    }


    if (
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {

      alert(
        "From Date cannot be greater than To Date."
      );

      return;

    }


    const data =
      getReportData();


    setPreviewData(
      data
    );

    setShowReportPreview(
      true
    );

  };


  // =====================================================
  // REPORT TITLE
  // =====================================================

  const getReportTitle = () => {

    if (
      reportType ===
      "punch"
    ) {

      return "Punch In / Punch Out Report";

    }

    if (
      reportType ===
      "attendance"
    ) {

      return "Staff Attendance Report";

    }

    if (
      reportType ===
      "reading"
    ) {

      return "Reading History Report";

    }

    if (
      reportType ===
      "tasks"
    ) {

      return "Task Report";

    }

    return "Project Report";

  };


  const handleDownloadReport = () => {

    if (!reportType) {
      alert("Please select a report.");
      return;
    }

    if (fromDate && toDate && fromDate > toDate) {
      alert("From Date cannot be greater than To Date.");
      return;
    }

    const data =
      previewData.length
        ? previewData
        : getReportData();

    let headers = [];
    let rows = [];

    if (reportType === "punch") {

      headers = [
        "Sr",
        "User",
        "Role",
        "Email",
        "Date",
        "Punch In",
        "In Distance",
        "Punch Out",
        "Out Distance",
        "Working Hours",
      ];

      rows = data.map((item, index) => [
        index + 1,
        item.user_name || "-",
        item.role || "-",
        item.user_email || "-",
        formatDate(item.punch_in),
        formatTime(item.punch_in),

        item.punch_in_distance_meters !== null &&
          item.punch_in_distance_meters !== undefined
          ? `${item.punch_in_distance_meters} m`
          : "-",

        formatTime(item.punch_out),

        item.punch_out_distance_meters !== null &&
          item.punch_out_distance_meters !== undefined
          ? `${item.punch_out_distance_meters} m`
          : "-",

        getWorkingHours(
          item.punch_in,
          item.punch_out
        ),
      ]);

    }

    if (reportType === "attendance") {

      headers = [
        "Sr",
        "Staff Name",
        "Date",
        "Status",
        "Punch In",
        "Punch Out",
      ];

      rows = data.map((item, index) => [
        index + 1,
        item.staff_name || "-",
        formatDate(item.attendance_date),
        item.status || "-",
        item.punch_in || "-",
        item.punch_out || "-",
      ]);

    }

    if (reportType === "reading") {

      headers = [
        "Sr",
        "Reading Type",
        "Meter No.",
        "Previous Reading",
        "Current Reading",
        "Consumption",
        "Date",
        "Entered By",
        "Email",
      ];

      rows = data.map((item, index) => [
        index + 1,
        item.reading_type || "-",
        item.meter_no || "-",
        item.previous_reading ?? "-",
        item.current_reading ?? item.reading_value ?? "-",
        item.consumption ?? "-",
        formatDate(item.reading_date),
        item.user_name || "-",
        item.user_email || "-",
      ]);

    }

    if (reportType === "tasks") {

      headers = [
        "Sr",
        "Task",
        "Description",
        "Assigned To",
        "Status",
        "Created",
        "Completed",
      ];

      rows = data.map((item, index) => [
        index + 1,
        item.task_name || "-",
        item.description || "-",
        item.assigned_user_name || "-",
        item.status || "-",
        formatDate(item.created_date),
        formatDate(item.completed_date),
      ]);

    }

    const excelData = [
      [
        selectedProject?.name || "Project"
      ],

      [
        selectedProject?.location || ""
      ],

      [
        getReportTitle()
      ],

      [
        `From Date: ${fromDate || "All"}`
      ],

      [
        `To Date: ${toDate || "All"}`
      ],

      [],

      headers,

      ...rows,
    ];

    const worksheet =
      XLSX.utils.aoa_to_sheet(
        excelData
      );

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Report"
    );

    const projectName =
      selectedProject?.name || "Project";

    const reportName =
      getReportTitle()
        .replace(
          /[^a-zA-Z0-9]+/g,
          "_"
        );

    const fileName =
      `${projectName}_${reportName}.xlsx`;

    XLSX.writeFile(
      workbook,
      fileName
    );
  };

  // =====================================================
  // PROJECT HISTORY PAGE
  // =====================================================

  if (
    showHistory &&
    selectedProject
  ) {

    return (

      <div
        className="container-fluid py-4"
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          minHeight: "100%",
          height: "auto",
          overflowX: "auto",
          overflowY: "visible",
          paddingBottom: "60px",
        }}
      >

        {/* =================================================
    PROJECT HISTORY HEADER
================================================= */}

        <div
          id="history-history"
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "18px",
            position: "relative",
            scrollMarginTop: "85px",
          }}
        >


        </div>

        {/* =================================================
    HISTORY NAVBAR
================================================= */}



        <div
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "14px",
            position: "sticky",
            top: "10px",
            zIndex: 100,
            background: "#ffffff",
          }}
        >

          <div
            className="d-flex align-items-center"
            style={{
              minHeight: "58px",
              overflowX: "auto",
              padding: "0 10px",
            }}
          >


            <button
              type="button"
              onClick={closeHistory}
              title="Back to Dashboard"
              style={{
                border: "none",
                background: "transparent",
                color: "#6b4a8e",
                fontSize: "30px",
                fontWeight: "400",
                lineHeight: "1",
                cursor: "pointer",
                padding: "0 12px 0 4px",
                margin: "0",
              }}
            >
              ‹
            </button>

            {/* PUNCH IN / PUNCH OUT */}

            <button
              type="button"
              onClick={() =>
                scrollToHistorySection("punch")
              }
              style={{
                border: "none",
                background: "transparent",
                padding: "17px 22px",
                fontSize: "14px",
                fontWeight:
                  historyTab === "punch"
                    ? "700"
                    : "500",
                color:
                  historyTab === "punch"
                    ? "#5b21b6"
                    : "#172033",
                borderBottom:
                  historyTab === "punch"
                    ? "3px solid #5b21b6"
                    : "3px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Punch In / Punch Out
            </button>


            {/* SOCIETY STAFF ATTENDANCE */}

            <button
              type="button"
              onClick={() =>
                scrollToHistorySection("attendance")
              }
              style={{
                border: "none",
                background: "transparent",
                padding: "17px 22px",
                fontSize: "16px",
                fontWeight:
                  historyTab === "attendance"
                    ? "700"
                    : "500",
                color:
                  historyTab === "attendance"
                    ? "#5b21b6"
                    : "#172033",
                borderBottom:
                  historyTab === "attendance"
                    ? "3px solid #5b21b6"
                    : "3px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Society Staff Attendance
            </button>


            {/* READING HISTORY */}

            <button
              type="button"
              onClick={() =>
                scrollToHistorySection("reading")
              }
              style={{
                border: "none",
                background: "transparent",
                padding: "17px 22px",
                fontSize: "16px",
                fontWeight:
                  historyTab === "reading"
                    ? "700"
                    : "500",
                color:
                  historyTab === "reading"
                    ? "#5b21b6"
                    : "#172033",
                borderBottom:
                  historyTab === "reading"
                    ? "3px solid #5b21b6"
                    : "3px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Reading History
            </button>


            {/* TASKS */}

            <button
              type="button"
              onClick={() =>
                scrollToHistorySection("tasks")
              }
              style={{
                border: "none",
                background: "transparent",
                padding: "17px 22px",
                fontSize: "16px",
                fontWeight:
                  historyTab === "tasks"
                    ? "700"
                    : "500",
                color:
                  historyTab === "tasks"
                    ? "#5b21b6"
                    : "#172033",
                borderBottom:
                  historyTab === "tasks"
                    ? "3px solid #5b21b6"
                    : "3px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Tasks
            </button>

            {/* CONFIGURATION */}

            <button
              type="button"
              onClick={openSettings}
              style={{
                border: "none",
                background: "transparent",
                padding: "17px 22px",
                fontSize: "16px",
                fontWeight: "500",
                color: "#172033",
                borderBottom: "3px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Configuration
            </button>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loadingHistory && (

          <div className="alert alert-info">
            Loading project history...
          </div>

        )}


        {historyError && (

          <div className="alert alert-danger">
            {historyError}
          </div>

        )}


        {!loadingHistory &&
          !historyError && (

            <>

              {/* =================================================
                QUICK HISTORY TABLES
            ================================================= */}

              {/* PUNCH */}
              {historyTab === "punch" && (
                <div
                  id="history-punch"
                  className="card border-0 shadow-sm mb-4"
                  style={{
                    borderRadius: "18px",
                    scrollMarginTop: "85px",
                  }}
                >

                  <div className="card-body p-2">

                    <div className="d-flex justify-content-between align-items-center mb-3">


                      <span className="badge bg-light text-dark border">
                        {history.punchRecords.length} Records
                      </span>

                    </div>


                    <div className="table-responsive">

                      <table
                        className="table table-hover align-middle"
                        style={{ fontSize: "14px" }}
                      >
                        <thead>

                          <tr>

                            <th>#</th>
                            <th>User</th>
                            <th>Role</th>
                            <th>Date</th>
                            <th>Punch In</th>
                            <th>In Distance</th>
                            <th>Punch Out</th>
                            <th>Out Distance</th>
                            <th>Working Hours</th>

                          </tr>

                        </thead>


                        <tbody>

                          {history.punchRecords.length === 0 ? (

                            <tr>

                              <td
                                colSpan="9"
                                className="text-center text-secondary py-4"
                              >
                                No Punch In / Punch Out records found.
                              </td>

                            </tr>

                          ) : (

                            currentPunchRecords.map(
                              (item, index) => (

                                <tr key={item.id}>

                                  <td>
                                    {index + 1}
                                  </td>

                                  <td>
                                    <strong>
                                      {item.user_name || "-"}
                                    </strong>
                                  </td>

                                  <td>
                                    {item.role || "-"}
                                  </td>

                                  <td>
                                    {formatDate(item.punch_in)}
                                  </td>

                                  <td>
                                    {formatTime(item.punch_in)}
                                  </td>

                                  <td>
                                    {item.punch_in_distance_meters !== null &&
                                      item.punch_in_distance_meters !== undefined
                                      ? `${item.punch_in_distance_meters} m`
                                      : "-"}
                                  </td>

                                  <td>
                                    {formatTime(item.punch_out)}
                                  </td>

                                  <td>
                                    {item.punch_out_distance_meters !== null &&
                                      item.punch_out_distance_meters !== undefined
                                      ? `${item.punch_out_distance_meters} m`
                                      : "-"}
                                  </td>

                                  <td>
                                    <span className="badge bg-light text-dark border">
                                      {getWorkingHours(
                                        item.punch_in,
                                        item.punch_out
                                      )}
                                    </span>
                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                      {punchTotalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            disabled={punchPage === 1}
                            onClick={() =>
                              setPunchPage((page) => page - 1)
                            }
                          >
                            Previous
                          </button>

                          <span className="fw-semibold px-2">
                            Page {punchPage} of {punchTotalPages}
                          </span>

                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            disabled={punchPage === punchTotalPages}
                            onClick={() =>
                              setPunchPage((page) => page + 1)
                            }
                          >
                            Next
                          </button>

                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )}


              {/* STAFF ATTENDANCE */}
              {historyTab === "attendance" && (
                <div
                  id="history-attendance"
                  className="card border-0 shadow-sm mb-4"
                  style={{
                    borderRadius: "18px",
                    scrollMarginTop: "85px",
                  }}
                >

                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                      <span className="badge bg-light text-dark border">
                        {history.staffAttendance.length} Records
                      </span>

                    </div>


                    <div className="table-responsive">

                      <table className="table table-hover align-middle">

                        <thead>

                          <tr>

                            <th>#</th>
                            <th>Staff Name</th>
                            <th>Date</th>
                            <th>Status</th>

                          </tr>

                        </thead>


                        <tbody>

                          {history.staffAttendance.length === 0 ? (

                            <tr>

                              <td
                                colSpan="4"
                                className="text-center text-secondary py-4"
                              >
                                No staff attendance records found.
                              </td>

                            </tr>

                          ) : (

                            currentStaffAttendance.map(
                              (item, index) => (

                                <tr key={item.id}>

                                  <td>
                                    {index + 1}
                                  </td>

                                  <td>
                                    <strong>
                                      {item.staff_name}
                                    </strong>
                                  </td>

                                  <td>
                                    {formatDate(
                                      item.attendance_date
                                    )}
                                  </td>

                                  <td>

                                    <span
                                      className={
                                        item.status ===
                                          "Present"
                                          ? "badge bg-success"
                                          : "badge bg-danger"
                                      }
                                    >
                                      {item.status}
                                    </span>

                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                      {staffTotalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            disabled={staffPage === 1}
                            onClick={() =>
                              setStaffPage((page) => page - 1)
                            }
                          >
                            Previous
                          </button>

                          <span className="fw-semibold px-2">
                            Page {staffPage} of {staffTotalPages}
                          </span>

                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            disabled={staffPage === staffTotalPages}
                            onClick={() =>
                              setStaffPage((page) => page + 1)
                            }
                          >
                            Next
                          </button>

                        </div>
                      )}


                    </div>

                  </div>

                </div>

              )}


              {/* =================================================
    READING
================================================= */}
              {historyTab === "reading" && (
                <div
                  id="history-reading"
                  className="card border-0 shadow-sm mb-4"
                  style={{
                    borderRadius: "18px",
                    scrollMarginTop: "85px",
                  }}
                >

                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center mb-3">


                      <span className="badge bg-light text-dark border">
                        {history.readings.length} Records
                      </span>

                    </div>


                    <div className="table-responsive">

                      <table className="table table-hover align-middle">

                        <thead>

                          <tr>

                            <th>#</th>

                            <th>Reading Type</th>

                            <th>Date</th>

                            <th>Meter No.</th>

                            <th>Previous Reading</th>

                            <th>Current Reading</th>

                            <th>Consumption</th>



                          </tr>

                        </thead>


                        <tbody>

                          {history.readings.length === 0 ? (

                            <tr>

                              <td
                                colSpan="7"
                                className="text-center text-secondary py-4"
                              >
                                No reading records found.
                              </td>

                            </tr>

                          ) : (

                            currentReadings.map(
                              (item, index) => (

                                <tr key={item.id}>

                                  {/* # */}
                                  <td>
                                    {index + 1}
                                  </td>


                                  {/* READING TYPE */}
                                  <td>
                                    {item.reading_type || "-"}
                                  </td>

                                  {/* DATE */}
                                  <td>
                                    {formatDate(
                                      item.reading_date
                                    )}
                                  </td>


                                  {/* METER NO */}
                                  <td>
                                    {item.meter_no || "-"}
                                  </td>


                                  {/* PREVIOUS READING */}
                                  <td>
                                    {item.previous_reading !== null &&
                                      item.previous_reading !== undefined
                                      ? item.previous_reading
                                      : "-"}
                                  </td>


                                  {/* CURRENT READING */}
                                  <td>
                                    <strong>
                                      {item.current_reading ??
                                        item.reading_value ??
                                        "-"}
                                    </strong>
                                  </td>


                                  {/* CONSUMPTION */}
                                  <td>
                                    <strong>
                                      {item.consumption !== null &&
                                        item.consumption !== undefined
                                        ? item.consumption
                                        : "-"}
                                    </strong>
                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                      {readingTotalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            disabled={readingPage === 1}
                            onClick={() =>
                              setReadingPage((page) => page - 1)
                            }
                          >
                            Previous
                          </button>

                          <span className="fw-semibold px-2">
                            Page {readingPage} of {readingTotalPages}
                          </span>

                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            disabled={readingPage === readingTotalPages}
                            onClick={() =>
                              setReadingPage((page) => page + 1)
                            }
                          >
                            Next
                          </button>

                        </div>
                      )}


                    </div>

                  </div>

                </div>
              )}

              {/* TASKS */}
              {historyTab === "tasks" && (
                <div
                  id="history-tasks"
                  className="card border-0 shadow-sm mb-4"
                  style={{
                    borderRadius: "18px",
                    scrollMarginTop: "85px",
                  }}
                >
                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center mb-3">


                      <span className="badge bg-light text-dark border">
                        {history.tasks.length} Records
                      </span>

                    </div>


                    <div className="table-responsive">

                      <table className="table table-hover align-middle">

                        <thead>

                          <tr>

                            <th>#</th>
                            <th>Task</th>
                            <th>Description</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Completed</th>

                          </tr>

                        </thead>


                        <tbody>

                          {history.tasks.length === 0 ? (

                            <tr>

                              <td
                                colSpan="7"
                                className="text-center text-secondary py-4"
                              >
                                No tasks found.
                              </td>

                            </tr>

                          ) : (

                            history.tasks.map(
                              (item, index) => (

                                <tr key={item.id}>

                                  <td>
                                    {index + 1}
                                  </td>

                                  <td>
                                    <strong>
                                      {item.task_name}
                                    </strong>
                                  </td>

                                  <td>
                                    {item.description || "-"}
                                  </td>

                                  <td>
                                    {item.assigned_user_name || "-"}
                                  </td>

                                  <td>

                                    <span
                                      className={
                                        item.status ===
                                          "Completed"
                                          ? "badge bg-success"
                                          : item.status ===
                                            "In Progress"
                                            ? "badge bg-warning text-dark"
                                            : "badge bg-secondary"
                                      }
                                    >
                                      {item.status}
                                    </span>

                                  </td>

                                  <td>
                                    {formatDate(
                                      item.created_date
                                    )}
                                  </td>

                                  <td>
                                    {formatDate(
                                      item.completed_date
                                    )}
                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                </div>

              )}


              <div
                className="card border-0 shadow-sm mb-4"
                style={{
                  borderRadius: "18px",
                }}
              >

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <div>

                      <h5 className="fw-bold mb-1">
                        Download Reports
                      </h5>

                    </div>

                  </div>


                  {/* REPORT SELECT */}

                  <div className="row g-3">

                    <div className="col-12 col-lg-5">

                      <label className="form-label fw-semibold">
                        Select Report
                      </label>

                      <select
                        className="form-select"
                        value={reportType}
                        onChange={(e) => {
                          setReportType(
                            e.target.value
                          );

                          setReportUser("all");
                          setReportStaff("all");
                          setReportStatus("all");
                          setReportReadingType("all");
                          setReportAssignedUser("all");
                        }}
                      >

                        <option value="">
                          Select Report
                        </option>

                        <option value="punch">
                          Punch In / Punch Out Report
                        </option>

                        <option value="attendance">
                          Staff Attendance Report
                        </option>

                        <option value="reading">
                          Reading History Report
                        </option>

                        <option value="tasks">
                          Task Report
                        </option>

                      </select>

                    </div>


                    <div className="col-12 col-md-6 col-lg-3">

                      <label className="form-label fw-semibold">
                        From Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={fromDate}
                        onChange={(e) =>
                          setFromDate(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="col-12 col-md-6 col-lg-3">

                      <label className="form-label fw-semibold">
                        To Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={toDate}
                        onChange={(e) =>
                          setToDate(
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  {/* =========================================
                    PUNCH FILTER
                ========================================= */}

                  {reportType ===
                    "punch" && (

                      <div className="row g-3 mt-1">

                        <div className="col-md-4">

                          <label className="form-label fw-semibold">
                            User
                          </label>

                          <select
                            className="form-select"
                            value={reportUser}
                            onChange={(e) =>
                              setReportUser(
                                e.target.value
                              )
                            }
                          >

                            <option value="all">
                              All Users
                            </option>

                            {reportUsers.map(
                              (user) => (

                                <option
                                  key={user.id}
                                  value={user.id}
                                >
                                  {user.name}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                      </div>

                    )}


                  {/* =========================================
                    ATTENDANCE FILTER
                ========================================= */}

                  {reportType ===
                    "attendance" && (

                      <div className="row g-3 mt-1">

                        <div className="col-md-4">

                          <label className="form-label fw-semibold">
                            Staff
                          </label>

                          <select
                            className="form-select"
                            value={reportStaff}
                            onChange={(e) =>
                              setReportStaff(
                                e.target.value
                              )
                            }
                          >

                            <option value="all">
                              All Staff
                            </option>

                            {staffList.map(
                              (staff) => (

                                <option
                                  key={staff}
                                  value={staff}
                                >
                                  {staff}
                                </option>

                              )
                            )}

                          </select>

                        </div>


                        <div className="col-md-4">

                          <label className="form-label fw-semibold">
                            Status
                          </label>

                          <select
                            className="form-select"
                            value={reportStatus}
                            onChange={(e) =>
                              setReportStatus(
                                e.target.value
                              )
                            }
                          >

                            <option value="all">
                              All
                            </option>

                            <option value="Present">
                              Present
                            </option>

                            <option value="Absent">
                              Absent
                            </option>

                          </select>

                        </div>

                      </div>

                    )}


                  {/* =========================================
    READING FILTER
========================================= */}

                  {reportType === "reading" && (

                    <div className="row g-3 mt-1">

                      <div className="col-md-4">

                        <label className="form-label fw-semibold">
                          Reading Type
                        </label>

                        <select
                          className="form-select"
                          value={reportReadingType}
                          onChange={(e) =>
                            setReportReadingType(e.target.value)
                          }
                        >

                          <option value="all">
                            All Readings
                          </option>

                          <option value="Water Reading">
                            Water Reading
                          </option>

                          <option value="Electricity Reading">
                            Electricity Reading
                          </option>

                          <option value="Diesel Reading">
                            Diesel Reading
                          </option>

                        </select>

                      </div>

                    </div>

                  )}

                  {/* =========================================
                    TASK FILTER
                ========================================= */}

                  {reportType ===
                    "tasks" && (

                      <div className="row g-3 mt-1">

                        <div className="col-md-4">

                          <label className="form-label fw-semibold">
                            Assigned To
                          </label>

                          <select
                            className="form-select"
                            value={reportAssignedUser}
                            onChange={(e) =>
                              setReportAssignedUser(
                                e.target.value
                              )
                            }
                          >

                            <option value="all">
                              All Users
                            </option>

                            {reportUsers.map(
                              (user) => (

                                <option
                                  key={user.id}
                                  value={user.id}
                                >
                                  {user.name}
                                </option>

                              )
                            )}

                          </select>

                        </div>


                        <div className="col-md-4">

                          <label className="form-label fw-semibold">
                            Status
                          </label>

                          <select
                            className="form-select"
                            value={reportStatus}
                            onChange={(e) =>
                              setReportStatus(
                                e.target.value
                              )
                            }
                          >

                            <option value="all">
                              All
                            </option>

                            <option value="Pending">
                              Pending
                            </option>

                            <option value="In Progress">
                              In Progress
                            </option>

                            <option value="Completed">
                              Completed
                            </option>

                          </select>

                        </div>

                      </div>

                    )}


                  {/* BUTTONS */}

                  {reportType && (

                    <div
                      className="d-flex mt-4"
                      style={{
                        gap: "10px",
                      }}
                    >

                      <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={
                          handleViewReport
                        }
                      >
                        🔍 View Report
                      </button>


                      <button
                        type="button"
                        className="btn btn-success px-4"
                        onClick={
                          handleDownloadReport
                        }
                      >
                        📥 Download Report
                      </button>

                    </div>

                  )}

                </div>

              </div>

            </>

          )}


        {/* =================================================
            REPORT PREVIEW MODAL
        ================================================= */}

        {showReportPreview && (

          <div
            className="project-modal-overlay"
            style={{
              zIndex: 3000,
            }}
          >

            <div
              className="project-modal"
              style={{
                width: "92%",
                maxWidth: "1200px",
                maxHeight: "90vh",
                overflowY: "hidden",
              }}
            >

              <div className="project-modal-header">

                <div>

                  <h2 className="mb-1">
                    📄 Report Preview
                  </h2>

                  <small className="text-secondary">
                    {getReportTitle()}
                  </small>

                </div>


                <button
                  type="button"
                  className="project-modal-close"
                  onClick={() =>
                    setShowReportPreview(false)
                  }
                >
                  ×
                </button>

              </div>


              <div
                className="project-modal-body"
                style={{
                  background: "#fff",
                   maxHeight: "62vh",
    overflowY: "auto",
                }}
              >

                <div
                  className="border rounded p-4 mb-4"
                >

                  <h2 className="fw-bold mb-1">
                    {selectedProject.name}
                  </h2>

                  <p className="text-secondary mb-3">
                     {selectedProject.location}
                  </p>

                  <h4 className="fw-bold">
                    {getReportTitle()}
                  </h4>

                  <p className="text-secondary">
                    From: {fromDate || "All"} &nbsp;
                    | &nbsp;
                    To: {toDate || "All"}
                  </p>

                </div>


                {/* PUNCH PREVIEW */}

                {reportType ===
                  "punch" && (

                    <div className="table-responsive">

                      <table className="table table-bordered">

                        <thead>

                          <tr>

                            <th>#</th>
                            <th>User</th>
                            <th>Role</th>
                            <th>Date</th>
                            <th>Punch In</th>
                            <th>In Distance</th>
                            <th>Punch Out</th>
                            <th>Out Distance</th>
                            <th>Hours</th>

                          </tr>

                        </thead>

                        <tbody>

                          {previewData.length === 0 ? (

                            <tr>

                              <td
                                colSpan="9"
                                className="text-center py-4"
                              >
                                No records found for selected filters.
                              </td>

                            </tr>

                          ) : (

                            previewData.map(
                              (item, index) => (

                                <tr key={item.id}>

                                  <td>
                                    {index + 1}
                                  </td>

                                  <td>
                                    {item.user_name || "-"}
                                  </td>

                                  <td>
                                    {item.role || "-"}
                                  </td>

                                  <td>
                                    {formatDate(item.punch_in)}
                                  </td>

                                  <td>
                                    {formatTime(item.punch_in)}
                                  </td>

                                  <td>
                                    {item.punch_in_distance_meters !== null &&
                                      item.punch_in_distance_meters !== undefined
                                      ? `${item.punch_in_distance_meters} m`
                                      : "-"}
                                  </td>

                                  <td>
                                    {formatTime(item.punch_out)}
                                  </td>

                                  <td>
                                    {item.punch_out_distance_meters !== null &&
                                      item.punch_out_distance_meters !== undefined
                                      ? `${item.punch_out_distance_meters} m`
                                      : "-"}
                                  </td>

                                  <td>
                                    {getWorkingHours(
                                      item.punch_in,
                                      item.punch_out
                                    )}
                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                    </div>

                  )}


                {/* ATTENDANCE PREVIEW */}

                {reportType ===
                  "attendance" && (

                    <div className="table-responsive">

                      <table className="table table-bordered">

                        <thead>

                          <tr>

                            <th>#</th>
                            <th>Staff Name</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Punch In</th>
                            <th>Punch Out</th>

                          </tr>

                        </thead>

                        <tbody>

                          {previewData.length === 0 ? (

                            <tr>

                              <td
                                colSpan="6"
                                className="text-center py-4"
                              >
                                No records found for selected filters.
                              </td>

                            </tr>

                          ) : (

                            previewData.map(
                              (item, index) => (

                                <tr key={item.id}>

                                  <td>
                                    {index + 1}
                                  </td>

                                  <td>
                                    {item.staff_name}
                                  </td>

                                  <td>
                                    {formatDate(
                                      item.attendance_date
                                    )}
                                  </td>

                                  <td>
                                    {item.status}
                                  </td>

                                  <td>
                                    {item.punch_in || "-"}
                                  </td>

                                  <td>
                                    {item.punch_out || "-"}
                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                    </div>

                  )}


                {/* READING PREVIEW */}

                {reportType ===
                  "reading" && (

                    <div className="table-responsive">

                      <table className="table table-bordered">

                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Reading Type</th>
                            <th>Date</th>
                            <th>Meter No.</th>
                            <th>Previous Reading</th>
                            <th>Current Reading</th>
                            <th>Consumption</th>
                          </tr>
                        </thead>

                        <tbody>

                          {history.readings.length === 0 ? (

                            <tr>

                              <td
                                colSpan="8"
                                className="text-center text-secondary py-4"
                              >
                                No reading records found.
                              </td>

                            </tr>

                          ) : (

                            history.readings.map(
                              (item, index) => (

                                <tr key={item.id}>

                                  {/* # */}
                                  <td>
                                    {index + 1}
                                  </td>


                                  {/* READING TYPE */}
                                  <td>
                                    {item.reading_type || "-"}
                                  </td>

                                  {/* DATE */}
                                  <td>
                                    {formatDate(
                                      item.reading_date
                                    )}
                                  </td>

                                  {/* METER NO */}
                                  <td>
                                    {item.meter_no || "-"}
                                  </td>


                                  {/* PREVIOUS READING */}
                                  <td>
                                    {item.previous_reading !== null &&
                                      item.previous_reading !== undefined
                                      ? item.previous_reading
                                      : "-"}
                                  </td>


                                  {/* CURRENT READING */}
                                  <td>
                                    <strong>
                                      {item.current_reading ??
                                        item.reading_value ??
                                        "-"}
                                    </strong>
                                  </td>


                                  {/* CONSUMPTION */}
                                  <td>
                                    <strong>
                                      {item.consumption !== null &&
                                        item.consumption !== undefined
                                        ? item.consumption
                                        : "-"}
                                    </strong>
                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                    </div>

                  )}


                {/* TASK PREVIEW */}

                {reportType ===
                  "tasks" && (

                    <div className="table-responsive">

                      <table className="table table-bordered">

                        <thead>

                          <tr>

                            <th>#</th>
                            <th>Task</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Completed</th>

                          </tr>

                        </thead>

                        <tbody>

                          {previewData.length === 0 ? (

                            <tr>

                              <td
                                colSpan="6"
                                className="text-center py-4"
                              >
                                No records found for selected filters.
                              </td>

                            </tr>

                          ) : (

                            previewData.map(
                              (item, index) => (

                                <tr key={item.id}>

                                  <td>
                                    {index + 1}
                                  </td>

                                  <td>
                                    {item.task_name}
                                  </td>

                                  <td>
                                    {item.assigned_user_name || "-"}
                                  </td>

                                  <td>
                                    {item.status}
                                  </td>

                                  <td>
                                    {formatDate(
                                      item.created_date
                                    )}
                                  </td>

                                  <td>
                                    {formatDate(
                                      item.completed_date
                                    )}
                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

              </div>


              <div className="project-modal-footer">

                <button
                  type="button"
                  className="project-cancel-btn"
                  onClick={() =>
                    setShowReportPreview(false)
                  }
                >
                  ✕ Close
                </button>


                <button
                  type="button"
                  className="project-create-btn"
                  onClick={
                    handleDownloadReport
                  }
                >
                  📥 Download Report
                </button>

              </div>

            </div>

          </div>

        )}


        {/* =================================================
            SETTINGS MODAL
        ================================================= */}

        {showSettings && (

          <div
            className="project-modal-overlay"
            style={{
              zIndex: 2500,
            }}
          >

            <div
              className="project-modal"
              style={{
                width: "90%",
                maxWidth: "850px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >

              <div className="project-modal-header">

                <div>

<h4
  className="mb-1 fw-bold"
  style={{ fontSize: "18px" }}
>
  Project Settings
</h4>
                  <small className="text-secondary">
                    Edit project information and access
                  </small>

                </div>


                <button
                  type="button"
                  className="project-modal-close"
                  onClick={() =>
                    setShowSettings(false)
                  }
                >
                  ×
                </button>

              </div>

               <style>{`
  .project-settings-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .project-settings-scroll::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`}</style>

              <div className="project-modal-body project-settings-scroll">

                {/* PROJECT */}

                <div className="border rounded p-3 mb-4">

                 <h6 className="fw-bold mb-3">
  Project Information
</h6>

                  <div className="row g-3">

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Project Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={settingsName}
                        onChange={(e) =>
                          setSettingsName(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Location
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={settingsLocation}
                        onChange={(e) =>
                          setSettingsLocation(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Status
                      </label>

                      <select
                        className="form-select"
                        value={settingsStatus}
                        onChange={(e) =>
                          setSettingsStatus(
                            e.target.value
                          )
                        }
                      >

                        <option value="active">
                          Active
                        </option>

                        <option value="on_track">
                          On Track
                        </option>

                        <option value="at_risk">
                          At Risk
                        </option>

                        <option value="off_track">
                          Off Track
                        </option>

                        <option value="on_hold">
                          On Hold
                        </option>

                        <option value="complete">
                          Complete
                        </option>

                      </select>

                    </div>

                  </div>

                </div>


                {/* PROJECT MANAGER */}

                <div className="border rounded p-3 mb-4">

                  <h6 className="fw-bold mb-1">
                     Project Manager
                  </h6>

                  <small className="text-secondary">
                    Leave blank if no Project Manager is assigned.
                  </small>


                  <div className="row g-3 mt-1">

                    <div className="col-md-4">

                      <label className="form-label">
                        Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Project Manager Name"
                        value={settingsPMName}
                        onChange={(e) =>
                          setSettingsPMName(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="col-md-4">

                      <label className="form-label">
                        Email
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Project Manager Email"
                        value={settingsPMEmail}
                        onChange={(e) =>
                          setSettingsPMEmail(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="col-md-4">

                      <label className="form-label">
                        New Password
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        placeholder="Optional"
                        value={settingsPMPassword}
                        onChange={(e) =>
                          setSettingsPMPassword(
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>


                {/* MANAGER */}

                <div className="border rounded p-3">

                  <h6 className="fw-bold mb-1">
                     Manager
                  </h6>

                  <small className="text-secondary">
                    Leave blank if no Manager is assigned.
                  </small>


                  <div className="row g-3 mt-1">

                    <div className="col-md-4">

                      <label className="form-label">
                        Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Manager Name"
                        value={settingsManagerName}
                        onChange={(e) =>
                          setSettingsManagerName(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="col-md-4">

                      <label className="form-label">
                        Email
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Manager Email"
                        value={settingsManagerEmail}
                        onChange={(e) =>
                          setSettingsManagerEmail(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="col-md-4">

                      <label className="form-label">
                        New Password
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        placeholder="Optional"
                        value={settingsManagerPassword}
                        onChange={(e) =>
                          setSettingsManagerPassword(
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

              </div>


              <div className="project-modal-footer">

                {/* DELETE PROJECT */}

                <button
                  type="button"
                  onClick={handleDeleteProject}
                  style={{
                    marginRight: "auto",
                    background: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete Project
                </button>


                {/* CANCEL */}

                <button
                  type="button"
                  className="project-cancel-btn"
                  onClick={() =>
                    setShowSettings(false)
                  }
                >
                  ✕ Cancel
                </button>


                {/* SAVE */}

                <button
                  type="button"
                  className="project-create-btn"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings
                    ? "Saving..."
                    : "✓ Save Changes"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    );

  }


  // =====================================================
  // NORMAL PROJECT PAGE
  // =====================================================

  return (

    <div
      className="container-fluid py-4"
      style={{
        maxWidth: "1500px",
        margin: "0 auto",
      }}
    >

      <style>{`
      .dashboard-card:hover {
  transform: none;

  box-shadow:
    0 8px 22px rgba(0,0,0,0.07);
}
      `}</style>

      <div
        className="d-flex align-items-center justify-content-between mb-3"
      >
        {/* LEFT - PROJECT */}

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={onBack}
            style={{
              fontSize: "30px",
              lineHeight: "1",
              textDecoration: "none",
              color: "#4b2e83",
            }}
          >
            ‹
          </button>

          <h5 className="m-0 fw-bold">
            Project
          </h5>
        </div>

        {/* RIGHT - NEW */}

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          New
        </button>

      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">

      </div>


      <div className="row g-4">

        {projects.length === 0 ? (

          <div className="col-12">

            <div className="card border-0 shadow-sm">

              <div className="card-body text-center py-5">

                <h4 className="fw-bold">
                  No Projects Found
                </h4>

                <p className="text-secondary">
                  Create your first project.
                </p>

              </div>

            </div>

          </div>

        ) : (

          sortedProjects.map(
            (project, index) => {

              const backgrounds = [
                "#eef7ff",
                "#fff9e8",
                "#fff0f3",
                "#f4efff",
              ];


              return (

                <div
                  className="col-12 col-md-6 col-lg-4 col-xl-3"
                  key={project.id}
                >

                  <div
                    className="card border-0 project-card"
                    onClick={() =>
                      openProjectHistory(project)
                    }
                    style={{
                      borderRadius: "18px",
                      background:
                        backgrounds[
                        index %
                        backgrounds.length
                        ],
                      minHeight: "150px",
                      cursor: "pointer",
                      boxShadow:
                        "0 5px 18px rgba(0,0,0,0.07)",
                    }}
                  >

                    <div
                      className="card-body d-flex flex-column align-items-center text-center"
                      style={{
                        padding: "12px 14px 14px",
                        minHeight: "150px",
                      }}
                    >
                      {/* STATUS DROPDOWN */}
                      <div
                        className="w-100 d-flex justify-content-end"
                        style={{
                          marginBottom: "12px",
                          position: "relative",
                        }}
                      >
                        <div style={{ position: "relative" }}>

                          {/* CURRENT STATUS */}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              setStatusMenuOpen(
                                statusMenuOpen === project.id
                                  ? null
                                  : project.id
                              );
                            }}
                            title="Change Status"
                            style={{
                              border: "none",
                              background: "transparent",
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                              cursor: "pointer",
                              padding: "2px 0",
                            }}
                          >

                            {/* STATUS COLOR */}

                            <span
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                display: "inline-block",
                                flexShrink: 0,

                                background:
                                  project.status === "on_track"
                                    ? "#22c55e"
                                    : project.status === "at_risk"
                                      ? "#f59e0b"
                                      : project.status === "off_track"
                                        ? "#dc3545"
                                        : project.status === "on_hold"
                                          ? "#20a4b8"
                                          : project.status === "complete"
                                            ? "#76506f"
                                            : "#22c55e",
                              }}
                            />

                            {/* SMALL ARROW */}

                            <span
                              style={{
                                fontSize: "11px",
                                color: "#172033",
                              }}
                            >
                              ▾
                            </span>

                          </button>

                          {/* STATUS MENU */}

                          {statusMenuOpen === project.id && (

                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                top: "35px",
                                right: "0",
                                width: "190px",
                                background: "#ffffff",
                                borderRadius: "10px",
                                padding: "8px 0",
                                boxShadow:
                                  "0 8px 25px rgba(0,0,0,0.15)",
                                border: "1px solid #e5e7eb",
                                zIndex: 1000,
                              }}
                            >

                              {/* ON TRACK */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleProjectStatusChange(
                                    project,
                                    "on_track"
                                  )
                                }
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: "transparent",
                                  padding: "10px 14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  fontSize: "15px",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    background: "#22c55e",
                                  }}
                                />
                                On Track
                              </button>


                              {/* AT RISK */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleProjectStatusChange(
                                    project,
                                    "at_risk"
                                  )
                                }
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: "transparent",
                                  padding: "10px 14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  fontSize: "15px",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    background: "#f59e0b",
                                  }}
                                />
                                At Risk
                              </button>


                              {/* OFF TRACK */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleProjectStatusChange(
                                    project,
                                    "off_track"
                                  )
                                }
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: "transparent",
                                  padding: "10px 14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  fontSize: "15px",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    background: "#dc3545",
                                  }}
                                />
                                Off Track
                              </button>


                              {/* ON HOLD */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleProjectStatusChange(
                                    project,
                                    "on_hold"
                                  )
                                }
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: "transparent",
                                  padding: "10px 14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  fontSize: "15px",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    background: "#20a4b8",
                                  }}
                                />
                                On Hold
                              </button>


                              {/* COMPLETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleProjectStatusChange(
                                    project,
                                    "complete"
                                  )
                                }
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: "transparent",
                                  padding: "10px 14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  fontSize: "15px",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    background: "#76506f",
                                  }}
                                />
                                Complete
                              </button>

                            </div>

                          )}

                        </div>
                      </div>

                      {/* SOCIETY NAME */}
                      <h3
                        className="fw-bold"
                        style={{
                          fontSize: "18px",
                          lineHeight: "1.2",
                          color: "#1f2937",
                          margin: "0 0 6px",
                          textAlign: "center",
                        }}
                      >
                        {project.name}
                      </h3>

                      {/* LOCATION */}
                      <div
                        style={{
                          color: "#64748b",
                          fontWeight: "600",
                          fontSize: "12px",
                          lineHeight: "1.4",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ marginRight: "5px" }}>
                          
                        </span>

                        {project.location}
                      </div>

                      {project.project_manager_name && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            left: "0",
                            right: "0",
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "#64748b",
                          }}
                        >
                          {project.project_manager_name}
                        </div>
                      )}

                    </div>

                  </div>

                </div>

              );

            }
          )

        )}

      </div>


      {/* =================================================
          CREATE PROJECT
      ================================================= */}

      {showCreateForm && (

        <div className="project-modal-overlay">

          <div
            className="project-modal"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >

            <div className="project-modal-header">

              <h2 className="mb-0">
                Create New Project
              </h2>

              <button
                type="button"
                className="project-modal-close"
                onClick={() => {
                  setShowCreateForm(false);
                  resetCreateForm();
                }}
              >
                ×
              </button>

            </div>


            <div className="project-modal-body">

              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Project Name *
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) =>
                    setProjectName(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Location *
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="mb-4">

                <label className="form-label fw-semibold">
                  Status *
                </label>

                <select
                  className="form-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="on_track">
                    On Track
                  </option>

                  <option value="at_risk">
                    At Risk
                  </option>

                  <option value="off_track">
                    Off Track
                  </option>

                  <option value="on_hold">
                    On Hold
                  </option>

                  <option value="complete">
                    Complete
                  </option>


                </select>

              </div>


              {/* PM */}

              <div className="border rounded p-3 mb-4">

                <h5 className="fw-bold">
                  👤 Project Manager Access
                </h5>

                <small className="text-secondary">
                  Optional
                </small>


                <input
                  type="text"
                  className="form-control mt-3 mb-2"
                  placeholder="Project Manager Name"
                  value={projectManagerName}
                  onChange={(e) =>
                    setProjectManagerName(
                      e.target.value
                    )
                  }
                />

                <input
                  type="email"
                  className="form-control mb-2"
                  placeholder="Project Manager Email"
                  value={projectManagerEmail}
                  onChange={(e) =>
                    setProjectManagerEmail(
                      e.target.value
                    )
                  }
                />

                <input
                  type="password"
                  className="form-control"
                  placeholder="Project Manager Password"
                  value={projectManagerPassword}
                  onChange={(e) =>
                    setProjectManagerPassword(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* MANAGER */}

              <div className="border rounded p-3">

                <h5 className="fw-bold">
                   Manager Access
                </h5>

                <small className="text-secondary">
                  Optional
                </small>


                <input
                  type="text"
                  className="form-control mt-3 mb-2"
                  placeholder="Manager Name"
                  value={managerName}
                  onChange={(e) =>
                    setManagerName(
                      e.target.value
                    )
                  }
                />

                <input
                  type="email"
                  className="form-control mb-2"
                  placeholder="Manager Email"
                  value={managerEmail}
                  onChange={(e) =>
                    setManagerEmail(
                      e.target.value
                    )
                  }
                />

                <input
                  type="password"
                  className="form-control"
                  placeholder="Manager Password"
                  value={managerPassword}
                  onChange={(e) =>
                    setManagerPassword(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            <div className="project-modal-footer">

              <button
                type="button"
                className="project-cancel-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  resetCreateForm();
                }}
              >
                ✕ Cancel
              </button>


              <button
                type="button"
                className="project-create-btn"
                onClick={
                  handleCreateProject
                }
              >
                ＋ Create Project
              </button>

            </div>

          </div>

        </div>

      )}
      

    </div>

    

  );

}

export default Project;

