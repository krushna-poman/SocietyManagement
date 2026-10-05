import { useEffect, useState } from "react";

function Task({
  onBack,
  project: selectedProject,
}) {
  const API_BASE =
    `${window.location.protocol}//${window.location.hostname}:5000`;

  // =====================================================
  // DEFAULT STATUS
  // =====================================================

  const defaultStatuses = [
    "TO-DO",
    "IN PROCESS",
    "IN APPROVAL",
    "APPROVED",
    "COMPLETED",
    "HOLD",
    "CANCELLED",
  ];

  // =====================================================
  // STATES
  // =====================================================

  const [statuses, setStatuses] =
    useState(defaultStatuses);

  const [tasks, setTasks] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [showStatusForm, setShowStatusForm] =
    useState(false);

  const [newStatus, setNewStatus] =
    useState("");

  const [editingTask, setEditingTask] =
    useState(null);

  const [taskName, setTaskName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [priority, setPriority] =
    useState(1);

  const [status, setStatus] =
    useState("TO-DO");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // GET CURRENT PROJECT ID
  // =====================================================

  const projectId =
    selectedProject?.id || null;

  // =====================================================
  // LOAD USERS
  // =====================================================

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/users`
        );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {
          setUsers(
            data.users || []
          );
        }
      } catch (error) {
        console.error(
          "Load Users Error:",
          error
        );
      }
    };

    loadUsers();
  }, []);

  // =====================================================
  // LOAD PROJECT TASKS
  // =====================================================

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/projects/${projectId}/tasks`
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load tasks."
        );
      }

      const formattedTasks =
        (data.records || []).map(
          (task) => ({
            id: task.id,

            taskName:
              task.task_name || "",

            description:
              task.description || "",

            assignedTo:
              task.assigned_user_id
                ? String(
                    task.assigned_user_id
                  )
                : "",

            assignedUserName:
              task.assigned_user_name ||
              "-",

            dueDate:
              task.due_date ||
              "",

            priority:
              Number(
                task.priority || 1
              ),

            status:
              task.status ||
              "TO-DO",

            createdDate:
              task.created_date ||
              task.created_at ||
              "",
          })
        );

      setTasks(
        formattedTasks
      );

    } catch (error) {

      console.error(
        "Load Tasks Error:",
        error
      );

      setTasks([]);

    } finally {

      setLoading(false);

    }
  };

  // =====================================================
  // RESET TASK FORM
  // =====================================================

  const resetForm = () => {
    setTaskName("");
    setDescription("");
    setAssignedTo("");
    setDueDate("");
    setPriority(1);
    setStatus("TO-DO");
    setEditingTask(null);
  };

  // =====================================================
  // OPEN NEW TASK
  // =====================================================

  const openNewTask = (
    selectedStatus = "TO-DO"
  ) => {

    resetForm();

    setStatus(
      selectedStatus
    );

    setShowForm(true);
  };

  // =====================================================
  // EDIT TASK
  // =====================================================

  const handleEdit = (task) => {

    setEditingTask(task);

    setTaskName(
      task.taskName || ""
    );

    setDescription(
      task.description || ""
    );

    setAssignedTo(
      task.assignedTo || ""
    );

    setDueDate(
      task.dueDate || ""
    );

    setPriority(
      task.priority || 1
    );

    setStatus(
      task.status || "TO-DO"
    );

    setShowForm(true);
  };

  // =====================================================
  // SAVE TASK
  // =====================================================

  const handleSaveTask = async () => {

    if (!projectId) {
      alert(
        "Please select a project first."
      );
      return;
    }

    if (!taskName.trim()) {
      alert(
        "Task Name is required."
      );
      return;
    }

    setSaving(true);

    try {

      // =================================================
      // EDIT EXISTING TASK
      // =================================================

      if (editingTask) {

        const response =
          await fetch(
            `${API_BASE}/api/tasks/${editingTask.id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status:
                  status,

                completed_date:
                  status ===
                  "COMPLETED"
                    ? new Date()
                        .toISOString()
                        .split("T")[0]
                    : null,
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
              "Task update failed."
          );
        }

        alert(
          "Task updated successfully."
        );

      } else {

        // =================================================
        // CREATE NEW TASK
        // =================================================

        const response =
          await fetch(
            `${API_BASE}/api/tasks`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                project_id:
                  projectId,

                task_name:
                  taskName.trim(),

                description:
                  description.trim(),

                assigned_user_id:
                  assignedTo
                    ? Number(
                        assignedTo
                      )
                    : null,

                status:
                  status,

                created_date:
                  new Date()
                    .toISOString()
                    .split("T")[0],

                completed_date:
                  status ===
                  "COMPLETED"
                    ? new Date()
                        .toISOString()
                        .split("T")[0]
                    : null,

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
              "Task save failed."
          );
        }

        alert(
          "Task created successfully."
        );
      }

      // =================================================
      // RELOAD FROM DATABASE
      // =================================================

      await loadTasks();

      setShowForm(false);

      resetForm();

    } catch (error) {

      console.error(
        "Task Save Error:",
        error
      );

      alert(
        `❌ ${error.message}`
      );

    } finally {

      setSaving(false);

    }
  };

  // =====================================================
  // DELETE TASK
  // =====================================================

  const handleDelete = (id) => {

    /*
      Current backend मध्ये DELETE TASK API नाही.
      त्यामुळे database task delete करण्याऐवजी
      आत्ता local delete करू नये.

      पुढच्या step मध्ये DELETE API add करू.
    */

    alert(
      "Task delete API next step मध्ये add करू."
    );
  };

  

    // =====================================================
  // DRAG & DROP TASK
  // =====================================================

 const handleDragStart = (e, taskId) => {
  e.stopPropagation();

  e.dataTransfer.setData(
    "text/plain",
    String(taskId)
  );

  e.dataTransfer.setData(
    "taskId",
    String(taskId)
  );

  e.dataTransfer.effectAllowed = "move";
};

 const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();

  e.dataTransfer.dropEffect = "move";
};


  const handleDrop = async (
  e,
  newStatus
) => {
  e.preventDefault();
  e.stopPropagation();

  const taskId = Number(
    e.dataTransfer.getData("taskId") ||
    e.dataTransfer.getData("text/plain")
  );

  if (!taskId) {
    console.log("No task ID found during drop");
    return;
  }

  const task = tasks.find(
    (item) => Number(item.id) === taskId
  );

  if (!task) {
    console.log("Task not found:", taskId);
    return;
  }

  if (task.status === newStatus) {
    return;
  }

  console.log(
    "Moving task:",
    task.taskName,
    "→",
    newStatus
  );

  await changeTaskStatus(
    taskId,
    newStatus
  );
};

  // =====================================================
  // MOVE TASK LEFT / RIGHT
  // =====================================================

  const moveTask = async (
    taskId,
    direction
  ) => {

    const task =
      tasks.find(
        (item) =>
          item.id === taskId
      );

    if (!task) {
      return;
    }

    const currentIndex =
      statuses.findIndex(
        (item) =>
          item === task.status
      );

    let newIndex =
      currentIndex +
      direction;

    if (newIndex < 0) {
      newIndex = 0;
    }

    if (
      newIndex >=
      statuses.length
    ) {
      newIndex =
        statuses.length - 1;
    }

    const newStatus =
      statuses[newIndex];

    if (
      newStatus ===
      task.status
    ) {
      return;
    }

    await changeTaskStatus(
      taskId,
      newStatus
    );
  };

  // =====================================================
  // ADD NEW STATUS
  // =====================================================

  const handleAddStatus = () => {

    const cleanStatus =
      newStatus
        .trim()
        .toUpperCase();

    if (!cleanStatus) {
      alert(
        "Please enter status name."
      );
      return;
    }

    if (
      statuses.includes(
        cleanStatus
      )
    ) {
      alert(
        "This status already exists."
      );
      return;
    }

    setStatuses(
      (previous) => [
        ...previous,
        cleanStatus,
      ]
    );

    setNewStatus("");

    setShowStatusForm(
      false
    );

    alert(
      "New status added successfully."
    );
  };

  // =====================================================
  // DELETE CUSTOM STATUS
  // =====================================================

  const handleDeleteStatus = (
    statusToDelete
  ) => {

    if (
      defaultStatuses.includes(
        statusToDelete
      )
    ) {
      alert(
        "Default status cannot be deleted."
      );
      return;
    }

    const statusTasks =
      tasks.filter(
        (task) =>
          task.status ===
          statusToDelete
      );

    if (
      statusTasks.length > 0
    ) {
      alert(
        "This status has tasks. Move those tasks first."
      );
      return;
    }

    const confirmDelete =
      window.confirm(
        `Delete "${statusToDelete}" status?`
      );

    if (!confirmDelete) {
      return;
    }

    setStatuses(
      (previous) =>
        previous.filter(
          (item) =>
            item !==
            statusToDelete
        )
    );
  };

  // =====================================================
  // GET TASKS BY STATUS
  // =====================================================

  const getTasksByStatus = (
    statusValue
  ) => {

    return tasks.filter(
      (task) =>
        task.status ===
        statusValue
    );
  };

  // =====================================================
  // PRIORITY STARS
  // =====================================================

  const renderStars = (
    priorityValue
  ) => {

    return (
      <div
        style={{
          display:
            "flex",
          gap:
            "2px",
          fontSize:
            "15px",
        }}
      >

        {[1, 2, 3].map(
          (star) => (

            <span
              key={star}
              style={{
                color:
                  star <=
                  priorityValue
                    ? "#f5b900"
                    : "#d1d5db",
              }}
            >
              ★
            </span>

          )
        )}

      </div>
    );
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div
      style={{
        width:
          "100%",
        minHeight:
          "100%",
        background:
          "#f5f6f7",
        padding:
          "15px",
        boxSizing:
          "border-box",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"
      >

        <div>

          <button
            type="button"
            className="btn btn-outline-secondary mb-2"
            onClick={onBack}
          >
            ← Back
          </button>

          <h2
            className="fw-bold mb-0"
            style={{
              fontSize:
                "28px",
            }}
          >
            ✅ Tasks
          </h2>

          {selectedProject && (

            <small
              className="text-secondary"
            >
              Project:{" "}
              <strong>
                {selectedProject.name}
              </strong>
            </small>

          )}

        </div>

        <div
          className="d-flex gap-2 flex-wrap"
        >

          {/* ADD STATUS */}

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() =>
              setShowStatusForm(
                true
              )
            }
          >
            ＋ Add Status
          </button>

          {/* NEW TASK */}

          <button
            type="button"
            className="btn btn-primary px-4"
            onClick={() =>
              openNewTask(
                "TO-DO"
              )
            }
            disabled={!projectId}
          >
            ＋ New Task
          </button>

        </div>

      </div>

      {/* =================================================
          NO PROJECT
      ================================================= */}

      {!projectId && (

        <div className="alert alert-warning">
          ⚠️ Please select a project from the Project Manager dashboard.
        </div>

      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="text-center py-4">
          Loading tasks...
        </div>

      )}

      {/* =================================================
          KANBAN BOARD
      ================================================= */}

      {!loading && projectId && (

        <div
          style={{
            width:
              "100%",
            overflowX:
              "auto",
            overflowY:
              "hidden",
            paddingBottom:
              "20px",
            WebkitOverflowScrolling:
              "touch",
          }}
        >

          <div
            style={{
              display:
                "flex",
              gap:
                "10px",
              alignItems:
                "flex-start",
              minWidth:
                `${statuses.length * 255}px`,
            }}
          >

            {statuses.map(
              (
                columnStatus
              ) => {

                const columnTasks =
                  getTasksByStatus(
                    columnStatus
                  );

                const isCustomStatus =
                  !defaultStatuses.includes(
                    columnStatus
                  );

                return (

                 <div
  key={columnStatus}
  onDragOver={handleDragOver}
  onDrop={(e) =>
    handleDrop(e, columnStatus)
  }
  style={{
    flex: "0 0 245px",
    width: "245px",
    background: "#f8f9fa",
    borderRadius: "6px",
    minHeight: "500px",
  }}
>

                    {/* COLUMN HEADER */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        padding:
                          "8px 8px 5px",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "7px",
                          minWidth:
                            0,
                        }}
                      >

                        <strong
                          style={{
                            fontSize:
                              "13px",
                            color:
                              "#374151",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            columnStatus
                          }
                        </strong>

                        <span
                          style={{
                            fontSize:
                              "12px",
                            fontWeight:
                              "700",
                            color:
                              "#111827",
                          }}
                        >
                          {
                            columnTasks.length
                          }
                        </span>

                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "3px",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            openNewTask(
                              columnStatus
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "transparent",
                            fontSize:
                              "20px",
                            fontWeight:
                              "700",
                            color:
                              "#4b5563",
                            cursor:
                              "pointer",
                            lineHeight:
                              "1",
                          }}
                          title="Create Task"
                        >
                          +
                        </button>

                        {isCustomStatus && (

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteStatus(
                                columnStatus
                              )
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              fontSize:
                                "13px",
                              color:
                                "#dc3545",
                              cursor:
                                "pointer",
                            }}
                            title="Delete Status"
                          >
                            ×
                          </button>

                        )}

                      </div>

                    </div>

                    {/* PROGRESS LINE */}

                    <div
                      style={{
                        height:
                          "7px",
                        background:
                          "#d9dcdf",
                        borderRadius:
                          "3px",
                        margin:
                          "0 8px 8px",
                      }}
                    />

                    {/* TASK CARDS */}

                    <div
                      style={{
                        padding:
                          "0 8px 10px",
                      }}
                    >

                      {columnTasks.length ===
                      0 ? (

                        <div
                          style={{
                            textAlign:
                              "center",
                            color:
                              "#9ca3af",
                            fontSize:
                              "12px",
                            padding:
                              "25px 5px",
                          }}
                        >
                          No tasks
                        </div>

                      ) : (

                        columnTasks.map(
                          (task) => (

                            <div
  key={task.id}
  draggable
  onDragStart={(e) =>
    handleDragStart(e, task.id)
  }
  style={{
                                background:
                                  "#ffffff",
                                border:
                                  "1px solid #d9dcdf",
                                marginBottom:
                                  "3px",
                                padding:
                                  "8px 7px 7px",
                                minHeight:
                                  "105px",
                                boxSizing:
                                  "border-box",
                                cursor:
                                  "grab",
                              }}
                            >

                              {/* TASK NAME */}

                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  color:
                                    "#111827",
                                  lineHeight:
                                    "1.35",
                                  marginBottom:
                                    "6px",
                                }}
                              >
                                {
                                  task.taskName
                                }
                              </div>

                              {/* DESCRIPTION */}

                              {task.description && (

                                <div
                                  style={{
                                    fontSize:
                                      "10px",
                                    color:
                                      "#6b7280",
                                    marginBottom:
                                      "5px",
                                    whiteSpace:
                                      "nowrap",
                                    overflow:
                                      "hidden",
                                    textOverflow:
                                      "ellipsis",
                                  }}
                                >
                                  {
                                    task.description
                                  }
                                </div>

                              )}

                              {/* DATE */}

                              {task.dueDate && (

                                <div
                                  style={{
                                    fontSize:
                                      "10px",
                                    color:
                                      "#6b7280",
                                    marginBottom:
                                      "5px",
                                  }}
                                >
                                  📅{" "}
                                  {
                                    task.dueDate
                                  }
                                </div>

                              )}

                              {/* BOTTOM */}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "space-between",
                                  gap:
                                    "5px",
                                }}
                              >

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap:
                                      "7px",
                                  }}
                                >

                                  <span
                                    style={{
                                      fontSize:
                                        "15px",
                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    ◷
                                  </span>

                                  {renderStars(
                                    task.priority
                                  )}

                                </div>

                                <span
                                  style={{
                                    width:
                                      "15px",
                                    height:
                                      "15px",
                                    borderRadius:
                                      "50%",
                                    border:
                                      "1px solid #c7cbd1",
                                    background:
                                      "#eef0f2",
                                  }}
                                />

                              </div>

                              {/* ASSIGNED */}

                              {task.assignedUserName !==
                                "-" && (

                                <div
                                  style={{
                                    marginTop:
                                      "5px",
                                    fontSize:
                                      "10px",
                                    color:
                                      "#6b7280",
                                  }}
                                >
                                  👤{" "}
                                  {
                                    task.assignedUserName
                                  }
                                </div>

                              )}

                              {/* ACTIONS */}

                              <div
                                className="d-flex gap-1 mt-2"
                              >

                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border"
                                  style={{
                                    fontSize:
                                      "10px",
                                    padding:
                                      "2px 6px",
                                  }}
                                  onClick={() =>
                                    handleEdit(
                                      task
                                    )
                                  }
                                >
                                  ✏️
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border"
                                  style={{
                                    fontSize:
                                      "10px",
                                    padding:
                                      "2px 6px",
                                  }}
                                  onClick={() =>
                                    moveTask(
                                      task.id,
                                      -1
                                    )
                                  }
                                >
                                  ←
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border"
                                  style={{
                                    fontSize:
                                      "10px",
                                    padding:
                                      "2px 6px",
                                  }}
                                  onClick={() =>
                                    moveTask(
                                      task.id,
                                      1
                                    )
                                  }
                                >
                                  →
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border"
                                  style={{
                                    fontSize:
                                      "10px",
                                    padding:
                                      "2px 6px",
                                  }}
                                  onClick={() =>
                                    handleDelete(
                                      task.id
                                    )
                                  }
                                >
                                  🗑️
                                </button>

                              </div>

                            </div>

                          )
                        )

                      )}

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>

      )}

      {/* =================================================
          ADD STATUS MODAL
      ================================================= */}

      {showStatusForm && (

        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.45)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "15px",
            zIndex:
              6000,
          }}
        >

          <div
            className="card border-0 shadow"
            style={{
              width:
                "100%",
              maxWidth:
                "450px",
              borderRadius:
                "14px",
            }}
          >

            <div
              className="card-header bg-white border-0 p-4"
            >

              <div
                className="d-flex justify-content-between align-items-center"
              >

                <h4 className="fw-bold mb-0">
                  ＋ Add Status
                </h4>

                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => {
                    setShowStatusForm(
                      false
                    );
                    setNewStatus("");
                  }}
                >
                  ×
                </button>

              </div>

            </div>

            <div
              className="card-body p-4"
            >

              <label className="form-label fw-semibold">
                Status Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Example: REVIEW"
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    handleAddStatus();
                  }
                }}
              />

              <small className="text-secondary">
                Status automatically capital letters मध्ये add होईल.
              </small>

            </div>

            <div
              className="card-footer bg-white border-0 p-4"
            >

              <div
                className="d-flex justify-content-end gap-2"
              >

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowStatusForm(
                      false
                    );
                    setNewStatus("");
                  }}
                >
                  ✕ Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={
                    handleAddStatus
                  }
                >
                  ＋ Add Status
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          CREATE / EDIT TASK MODAL
      ================================================= */}

      {showForm && (

        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.45)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "15px",
            zIndex:
              5000,
          }}
        >

          <div
            className="card border-0 shadow"
            style={{
              width:
                "100%",
              maxWidth:
                "650px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              borderRadius:
                "14px",
            }}
          >

            {/* HEADER */}

            <div
              className="card-header bg-white border-0 p-4"
            >

              <div
                className="d-flex justify-content-between align-items-center"
              >

                <div>

                  <h4 className="fw-bold mb-1">
                    {editingTask
                      ? "✏️ Edit Task"
                      : "➕ Create Task"}
                  </h4>

                  <small className="text-secondary">
                    Project:{" "}
                    <strong>
                      {selectedProject?.name ||
                        "-"}
                    </strong>
                  </small>

                </div>

                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => {
                    setShowForm(
                      false
                    );
                    resetForm();
                  }}
                  style={{
                    fontSize:
                      "20px",
                  }}
                >
                  ×
                </button>

              </div>

            </div>

            {/* BODY */}

            <div
              className="card-body p-4"
            >

              {/* TASK NAME */}

              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Task Name *
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter task name"
                  value={taskName}
                  onChange={(e) =>
                    setTaskName(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* DESCRIPTION */}

              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Description
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter task description"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* ASSIGN + DATE */}

              <div className="row g-3">

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Assign To
                  </label>

                  <select
                    className="form-select"
                    value={assignedTo}
                    onChange={(e) =>
                      setAssignedTo(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select User
                    </option>

                    {users.map(
                      (user) => (

                        <option
                          key={
                            user.id
                          }
                          value={
                            user.id
                          }
                        >
                          {user.name}

                          {user.role
                            ? ` (${user.role})`
                            : ""}

                        </option>

                      )
                    )}

                  </select>

                </div>

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Due Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* STATUS + PRIORITY */}

              <div className="row g-3 mt-1">

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Status
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

                    {statuses.map(
                      (item) => (

                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Priority
                  </label>

                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        Number(
                          e.target.value
                        )
                      )
                    }
                  >

                    <option value="1">
                      ★ Low
                    </option>

                    <option value="2">
                      ★★ Medium
                    </option>

                    <option value="3">
                      ★★★ High
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div
              className="card-footer bg-white border-0 p-4"
            >

              <div
                className="d-flex justify-content-end gap-2"
              >

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowForm(
                      false
                    );
                    resetForm();
                  }}
                  disabled={saving}
                >
                  ✕ Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={
                    handleSaveTask
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                    ? "✓ Update Task"
                    : "＋ Create Task"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Task;