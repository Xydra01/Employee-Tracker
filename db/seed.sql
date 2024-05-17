-- Insert departments
INSERT INTO department (name) VALUES
    ('Engineering'),
    ('Sales'),
    ('Marketing');

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES
    ('Software Engineer', 80000, 1),
    ('Sales Associate', 50000, 2),
    ('Marketing Manager', 70000, 3);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Mike', 'Johnson', 3, 3);