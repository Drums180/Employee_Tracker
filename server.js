const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: '180203da',
        database: 'courses_db'
    },
    console.log(`Connected to the courses_db database.`)
);

