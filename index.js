import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connect from './database/conn.js';
import router from './routes/route.js';
const app = express();

// Middelwares 

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by');

const port=8080;
 
// HTTP get request 

app.get('/',(req,res)=>{
    res.status(201).json('Home get Request');
})


app.use('/api',router)
// start server 

connect().then(()=>{
    try {
        app.listen(port,()=>{
            console.log(`Server is connected to http://localhost:${port}`); 
        })
    } catch (error) {
        console.log('Error occured !!!');
    }
}).catch((e)=>{
    console.log('Invalid database connection');
})

