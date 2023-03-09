USE organigram_db;

INSERT INTO department (name)
VALUES ("Production"),
       ("Finances"),
       ("Marketing"),
       ("Human Resources");

INSERT INTO role (title, salary, department_id)
VALUES ("Sells Manager", 8000, 2),
       ("Lead Engineer", 10000, 1),
       ("Web Developer", 3000, 1),
       ("Digital Design", 2000, 3),
       ("Local Manager", 5000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("David", "Dominguez", 2, null),
       ("Mariana", "Rodriguez", 4, null),
       ("Gerardo", "Guevara", 5, null),
       ("Javier", "Díaz", 3, null),
       ("Chechy", "Juarez", 1, null);
