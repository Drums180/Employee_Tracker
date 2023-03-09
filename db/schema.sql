-- Drops the inventory_db if it exists currently --
DROP DATABASE IF EXISTS organigram_db;
-- Creates the inventory_db database --
CREATE DATABASE organigram_db;

-- use inventory_db database --
USE organigram_db;

-- Creates the table "department" within organigram_db --
CREATE TABLE department (
  -- Creates a numeric column called "id" --
  id INT NOT NULL AUTO_INCREMENT,
  -- Makes a string column called "name" which cannot contain null --
  name VARCHAR(30) NOT NULL,
  -- Defines primary key of the table to "id" --
  PRIMARY KEY (id)
);

-- Creates the table "role" within organigram_db --
CREATE TABLE role (
  -- Creates a numeric column called "id" --
  id INT NOT NULL AUTO_INCREMENT,
  -- Makes a string column called "title" which cannot contain null --
  title VARCHAR(30) NOT NULL,
  -- Makes a int column called "salary" which cannot contain null --
  salary DECIMAL(8,2) NOT NULL,
  -- Defines primary key of the table to "id" --
  PRIMARY KEY (id),
  
  -- Takes id from the table "department" --
  department_id INT,
  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE SET NULL
);

-- Creates the table "employee" within organigram_db --
CREATE TABLE employee (
  -- Creates a numeric column called "id" --
  id INT NOT NULL AUTO_INCREMENT,
  -- Makes a string column called "first_name" which cannot contain null --
  first_name VARCHAR(30) NOT NULL,
  -- Makes a string column called "last_name" which cannot contain null --
  last_name VARCHAR(30) NOT NULL,
  -- Defines primary key of the table to "id" --
  PRIMARY KEY (id),

  -- Makes a int column called "salary" which cannot contain null --
  role_id INT,
  FOREIGN KEY (role_id)
  REFERENCES role(id),

  -- Defines foreign key to "employee" table's id column (self-referencing) --
  manager_id INT,
  FOREIGN KEY (manager_id)
  REFERENCES employee(id)
);
