const express = require("express");
const { request } = require("http");
const path = require("path");
const postman = require("postman");

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname,"myDatabase.db");
let db = null;

const initializeDBAndServer = async ()=>{
    try {
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database
        });
        app.listen(4000, ()=>{
            console.log("Server Running At http://localhost:4000/");
        });
    }catch(e){
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};


initializeDBAndServer();

app.get("/", async(request,response)=>{
    try{
        const getTodolist = `SELECT * FROM todo;`
        const dbResponse = await db.all(getTodolist);
        response.send(dbResponse);
    }catch(e){
        console.log(`DB ERROR : ${e.message}`)
        process.exit(1);
    }
});

app.get("/todo/:todoId/", async(request,response)=>{
    try {
        const {todoId} = request.params;
        const getTodolist = `SELECT * FROM todo WHERE id = ${todoId};`
        const dbResponse = await db.get(getTodolist);
        response.send(dbResponse);
    }catch(e){
        console.log(`DB ERROR : ${e.message}`)
        process.exit(1);
    }
});
app.post("/", async(request, response)=>{
    const createRow = request.body;
    const {id,todo,priority,status} = createRow;
    const createRowQuery = `INSERT
    INTO todo(id,todo,priority,status)
    VALUES(${id},'${todo}','${priority}','${status}');`;
    await db.run(createRowQuery);
    response.send("Row Created");
});

app.put("/todo/:todoId/", async(request,response)=>{
    const {todoId} = request.params;
    const requestBody = request.body;
    const {status} =  requestBody;
    const updateQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
    await db.run(updateQuery);
    response.send("Updated");
});

app.delete("/todo/:todoId/", async(request, response)=>{
    const {todoId} = request.params;
    console.log(todoId);
    const query = `DELETE FROM todo WHERE id = ${todoId};`;
    await db.run(query);
    response.send(`Row ${todoId} Has Been Deleted`);
});
