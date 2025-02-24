import express from "express";
import { checkAuth } from "@tranthanhbinh2603/ticket_app_library";
import { getCurrentUser } from "@tranthanhbinh2603/ticket_app_library";
import {
	validateRegisterUser,
	validateLoginUser,
} from "../validation/validation";
import {
	createUser,
	getUserInfo,
	signInUser,
	signOutUser,
} from "../controller/auth";

const app = express.Router();

app.post("/sign-up", validateRegisterUser, createUser);
app.post("/sign-in", validateLoginUser, signInUser);
app.post("/sign-out", getCurrentUser, checkAuth, signOutUser);
app.get("/current-user", getCurrentUser, checkAuth, getUserInfo);

export default app;
