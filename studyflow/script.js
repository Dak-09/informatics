const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("studyflowTasks")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("studyflowTasks", JSON.stringify(tasks));
}

function updateTaskCount() {
  taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }
  return tasks;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<li class="empty">No tasks found</li>';
    updateTaskCount();
    return;
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
        <div>
          <div class="task-text">${task.text}</div>
          <div class="task-date">Deadline: ${task.date}</div>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
    `;

    taskList.appendChild(li);
  });

  updateTaskCount();
}

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = taskInput.value.trim();
  const date = dateInput.value;

  if (!text || !date) return;

  const newTask = {
    id: Date.now(),
    text,
    date,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  dateInput.value = "";
});

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

clearCompletedBtn.addEventListener("click", function () {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

filterButtons.forEach(button => {
  button.addEventListener("click", function () {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.dataset.filter;
    renderTasks();
  });
});

renderTasks();