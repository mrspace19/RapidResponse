import User from '../models/user.model.js';
import { generateToken } from '../lib/utils.js';
import bcrypt from 'bcryptjs';

export const signup = async(req,res)=>{
    const {email,fullName,password} = req.body;
    try {
        if(!email || !fullName || !password){
            return res.status(400).json({message : "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message : "Password must be at least 6 characters"});
        }
        
        const user = await User.findOne({email});

        if(user) return res.status(400).json({message : "Email already exist"});

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            email,
            fullName,
            password : hashPassword
        });
        await newUser.save();

        if(newUser){
            generateToken(newUser._id,res);
            
            res.status(201).json({
                _id: newUser._id,
                email : newUser.email,
                fullName : newUser.fullName
            });
        }
        else{
            res.status(400).json({message : "Invalid user data"});
        }

    } catch (error) {
        console.log('Error in signup controller',error.message);
        res.status(500).json({message : "internal Server error"});
    }
};

export const login = async(req,res)=>{
    const {email,password} = req.body;
    try {
        const user  = await User.findOne({email});

        if(!user){
            return res.status(400).json({message : "Invalid credentials"});
        }

        const isPassword = await bcrypt.compare(password,user.password);
        if(!isPassword){
            return res.status(400).json({message : "Invalid credentials"});
        }

        generateToken(user._id,res);
        res.status(200).json({
            _id: user._id,
            fullName : user.fullName,
            email : user.email
        });
    } catch (error) {
        console.log('Error in login controller',error);
        res.status(500).json({message : "Internal Server Error"});
    }
};

export const logout = (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message : "Logged out successfully"});
    } catch (error) {
        console.log('Error in logout controller',error.message);
        res.status(500).json({message : "Internal Server Error"});
    }
};