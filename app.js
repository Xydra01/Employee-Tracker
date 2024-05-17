// Import necessary modules
const inquirer = require('inquirer');
const { Client } = require('pg');
require('dotenv').config();

// Create a new PostgreSQL client
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to the PostgreSQL database
client.connect();

// Event listener for successful database connection
client.on('connect', () => {
  console.log('Connected to the database');
  // Start the application by calling the mainMenu function
  mainMenu();
});

// Functions to query our database
async function viewAllDepartments() {
  try {
    // Query to select all departments from the database
    const query = 'SELECT id, name FROM public.department';

    // Execute the query
    const result = await client.query(query);

    // Log the results
    console.table(result.rows);

    // Return to the main menu
    mainMenu();
  } catch (error) {
    console.error('Error viewing all departments:', error);
    mainMenu();
  }
}

async function viewAllRoles() {
  try {
    // Query to select all roles along with their department names from the database
    const query = `
      SELECT 
        role.id, 
        role.title, 
        role.salary, 
        public.department.name AS department 
      FROM 
        public.role 
      INNER JOIN 
        public.department ON role.department_id = department.id
    `;

    // Execute the query
    const result = await client.query(query);

    // Log the results
    console.table(result.rows);

    // Return to the main menu
    mainMenu();
  } catch (error) {
    console.error('Error viewing all roles:', error);
    mainMenu();
  }
}

async function viewAllEmployees() {
  try {
    // Query to select all employees with their corresponding roles and departments
    const query = `
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        r.title AS role, 
        d.name AS department, 
        r.salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM 
        public.employee AS e
      LEFT JOIN 
        public.role AS r ON e.role_id = r.id
      LEFT JOIN 
        public.department AS d ON r.department_id = d.id
      LEFT JOIN 
        public.employee AS m ON e.manager_id = m.id
    `;

    // Execute the query
    const result = await client.query(query);

    // Log the results
    console.table(result.rows);

    // Return to the main menu
    mainMenu();
  } catch (error) {
    console.error('Error viewing all employees:', error);
    mainMenu();
  }
}

async function addDepartment() {
  try {
    // Prompt the user to enter the name of the department
    const { departmentName } = await inquirer.prompt({
      name: 'departmentName',
      type: 'input',
      message: 'Enter the name of the department:',
    });

    // Query to insert the new department into the database
    const query = `
      INSERT INTO public.department (name)
      VALUES ($1)
      RETURNING *
    `;

    // Execute the query
    const result = await client.query(query, [departmentName]);

    // Log success message
    console.log(
      `Department '${departmentName}' added successfully with ID ${result.rows[0].id}`
    );

    // Return to the main menu
    mainMenu();
  } catch (error) {
    console.error('Error adding department:', error);
    mainMenu();
  }
}

async function addRole() {
  try {
    // Prompt the user to enter the details for the new role
    const { title, salary, departmentId } = await inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the title of the role:',
      },
      {
        name: 'salary',
        type: 'number',
        message: 'Enter the salary for the role:',
      },
      {
        name: 'departmentId',
        type: 'number',
        message: 'Enter the department ID for the role:',
      },
    ]);

    // Query to insert the new role into the database
    const query = `
      INSERT INTO role (title, salary, department_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    // Execute the query
    const result = await client.query(query, [title, salary, departmentId]);

    // Log success message
    console.log(
      `Role '${title}' added successfully with ID ${result.rows[0].id}`
    );

    // Return to the main menu
    mainMenu();
  } catch (error) {
    console.error('Error adding role:', error);
    mainMenu();
  }
}

async function addEmployee() {
  try {
    // Prompt the user to enter the details for the new employee
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
      {
        name: 'firstName',
        type: 'input',
        message: "Enter the employee's first name:",
      },
      {
        name: 'lastName',
        type: 'input',
        message: "Enter the employee's last name:",
      },
      {
        name: 'roleId',
        type: 'number',
        message: "Enter employee's role ID:",
      },
      {
        name: 'managerId',
        type: 'number',
        message:
          "Enter the employee's manager's ID (optional, leave blank if none):",
        default: null,
      },
    ]);

    // Query to insert the new employee into the database
    const query = `
      INSERT INTO employee (first_name, last_name, role_id, manager_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    // Execute the query
    const result = await client.query(query, [
      firstName,
      lastName,
      roleId,
      managerId,
    ]);

    // Log success message
    console.log(
      `Employee '${firstName} ${lastName}' added successfully with ID ${result.rows[0].id}`
    );

    // Return to the main menu
    mainMenu();
  } catch (error) {
    console.error('Error adding employee:', error);
    mainMenu();
  }
}

async function updateEmployeeRole() {
  try {
    // Get the list of employees from the database
    const employees = await client.query(
      'SELECT id, first_name, last_name FROM employee'
    );

    // Prompt the user to select an employee to update
    const { employeeId, roleId } = await inquirer.prompt([
      {
        name: 'employeeId',
        type: 'list',
        message: 'Select the employee to update:',
        choices: employees.rows.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
      {
        name: 'roleId',
        type: 'number',
        message: 'Enter the new role ID for the employee:',
      },
    ]);

    // Update the employee's role in the database
    const query = `
      UPDATE employee
      SET role_id = $1
      WHERE id = $2
    `;
    await client.query(query, [roleId, employeeId]);

    // Log success message
    console.log(`Employee's role updated successfully`);

    // Return to the main menu
    mainMenu();
  } catch (error) {
    console.error('Error updating employee role:', error);
    mainMenu();
  }
}

// Function to display main menu and handle user input
async function mainMenu() {
  try {
    const { choice } = await inquirer.prompt({
      name: 'choice',
      type: 'list',
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
    });

    switch (choice) {
      case 'View all departments':
        await viewAllDepartments();
        break;
      case 'View all roles':
        await viewAllRoles();
        break;
      case 'View all employees':
        await viewAllEmployees();
        break;
      case 'Add a department':
        await addDepartment();
        break;
      case 'Add a role':
        await addRole();
        break;
      case 'Add an employee':
        await addEmployee();
        break;
      case 'Update an employee role':
        await updateEmployeeRole();
        break;
      case 'Exit':
        console.log('Goodbye!');
        // Close the PostgreSQL client before exiting
        await client.end();
        break;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    // Close the PostgreSQL client before exiting
    await client.end();
  }
}

// Start the application by connecting to the database
