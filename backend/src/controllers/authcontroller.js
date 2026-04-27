


import User from "../models/userModel.js";



//! flow of registration
//? user -> enter information ( name , email , passowrd )
//? sends the request using URL post /api/users/register
//? the server receives the request and extracts the user information from the request body    : Done     
//?  checks if the email is already registered : show already registered 
//? if the email is valid, the server hashes the password using bcrypt and stores it in the database
//? if the password is valid( mongoose email validator), the server generates a JWT token and sends it back to the client
//? the client receives the token and stores it in local storage or cookies
//? the client can use this token for subsequent requests to access protected routes





const registerUser = async (req , res)=>{
    console.log(req.body);
    const {name , email , password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({message : "Please fill all the fields"});
    }

    try {
        const userExist = await User.findOne({ email });
        if(userExist){
            return res.status(400).json({message : "User already exists"});
        }

       const newUser = new User({
        name,
        email,
        password
       })

       //! before saving the user to the database, we need to hash the password using bcrypt
       //! the password will be hashed in the pre save hook of the user model

         await newUser.save();


    //! after saving the user to the database, we need to generate a JWT token and send it back to the client
    //! according to modern standard practices i generated the access token and refresh token in the user model as methods and then called them here to generate the tokens and send them back to the client

     const accessToken = newUser.generateAccessToken();
     const refreshToken = newUser.generateRefreshToken();

       return res.status(201).json({
            message : "User registered successfully",
            accessToken,
            refreshToken
        })
    } catch (error) {
        res.status(500).json({message : "Error occurred while registering user"});
    }
       
}

export default {
    registerUser
}