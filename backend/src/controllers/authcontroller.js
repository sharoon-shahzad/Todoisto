import { User } from "../models/user.models.js";

//! flow of registration
//? user -> enter information ( name , email , passowrd )
//? sends the request using URL post /api/users/register
//? the server receives the request and extracts the user information from the request body    : Done
//?  checks if the email is already registered : show already registered
//? if the email is valid, the server hashes the password using bcrypt and stores it in the database
//? if the password is valid( mongoose email validator), the server generates a JWT token and sends it back to the client
//? the client receives the token and stores it in local storage or cookies
//? the client can use this token for subsequent requests to access protected routes

async function registerUser(req, res) {
  console.log(req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    //! before saving the user to the database, we need to hash the password using bcrypt
    //! the password will be hashed in the pre save hook of the user model
    await newUser.save();

    //! after saving the user to the database, we need to generate a JWT token and send it back to the client
    //! according to modern standard practices i generated the access token and refresh token in the user model as methods and then called them here to generate the tokens and send them back to the client
    const accessToken = newUser.generateAccessToken();
    const refreshToken = newUser.generateRefreshToken();

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while registering user" });
  }
}

//! flow of login
//!user enter credentials (name , password)
//! hit URL POST /api/users/login
//! the server receives the request and extracts the user information from the request body
//! the server checks if user exist in DB
//? if yes
//? if no show user not found
//? if user exist in DB the server
//?               then compares the password entered by the user with the hashed password stored in the database using bcrypt
//? if the password is valid, the server generates a JWT token and sends it back to the client
//? if the password is invalid, the server sends an error message back to the client
//! the client receives the token and stores it in local storage or cookies
//! the client can use this token for subsequent requests to access protected routes

const loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  try {
    const userExist = await User.findOne({ email });
    console.log(`found exiting user : login :  ${userExist}`);
    if (!userExist) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await userExist.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = userExist.generateAccessToken();
    const refreshToken = userExist.generateRefreshToken();

    userExist.refreshToken = refreshToken;
    await userExist.save({ validateBeforeSave: false });

    //! there i need to make tradeoff or decision wheather to call the DB for the retriving updated logged in user or i will update the current object of not to include the password and refresh tokken in response

    //? decision i chose is to update the current object of not to include these fields

    userExist.password = undefined;
    userExist.refreshToken = undefined;

    options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "User logged in successfully",
        user: userExist,
        //!user might want to store the cookies in local storage instead of cookies so i will send the tokens in response as well , he might be using to mobile app where there is no concept of cookies so he will store the tokens in local storage and send them in headers for subsequent requests
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while logging in user" });
  }
};

const logout = async (req, res) => {
  //!algo is to clear the refresh token from the database and clear the cookies from the client side

  //! now problem we have first find the fuser  from db but right now dont have any user property to find the user from db

  //? here comes the concept of middleware for authentication and authorization where we will verify the access token sent by the client in the headers and then we will extract the user information from the token and then we will find the user from the database using that information and then we will clear the refresh token from the database and clear the cookies from the client side


  console.log("logout user : ", req.user);

  await User.findByIdandUpdate(
    req.user._id,
    { refreshToken: "" },
    { new: true },
  );

  options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged out successfully" });
};

export default {
  registerUser,
  loginUser,
  logout,
};
