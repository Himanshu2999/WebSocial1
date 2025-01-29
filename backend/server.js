require('dotenv').config();
const cors = require('cors')
const mg = require('mongoose');
const exp = require('express')
const app = exp();
const routsapi = require('./routes')
const fileapi = require('./uploadapis')
app.use(exp.urlencoded({extended: false}))
app.use(exp.json())
app.use(cors({origin: 'https://websocialfron.onrender.com/'})) 
mg.connect('mongodb://127.0.0.1:27017/websocial').then(() => console.log("Connected to mongodb"))

mg.connect('mongodb+srv://Himan13:App123@cluster0.ovylhfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(()=>console.log("Connected to mongodb"))

mg.set('strictQuery', false)

app.use("/api", routsapi)
app.use("/api", fileapi)
app.get('/', (req, res)=>{
    res.send("Welcome to our Website")
})

app.listen(9000,(req,res)=>{
    console.log("Server is connected")
})