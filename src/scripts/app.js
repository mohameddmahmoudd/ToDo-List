const todoForm = document.getElementById('todo-form');
const pendingTasksList = document.getElementById('pending-tasks');
const completedTasksList = document.getElementById('completed-tasks');
const pendingSearch = document.getElementById('pending-search');
const pendingSearchBtn = document.getElementById('pending-search-btn');
const completedSearch = document.getElementById('completed-search');
const completedSearchBtn = document.getElementById('completed-search-btn');


todoForm.onsubmit = function(event) {
    event.preventDefault(); /*prevent reloading*/
    const newTask = document.getElementById('todo-input').value;
    if (newTask){
        addTask(newTask);
        document.getElementById('todo-input').value = ''; /*Clear input*/
    }
};


function addTask(taskText) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = taskText;
    li.setAttribute('draggable', 'true');
    li.addEventListener('dragstart', handleDragStart);
    pendingTasksList.appendChild(li);
}


/***************Drag and Drop Handlers***************/
let draggedTask = null;

function handleDragStart(e) {
    draggedTask = e.target.closest("li");

    if (!draggedTask) return;
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.dataTransfer.effectAllowed = 'move';
    draggedTask.classList.add("dragging");
}

completedTasksList.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});


completedTasksList.addEventListener('dragleave', () => completedTasksList.classList.remove("dragover"));

completedTasksList.addEventListener('drop', function(e) {
    e.preventDefault();
    if (draggedTask) {
        // Remove from pending
        pendingTasksList.removeChild(draggedTask);
        completedTasksList.classList.remove("dragover");
        // Add to completed
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = draggedTask.textContent;
        completedTasksList.appendChild(li);
        draggedTask = null;
    }
});


/******************* Search Pending Tasks **************************/
pendingSearchBtn.onclick = function(e) 
{
    e.preventDefault();
    let term = pendingSearch.value.toLowerCase();
    for (let task of pendingTasksList.getElementsByTagName('li')) {
        if (task.textContent.toLowerCase().includes(term)) {
            task.style.display = 'flex'; 
            task.style.setProperty('display', 'flex', 'important');
        } else {
            task.style.setProperty('display', 'none', 'important'); /* Hide with !important overriding default display styles */
        }
    }
}

/*Optional: Search while typing*/
/*
function filterPendingTasks() {
    const term = pendingSearch.value.toLowerCase();
    for (let task of pendingTasksList.getElementsByTagName('li')) {
        if (task.textContent.toLowerCase().includes(term)) {
            task.style.display = 'flex'; // Show (matches Bootstrap)
        } else {
            task.style.display = 'none'; // Hide
        }
    }
}

pendingSearch.oninput = filterPendingTasks;
pendingSearchBtn.onclick = function(e) {
    e.preventDefault();
    filterPendingTasks();
};
*/

/* Search Completed Tasks */
completedSearchBtn.onclick = function(e) {
    e.preventDefault();
    let term = completedSearch.value.toLowerCase();
    for (let task of completedTasksList.getElementsByTagName('li')) {
        if (task.textContent.toLowerCase().includes(term)) {
            task.style.display = 'flex'; 
            task.style.setProperty('display', 'flex', 'important');
        } else {
            task.style.setProperty('display', 'none', 'important');
        }   
    }
};