const todoForm = document.getElementById('todo-form');
const pendingTasksList = document.getElementById('pending-tasks');
const completedTasksList = document.getElementById('completed-tasks');
const pendingSearch = document.getElementById('pending-search');
const pendingSearchBtn = document.getElementById('pending-search-btn');
const completedSearch = document.getElementById('completed-search');
const completedSearchBtn = document.getElementById('completed-search-btn');
let tasks = []; 

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
    const taskObj = { title: taskText, completed: false,};
        fetch('/api/todos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(taskObj)
    }).then(res => res.json()).then(data => {
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = taskText;
        li.setAttribute('draggable', 'true');
        li.addEventListener('dragstart', handleDragStart);
        pendingTasksList.appendChild(li);

        /*Adding an id (returned from mongo) to each task*/
        const newTaskObj = { id: data.id, title: taskText, completed: false };
        tasks.push(newTaskObj);
        li.dataset.id = data.id; /* Store the ID from the server */
    });
};

function addTasksOnReload(task)
{
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = task.title;
    li.setAttribute('draggable', 'true');
    li.addEventListener('dragstart', handleDragStart);
    li.dataset.id = task.id

    if(task.completed)
    {
        completedTasksList.appendChild(li);
    }
    else
    {
        pendingTasksList.appendChild(li);
    }
}
/***************Drag and Drop Handlers***************/
let draggedTask = { id: null, title: '', completed: false };

function handleDragStart(e) {
    const li = e.target.closest("li");
    if (!li) return;
    draggedTask.id = li.dataset.id;
    draggedTask.title = li.textContent;
    e.dataTransfer.setData('text/plain', draggedTask.title);
    e.dataTransfer.effectAllowed = 'move';
    li.classList.add("dragging");
}

completedTasksList.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});


completedTasksList.addEventListener('dragleave', () => completedTasksList.classList.remove("dragover"));

completedTasksList.addEventListener('drop', function(e) {
    e.preventDefault();
    if (draggedTask.id) {
        // Find the <li> element in pendingTasksList by data-id
        const li = pendingTasksList.querySelector(`li[data-id="${draggedTask.id}"]`);
        if (li) {
            pendingTasksList.removeChild(li);
            completedTasksList.appendChild(li);
        }

        // Find the task object in the array
        const idx = tasks.findIndex(t => t.id == draggedTask.id);
        if (idx !== -1) {
            tasks[idx].completed = true;
            markTaskCompleted(tasks[idx].id);
        }
        draggedTask = { id: null, title: '', completed: false };
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

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/todos')
        .then(res => res.json())
        .then(data => {
            tasks = data.map(task => ({
                id: task.id,
                title: task.title,
                completed: task.completed
            }));
            data.forEach(task => {
                addTasksOnReload({ 
                    id: task._id, 
                    title: task.title, 
                    completed: task.completed 
                });
            });
        });
});

function markTaskCompleted(taskID)
{
    fetch(`/api/todos/${taskID}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ completed: true })
    })
    .catch(error => {
        console.error('Error marking task as completed:', error);
    });
}

