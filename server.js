import { Permit } from "permitio";
import express from "express";
import cors from "cors";
import {config} from "dotenv";
config();

const app = express();


const token = process.env.VITE_PERMIT_TOKEN;
const permit = new Permit({
    // your API Key
    token: process.env.VITE_PERMIT_TOKEN,
    pdp: "https://cloudpdp.api.permit.io",

});

app.use(cors());
app.use(express.json());

//check for permissions
app.get("/check-permission/:id/:operation" , async(req , res) => {


    const id = req.params.id;
    const operation = req.params.operation;
    console.log(id);
    console.log(operation);
    try{
        const permitted = await permit.check( String(id) , String(operation) , {
            type: "todo",
            tenant: "todo-tenant",
          });
        console.log(permitted);
        if (permitted) {
            res.status(200).json({
                "status" : "permitted"
            })
        } else {
            res.status(200).json({
                "status" : "not-permitted"
            })
        }
    }catch(err){
        res.status(500).json({
            "problem": "internal server error",
            "error" : err
        })
    }
})

app.post("/create-user-employee" , async(req , res) => {

    const data = req.body.data;
    
    const user = {
        key: data.user.id ,
        email: data.user.email ,
    }

    const assignedRole = {
        role : "Employee",
        tenant : "todo-tenant",
        user : data.user.id
    }

    try{
    
            await permit.api.createUser(user);
            const response1 = await permit.api.assignRole(JSON.stringify(assignedRole));
            const users = await permit.api.tenants.listTenantUsers({
                tenantKey: "todo-tenant",
                page: 1,
                perPage: 100,
            });
            
            res.status(200).json({
                msg : "tenant with employee role created successfully"
            })

    }catch(err){
        console.log(err);
        res.status(500).json({
            error : err
        })
    }
});

app.listen(3000 , () => {console.log("app listening on port 3000")});