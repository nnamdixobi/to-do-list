// Open a database connection
const db = openDatabase('todolist', '1.0', 'To-Do List Database', 2 * 1024 * 1024);

// Create the task table if it doesn't exist
db.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, task TEXT)');
});

// Function to add a task to the database
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();

    if (task !== '') {
        db.transaction(function(tx) {
            tx.executeSql('INSERT INTO tasks (task) VALUES (?)', [task], function(tx, results) {
                // Clear the input field
                taskInput.value = '';

                // Reload tasks
                displayTasks();
            });
        });
    }
}

// Function to display tasks
function displayTasks() {
    const taskList = document.getElementById('taskList');

    // Clear the existing list
    taskList.innerHTML = '';

    // Retrieve tasks from the database
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM tasks', [], function(tx, results) {
            const len = results.rows.length;

            for (let i = 0; i < len; i++) {
                const task = results.rows.item(i);
                const li = document.createElement('li');
                li.setAttribute('data-task-id', task.id); // Add a data attribute for easier access in animations
                li.innerHTML = `<span>${task.task}</span><button onclick="deleteTask(${task.id})">Delete</button>`;
                taskList.appendChild(li);
            }
        });
    });
}

// Function to delete a task
function deleteTask(id) {
    db.transaction(function(tx) {
        tx.executeSql('DELETE FROM tasks WHERE id = ?', [id], function(tx, results) {
            // Animation: Scale down the deleted task
            const taskToDelete = document.querySelector(`li[data-task-id="${id}"]`);
            taskToDelete.classList.add('deleted');
            
            // Delay removing the element to allow the animation to finish
            setTimeout(function() {
                taskToDelete.remove();
            }, 400);
            
            // Reload tasks
            displayTasks();
        });
    });
}

// Add task event listener
document.getElementById('addTask').addEventListener('click', addTask);

// Initial display of tasks
displayTasks();
