import User from "../model/User.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const secretKey = "apple";

export const getUsers = async (req ,res) => {
    try{
        const allUsers =await User.find();
    res.json(allUsers)
    }catch(err){
        console.log("cant fetch",err)
    }
}



export const createUser = async (req, res) => {
  
  try {
    

    const { name, email, password } = req.body;

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password exists:", Boolean(password));

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        received: {
          name: name ?? null,
          email: email ?? null,
          passwordExists: Boolean(password),
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);

    return res.status(500).json({
      message: "Unable to create your account",
    });
  }
};




export const login = async (req, res) => {
  // const {email,password} = req.body
  // const user = await User.findOne({email})

  //upper code is shorcut method

  const emailFromBody = req.body.email;
  const passwordFromBody = req.body.password;

  const user = await User.findOne({
  email: emailFromBody.trim().toLowerCase(),
}).select("+password");

  if (!user) {
    return res.json({
      message: "User with this email not found",
    });
  }

  const isMatch = await bcrypt.compare(passwordFromBody, user.password);

  if (!isMatch) {
    return res.json({ message: "Email or password incorrect" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role:user.role
    },
    secretKey,
    { expiresIn: "1h" },
  );

  res.json({
    message: "Logged in successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role : user.role
    },
  });
};

export const getUserById = async (req, res) => {
  const allBlogs = await User.findById(req.params.id);
  res.json(allBlogs);
};

export const deleteUser = async (req, res) => {
  const allBlogs = await User.findByIdAndDelete(req.params.id);
  res.json({
    message: "User deleted successfully",
  });
};

export const updateUser = async (req, res) => {
  const allBlogs = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(allBlogs);
};