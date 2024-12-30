// DOM Elements
const listContainer = document.getElementById("liste");
const wrapperTask = document.getElementById("wrapper-task");
const listInput = document.getElementById("list-input");
const taskInput = document.getElementById("task-input");
const addListButton = document.getElementById("add-list");
const addTaskButton = document.getElementById("add-task");

let activeTaskZone = null; // Variable pour suivre la liste active

// Save all lists and tasks to localStorage
function saveToLocalStorage() {
  const lists = {};

  // Save each task-zone with its tasks
  document.querySelectorAll(".task-zone").forEach((taskZone) => {
    const listId = taskZone.id;
    const tasks = [];

    taskZone.querySelectorAll(".task-item").forEach((task) => {
      tasks.push({
        text: task.querySelector(".task-text").textContent,
        done: task.classList.contains("done"),
      });
    });

    lists[listId] = {
      name: document
        .querySelector(`li[data-list-id="${listId}"]`)
        .textContent.trim(),
      tasks,
    };
  });

  localStorage.setItem("todoLists", JSON.stringify(lists));
}

// Load lists and tasks from localStorage
function loadFromLocalStorage() {
  const lists = JSON.parse(localStorage.getItem("todoLists")) || {};

  Object.keys(lists).forEach((listId) => {
    const listData = lists[listId];

    // Create the list button
    const selectList = document.createElement("button");
    selectList.className = "select-list";

    const newList = document.createElement("li");
    newList.textContent = listData.name;
    newList.dataset.listId = listId;

    selectList.addEventListener("click", () => {
      selectListActive(listId, selectList, taskZone);
    });

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("id", "delete-btn");
    deleteButton.innerHTML = `<img src="/SVG icons/trash-solid.svg" class="delete-icon" alt="Supprimer" />`;
    deleteButton.addEventListener("click", () => {
      newList.remove();
      document.getElementById(listId).remove();
      saveToLocalStorage();
    });

    newList.appendChild(deleteButton);
    listContainer.appendChild(selectList);
    selectList.appendChild(newList);

    // Add click event for selecting a list
    selectList.addEventListener("click", () => {
      selectListActive(listId, selectList, taskZone);
    });

    // Create the task-zone
    const taskZone = document.createElement("ul");
    taskZone.id = listId;
    taskZone.className = "task-list task-zone hidden";

    // Load tasks into the task-zone
    listData.tasks.forEach((taskData) => {
      const newTask = createTaskElement(taskData.text, taskData.done);
      taskZone.appendChild(newTask);
    });

    wrapperTask.appendChild(taskZone);
  });
}

// Create a new task element
function createTaskElement(text, done = false) {
  const newTask = document.createElement("li");
  newTask.className = "task-item";
  if (done) newTask.classList.add("done");

  const checkboxLabel = document.createElement("label");
  checkboxLabel.className = "custom-checkbox";

  const checkboxInput = document.createElement("input");
  checkboxInput.type = "checkbox";
  checkboxInput.checked = done;

  const checkboxMark = document.createElement("span");
  checkboxMark.className = "checkbox-mark";

  checkboxLabel.appendChild(checkboxInput);
  checkboxLabel.appendChild(checkboxMark);

  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = text;

  const closeButton = document.createElement("button");
  closeButton.setAttribute("id", "close-button");
  closeButton.innerHTML = `<img src="/SVG icons/xmark-solid.svg" class="x-mark" alt="Supprimer" />`;
  closeButton.addEventListener("click", () => {
    newTask.remove();
    saveToLocalStorage();
  });

  newTask.appendChild(checkboxLabel);
  newTask.appendChild(taskText);
  newTask.appendChild(closeButton);

  checkboxInput.addEventListener("click", () => {
    newTask.classList.toggle("done");
    saveToLocalStorage();
  });

  return newTask;
}

// Add a new list
function ajoutList() {
  if (listInput.value.trim() !== "") {
    const listId = `list-${Date.now()}`;

    const selectList = document.createElement("button");
    selectList.className = "select-list";

    const newList = document.createElement("li");
    newList.textContent = listInput.value;
    newList.dataset.listId = listId;

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("id", "delete-btn");
    deleteButton.innerHTML = `<img src="/SVG icons/trash-solid.svg" class="delete-icon" alt="Supprimer" />`;
    deleteButton.addEventListener("click", () => {
      newList.remove();
      document.getElementById(listId).remove();
      saveToLocalStorage();
    });

    newList.appendChild(deleteButton);
    listContainer.appendChild(selectList);
    selectList.appendChild(newList);

    const taskZone = document.createElement("ul");
    taskZone.id = listId;
    taskZone.className = "task-list task-zone hidden"; // Masqué par défaut
    wrapperTask.appendChild(taskZone);

    selectList.addEventListener("click", () => {
      selectListActive(listId, selectList, taskZone);
    });

    selectListActive(listId, selectList, taskZone);

    saveToLocalStorage();
    listInput.value = "";
  }
}

// Add a new task
function ajoutTask() {
  if (!activeTaskZone) {
    alert("Veuillez sélectionner une liste !");
    return;
  }

  if (taskInput.value.trim() !== "") {
    const newTask = createTaskElement(taskInput.value);
    activeTaskZone.appendChild(newTask);
    saveToLocalStorage();
    taskInput.value = "";
  }
}

// Add tasks and lists with Enter key
listInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") ajoutList();
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") ajoutTask();
});

// Event listeners
addListButton.addEventListener("click", ajoutList);
addTaskButton.addEventListener("click", ajoutTask);

// Load tasks and lists on page load
document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
});

// Fonction pour appliquer les filtres
function applyFilters() {
  if (!activeTaskZone) return; // Si aucune liste active, ne rien faire

  const activeFilter = document.querySelector(".filter.active").id; // Ex: "filter-all"
  activeTaskZone.querySelectorAll(".task-item").forEach((task) => {
    if (activeFilter === "filter-all") {
      task.style.display = "flex"; // Affiche toutes les tâches
    } else if (activeFilter === "filter-done") {
      task.style.display = task.classList.contains("done") ? "flex" : "none";
    } else if (activeFilter === "filter-not-done") {
      task.style.display = !task.classList.contains("done") ? "flex" : "none";
    }
  });
}

// Ajouter les écouteurs sur les filtres
document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    // Supprime la classe active de tous les boutons
    document
      .querySelectorAll(".filter")
      .forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active"); // Ajoute la classe active au bouton cliqué

    applyFilters(); // Applique le filtre
  });
});

// Appeler applyFilters après chaque modification
function createTaskElement(text, done = false) {
  const newTask = document.createElement("li");
  newTask.className = "task-item";
  if (done) newTask.classList.add("done");

  const checkboxLabel = document.createElement("label");
  checkboxLabel.className = "custom-checkbox";

  const checkboxInput = document.createElement("input");
  checkboxInput.type = "checkbox";
  checkboxInput.checked = done;

  const checkboxMark = document.createElement("span");
  checkboxMark.className = "checkbox-mark";

  checkboxLabel.appendChild(checkboxInput);
  checkboxLabel.appendChild(checkboxMark);

  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = text;

  const closeButton = document.createElement("button");
  closeButton.setAttribute("id", "close-button");
  closeButton.innerHTML = `<img src="/SVG icons/xmark-solid.svg" class="x-mark" alt="Supprimer" />`;
  closeButton.addEventListener("click", () => {
    newTask.remove();
    saveToLocalStorage();
    applyFilters(); // Met à jour les tâches visibles
  });

  newTask.appendChild(checkboxLabel);
  newTask.appendChild(taskText);
  newTask.appendChild(closeButton);

  checkboxInput.addEventListener("click", () => {
    newTask.classList.toggle("done");
    saveToLocalStorage();
    applyFilters(); // Met à jour les tâches visibles
  });

  return newTask;
}

function selectListActive(listId, selectList, taskZone) {
  console.log(`Liste active : ${listId}`); // Exemple : log pour voir quelle liste est activée
  // Masque toutes les zones de tâches
  document.querySelectorAll(".task-zone").forEach((zone) => {
    zone.classList.add("hidden");
  });

  // Retire la classe active de toutes les listes
  document.querySelectorAll(".select-list").forEach((btn) => {
    btn.classList.remove("active-list");
  });

  // Ajoute la classe active à la liste sélectionnée
  selectList.classList.add("active-list");
  taskZone.classList.remove("hidden"); // Affiche la zone de tâches correspondante
  activeTaskZone = taskZone; // Met à jour la liste active
}
