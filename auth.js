const express  = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// create a data base;
let users = [];

// test route ..
app.get('/',(req,resp)=>{
    resp.send("Server is runing");
})

// Register Rounting 
app.post('/register',async(req,resp)=>{
    try {
        const {name,email,password} = req.body;

        // if user is already exits
        if(users.find(user=> user.email === email)){
            resp.status(400).json({message:'User alresdy exitst with same email '})
        }
      
        // creating password 
        const hashPassword = await bcrypt.hash(password,10);
       
    //    create new user
        const user = {
        id: users.length + 1,
        name,
        email,
        password:hashPassword
        
        }

        // save to database 

        users.push(user);

        resp.status(201).json({message:'User registered Succefully'})
    } catch (error) {
       resp.status(500).json({message:'An Error Occured'});
        
    }
});

// Login route 

app.post('/login',async (req,resp)=>{
try{

  const{email,password} =  req.body;

//   find user in database
    const user = users.find(user=>user.email === email);
 if(!user){
    return resp.status(400).json({message:'Invalid User email or password'});
 }

//  compare password with stored password in Database
 const isPasswordValid = await bcrypt.compare(password,user.password);

//   check password is valid or not
if(!isPasswordValid){
    resp.status(400).json({message:'Imvalid email or password'});

}

// Genrate a JWT Token
const token = jwt.sign({id: user.id},'secret_key');

resp.send({token});

}catch(error){
    resp.status(500).json({message:'An Error Occurred'});
}
})

// protected route

app.get('/protected',(req,resp)=>{
    try {
        const token = req.headers["x-access-token"];

        //  req.headers.authorization.split(' ')[1];
        // varify

        jwt.verify(token,'secret_key',(error,decoded)=>{
            if(error){
            return resp.status(401).json({message:'Invalid token'})
            }

            // Get user information
            const user =  users.find(user=>user.id === decoded.id);
            
            resp.json({user});
        });
    
    } catch (error) {
     resp.status(500).json({message:'An error ocurred'});     
    }
})

app.listen(3000,()=>{
    console.log('Server is runing on port 3000');
});
