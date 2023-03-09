const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: '180203da',
        database: 'organigram_db'
    },
    console.log(`Connected to the organigram_db database.`)
);

// Prompt user to choose an option from the menu
function menu() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit',
      ],
    },
  ])
  .then((answer) => {
    switch (answer.option) {
      case 'View all departments':
        viewDepartments();
        break;
      case 'View all roles':
        viewRoles();
        break;
      case 'View all employees':
        viewEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        console.log('Goodbye!');
        db.end();  // close the database connection before exiting
        break;
      default:
        console.log(`Invalid action: ${answer.action}`);
        menu();
    }
  });
}

function viewDepartments() {
    db.query('SELECT id, name FROM department', (err, res) => {
      if (err) throw err;
  
      // Print formatted table of department names and ids
      console.table(res);
  
      // Return to menu after displaying results
      menu();
    });
}

function viewRoles() {
    const query = `
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;
    db.query(query, (err, res) => {
      if (err) throw err;
      console.table(res);
      menu();
    });
}

function viewEmployees() {
    db.query(
        `SELECT 
        employee.id,
        employee.first_name,
        employee.last_name,
        role.title,
        department.name AS department,
        role.salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
        FROM employee 
        LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_id = department.id 
        LEFT JOIN employee manager ON employee.manager_id = manager.id`,
      (err, rows) => {
        if (err) throw err;
        console.table(rows);
        menu();
      }
    );
}  

function addDepartment() {
    inquirer
    .prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the department you want to add?",
            validate: (input) => {
                if (!input) {
                    return "Please enter a valid department name";
                }
                return true;
          },
        },
    ])
    .then((answer) => {
        // Insert new department into the database
        const query = "INSERT INTO department (name) VALUES (?)";
        db.query(query, [answer.name], (err, res) => {
            if (err) throw err;
            console.log(`Successfully added ${answer.name} department!`);
            // Return to menu after adding department
            menu();
        });
    });
}

function addRole() {
    // Get the list of department names
    db.query('SELECT name FROM department', (err, rows) => {
      if (err) throw err;
      
      // Extract the department names from the result rows
      const departmentNames = rows.map((row) => row.name);
  
      // Prompt user for new role information
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Enter the title for the new role:',
          },
          {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the new role:',
          },
          {
            type: 'list',
            name: 'department',
            message: 'Select the department for the new role:',
            choices: departmentNames,
          },
        ])
        .then((answers) => {
          // Get the department ID for the selected department name
          const departmentName = answers.department;
          db.query('SELECT id FROM department WHERE name = ?', departmentName, (err, rows) => {
            if (err) throw err;
  
            const departmentId = rows[0].id;
  
            // Insert the new role into the database
            db.query(
              'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
              [answers.title, answers.salary, departmentId],
              (err, res) => {
                if (err) throw err;
                console.log(`Added ${answers.title} role.`);
                menu();
              }
            );
          });
        });
    });
}
  
function addEmployee() {
    // Get the list of roles
    db.query('SELECT * FROM role', (err, roleRows) => {
      if (err) throw err;
  
      // Extract the role titles from the result rows
      const roleTitles = roleRows.map((row) => row.title);
  
      // Get the list of managers
      db.query('SELECT * FROM employee', (err, employeeRows) => {
        if (err) throw err;
  
        // Extract the manager names from the result rows
        const managerNames = employeeRows.map((row) => `${row.first_name} ${row.last_name}`);
        
        // Add null as an option for the manager
        managerNames.unshift('null');
  
        // Prompt user for new employee information
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'firstName',
              message: 'Enter the employee first name:',
            },
            {
              type: 'input',
              name: 'lastName',
              message: 'Enter the employee last name:',
            },
            {
              type: 'list',
              name: 'role',
              message: 'Select the employee role:',
              choices: roleTitles,
            },
            {
              type: 'list',
              name: 'manager',
              message: 'Select the employee manager:',
              choices: managerNames,
            },
          ])
          .then((answers) => {
            // Get the role ID for the selected role title
            const roleRow = roleRows.find((row) => row.title === answers.role);
            const roleId = roleRow.id;
  
            // Get the employee ID for the selected manager name
            const managerRow = employeeRows.find((row) => `${row.first_name} ${row.last_name}` === answers.manager);
            const managerId = managerRow ? managerRow.id : null;
  
            // Insert the new employee into the database
            const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
            const values = [answers.firstName, answers.lastName, roleId, managerId];
            db.query(query, values, (err, result) => {
              if (err) throw err;
  
              console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`);
              menu();
            });
          });
      });
    });
}  

function updateEmployeeRole() {
    // Get the list of employees
    db.query('SELECT * FROM employee', (err, employeeRows) => {
      if (err) throw err;
  
      // Extract the employee names from the result rows
      const employeeNames = employeeRows.map((row) => `${row.first_name} ${row.last_name}`);
  
      // Get the list of roles
      db.query('SELECT * FROM role', (err, roleRows) => {
        if (err) throw err;
  
        // Extract the role titles from the result rows
        const roleTitles = roleRows.map((row) => row.title);
  
        // Prompt user for employee and new role information
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'employeeName',
              message: 'Select the employee to update:',
              choices: employeeNames,
            },
            {
              type: 'list',
              name: 'newRole',
              message: 'Select the new role:',
              choices: roleTitles,
            },
          ])
          .then((answers) => {
            // Get the employee ID for the selected employee name
            const employeeRow = employeeRows.find((row) => `${row.first_name} ${row.last_name}` === answers.employeeName);
            const employeeId = employeeRow.id;
  
            // Get the role ID for the selected role title
            const roleRow = roleRows.find((row) => row.title === answers.newRole);
            const roleId = roleRow.id;
  
            // Update the employee's role in the database
            const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
            const values = [roleId, employeeId];
            db.query(query, values, (err, result) => {
              if (err) throw err;
  
              console.log(`Updated ${answers.employeeName}'s role to ${answers.newRole}.`);
              menu();
            });
          });
      });
    });
}

// Call menu function to start the application
menu();
