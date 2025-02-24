import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../model/user";
import { Request, Response } from "express";
import { Password } from "../utils/password";
import { validationResult } from "express-validator";
import { UserExistError } from "@tranthanhbinh2603/ticket_app_library";
import { BadRequestError } from "@tranthanhbinh2603/ticket_app_library";
import { RequestValidationError } from "@tranthanhbinh2603/ticket_app_library";

dotenv.config();

const createUser = async (req: Request, res: Response): Promise<any> => {
	if (!process.env.JWT_KEY) {
		throw new BadRequestError();
	}
	const { email, password } = req.body;
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new UserExistError();
	}
	const result = validationResult(req);
	if (!result.isEmpty()) {
		throw new RequestValidationError(result.array());
	}
	const newUserData = new User({ email, password });
	await newUserData.save();
	const payload = {
		id: newUserData._id,
		email: email,
	};
	const expiresIn = "1800s";
	const jwtToken = jwt.sign(payload, process.env.JWT_KEY as string, {
		algorithm: "HS256",
		expiresIn,
	});
	req.session = {
		jwt: jwtToken,
	};
	return res.status(201).json({
		msg: "successful",
		data: newUserData,
	});
};

const signInUser = async (req: Request, res: Response): Promise<any> => {
	if (!process.env.JWT_KEY) {
		throw new BadRequestError();
	}
	const result = validationResult(req);
	if (!result.isEmpty()) {
		throw new RequestValidationError(result.array());
	}
	const { email, password: suppliedPassword } = req.body;
	const userData = await User.findOne({ email });
	if (!userData) {
		throw new BadRequestError(false, "Wrong credential");
	}
	const storedPassword = userData.password;
	const isRightPassword = await Password.compare(
		storedPassword,
		suppliedPassword
	);
	if (!isRightPassword) {
		throw new BadRequestError(false, "Wrong credential");
	}
	const payload = {
		id: userData._id,
		email: email,
	};
	const expiresIn = "1800s";
	const jwtToken = jwt.sign(payload, process.env.JWT_KEY as string, {
		algorithm: "HS256",
		expiresIn,
	});
	req.session = {
		jwt: jwtToken,
	};
	return res.status(200).json({
		msg: "successful",
		data: userData,
	});
};

const signOutUser = (req: Request, res: Response): any => {
	try {
		req.session = null;
		return res.status(200).json({
			msg: "successful",
		});
	} catch {
		throw new BadRequestError(true);
	}
};

const getUserInfo = (req: Request, res: Response): any => {
	try {
		return res.status(200).json({
			current_user: req.currentUser || null,
		});
	} catch (error) {
		throw new BadRequestError(true);
	}
};

export { getUserInfo, createUser, signInUser, signOutUser };
