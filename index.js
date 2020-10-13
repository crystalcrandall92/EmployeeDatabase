var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "trag544",
    database: "employee_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    startEmployeeApp();
});

function startEmployeeApp() {
    inquirer
        .prompt({
            name: "userInput",
            type: "list",
            message: "What would you like to do?",
            choices: ["View ALL current Employees",
                "View ALL Employees by Department",
                // "View ALL Employees by Manager",
                "ADD an Employee",
                "UPDATE Employee Role",
                "ADD a Department",
                "REMOVE a Department",
                "View ALL Departments",
                "ADD a role",
                "REMOVE a role",
                "View ALL Roles",
                "EXIT"]
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.userInput === "View ALL current Employees") {
                allEmployees();
            }
            else if (answer.userInput === "View ALL Employees by Department") {
                employeeDepartment();
            }
            // else if (answer.userInput === "View ALL Employees by Manager") {
            //     employeeManager();
            // }
            else if (answer.userInput === "ADD an Employee") {
                addEmployee();
            }
            else if (answer.userInput === "UPDATE Employee Role") {
                updateEmployee();
            }
            else if (answer.userInput === "ADD a Department") {
                addDepartment();
            }
            else if (answer.userInput === "View ALL Departments") {
                allDepartments();
            }
            else if (answer.userInput === "REMOVE a Department") {
                removeDepartment();
            }
            else if (answer.userInput === "ADD a role") {
                addRole();
            }
            else if (answer.userInput === "REMOVE a role") {
                removeRole();
            }
            else if (answer.userInput === "View ALL Roles") {
                allRoles();
            }
            else if (answer.userInput === "EXIT") {
                connection.end();
            }
        });
}

//Functions for all possible userInput

function allEmployees() {
    const query = "SELECT e.id, e.first_name, e.last_name, department.name AS department, role.title, role.salary, m.first_name AS manager_first_name,  m.last_name AS manager_last_name from employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id=role.id INNER JOIN department ON department.id=role.department_id";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        startEmployeeApp();
    })
};

// if looking up via department need to run a prompt for department name from a list
// list vs typing will help reduce possible spelling errors 
function employeeDepartment() {
    var query = "SELECT * FROM department"
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentsOptions = res.map(departmentsName => {
            return { name: departmentsName.name, value: departmentsName.id }
        })
        inquirer
            .prompt([
                {
                    name: "department",
                    type: "list",
                    message: "What is the name of the department?",
                    choices: departmentsOptions
                },
            ])
            .then(function (departmentAnswer) {
                console.log(departmentAnswer.department)
                let query = "SELECT e.id, e.first_name, e.last_name, department.name AS department, role.title, role.salary, m.first_name AS manager_first_name,  m.last_name AS manager_last_name from employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id=role.id INNER JOIN department ON department.id=role.department_id WHERE department.id=?";
                connection.query(query, departmentAnswer.department, function (err, res) {
                    if (err) throw err;
                    console.table(res);
                    startEmployeeApp();
                });

            });
    })
};

// function employeeManager() {
//     inquirer
//         .prompt([
//             {
//                 name: "manager_id",
//                 type: "list",
//                 message: "Who is your employee's manager?",
//                 choices: managerList
//             },
//         ])
//         .then(function (managerSearch) {
//             console.log(managerSearch.firstnameManager + ", " + managerSearch.lastnameManager)
//             const query = "SELECT e.id, e.first_name, e.last_name, department.name AS department, role.title, role.salary, m.first_name AS manager_first_name,  m.last_name AS manager_last_name from employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id=role.id INNER JOIN department ON department.id=role.department_id WHERE m.first_name=? AND m.last_name=?";
//             connection.query(query, [managerSearch.firstnameManager, managerSearch.lastnameManager], function (err, res) {
//                 if (err) throw err;
//                 console.table(res);
//                 startEmployeeApp();
//             });
//         });
// };

function addEmployee() {
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        const roleList = res.map(role => { return { name: role.title, value: role.id } })
        inquirer
            .prompt([
                {
                    name: "first_name",
                    type: "input",
                    message: "What is the employee's first name?"
                },
                {
                    name: "last_name",
                    type: "input",
                    message: "What is the employee's last name?"
                },
                {
                    name: "role",
                    type: "list",
                    message: "What is the employee's role id?",
                    choices: roleList
                },
                {
                    name: "manager",
                    type: "input",
                    message: "Who will be this employee's manager?"
                }])
            .then(function (empADD) {
                var query = "INSERT INTO employee SET ?";
                connection.query(query, { first_name: empADD.first_name, last_name: empADD.last_name, role_id: empADD.role, manager_id: empADD.manager }, function (err, res) {
                    if (err) {
                        return console.error(err.message)
                    }
                    console.log("Added Employee: " + empADD.first_name + ", " + empADD.last_name);
                    startEmployeeApp();
                });
            });
    })
}

// function removeEmployee() {
//     const query = "SELECT * FROM employee"
//     connection.query(query, function (err, res) {
//         if (err) throw err
//         let employeeList = []
//         res.forEach((element) => {
//             let title = element.id + element.first_name + element.last_name
//             employeeList.push(title)
//         });
//         return inquirer.prompt([
//             {
//                 name: "deleteEMP",
//                 type: "list",
//                 message: "Which role would you like to delete?",
//                 choices: employeeList
//             }
//         ]).then(function (empTBD) {
//             console.log(empTBD)
//             // need to be able to return id, first_name, last_name for delete in callback
//             connection.query("DELETE FROM employee WHERE employee.id = ? ", empTBD.deleteEMP, function (err, res) {
//                 if (err) throw err;
//                 startEmployeeApp();
//             })
//         })
//     })
// }



function updateEmployee() {
    const query = "SELECT * FROM department"
    connection.query(query, function (err, res) {
        if (err) throw err
        const employeeList = res.map(employee => {
            return { name: `${employee.first_name} ${employee.last_name}`, value: employee.id }
        })
        connection.query("SELECT * FROM role", function (err, res) {
            if (err) throw err
            const roleList = res.map(role => { return { name: role.title, value: role.id } })
            inquirer
                .prompt([
                    {
                        name: "id",
                        type: "list",
                        message: "Which employee would you like to update?",
                        choices: employeeList
                    },
                    {
                        name: "role_id",
                        type: "list",
                        message: "What is the employee's new role?",
                        choices: roleList
                    }
                ])
                .then(function (updatedEmp) {
                    connection.query("UPDATE employee SET role_id=? WHERE id=?", [updatedEmp.role_id, updatedEmp.id], function (err) {
                        if (err) throw err
                        console.log("Updated to following:" + updatedEmp.role_id + updatedEmp.id)
                        startEmployeeApp();
                    }
                    );
                });
        })
    })

}


// FUNCTIONS FOR DEPARTMENTS, ADD, REMOVE, VIEW ALL

function addDepartment() {
    inquirer
        .prompt([
            {
                name: "name",
                type: "input",
                message: "What is the name of the department you would like to add?"
            }
        ])
        .then(function (departmentUserinput) {
            const query = "INSERT INTO department SET ?"
            connection.query(query, departmentUserinput, function (err, res) {
                if (err) throw err;
                console.log(departmentUserinput)
                startEmployeeApp();
            })
        })
}

function removeDepartment() {
    const query = "SELECT * FROM department"
    connection.query(query, function (err, res) {
        if (err) throw err
        var deptartmentList = [];
        res.forEach((element) => {
            var name = element.name
            deptartmentList.push(name)
        });
        return inquirer.prompt([
            {
                name: "deleteDPT",
                type: "list",
                message: "Which deptartment would you like to delete?",
                choices: deptartmentList
            }
        ]).then(function (departmentTBD) {
            connection.query("DELETE FROM department WHERE department.name = ?", departmentTBD.deleteDPT, function (err, res) {
                if (err) throw err;
                startEmployeeApp();
            })
        })
    })
}

function allDepartments() {
    const query = "SELECT * FROM department"
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        startEmployeeApp();
    })
}

// FUNCTIONS FOR ROLES, ADD, REMOVE, VIEW ALL

function addRole() {
    let query = "SELECT * FROM department;"
    connection.query(query, function (err, res) {
        if (err) throw err;
        // Using same res.map from function employeeDepartment()
        const departmentInputlist = res.map(departmentsName => {
            return { name: departmentsName.name, value: departmentsName.id }
        })
        inquirer
            .prompt([
                {
                    name: "title",
                    type: "input",
                    message: "What is the role of this job?"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "What is the salary for this job?"
                },
                {
                    name: "department_id",
                    type: "list",
                    message: "What department does this role belong to?",
                    choices: departmentInputlist

                }
            ])
            .then(function (rolenameAdded) {
                connection.query(`INSERT INTO role SET ?`, rolenameAdded, function (err, res) {
                    if (err) throw err;
                    console.table(res);
                    startEmployeeApp();
                });
            });
    });
}

function removeRole() {
    const query = "SELECT role.title FROM role"
    connection.query(query, function (err, res) {
        if (err) throw err
        let roleList = []
        res.forEach((element) => {
            let title = element.title
            roleList.push(title)
        });
        return inquirer.prompt([
            {
                name: "deleteRLE",
                type: "list",
                message: "Which role would you like to delete?",
                choices: roleList
            }
        ]).then(function (roleTBD) {
            connection.query("DELETE FROM role WHERE role.title = ?", roleTBD.deleteRLE, function (err, res) {
                if (err) throw err;
                startEmployeeApp();
            })
        })
    })
}

// allRoles similar to other view all's
function allRoles() {
    const query = "SELECT * FROM role"
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        startEmployeeApp();
    })
}