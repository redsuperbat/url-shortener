const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const { nanoid } = require("nanoid");
const yup = require("yup");
const path = require("path");

require("dotenv").config();

mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connected to db..."));

const schema = new mongoose.Schema({
	slug: String,
	url: { type: String, required: true },
});

const yupSchema = yup.object().shape({
	slug: yup
		.string()
		.lowercase()
		.matches(/[\w\d]/),
	url: yup.string().required().url(),
});

const Url = mongoose.model("Url", schema);

const app = express();

app.use(morgan("tiny"));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/:id", async (req, res, next) => {
	try {
		const url = await Url.findOne({ slug: req.params.id });
		console.log(url);
		res.redirect(url.url);
	} catch (err) {
		next(err);
	}
});

app.post("/", async (req, res, next) => {
	const body = req.body;
	if (!body.slug) {
		body.slug = nanoid(6);
	}
	try {
		await yupSchema.validate(body);
		const doc = await new Url(req.body).save();
		const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
		res.json({ ...doc._doc, fullUrl: fullUrl + doc.slug });
	} catch (err) {
		next(err);
	}
});

app.use((error, req, res, next) => {
	res.status(500).json({
		message: error.message,
		stack: process.env.NODE_ENV === "produdction" ? "🥞" : error.stack,
	});
});

const port = 80;
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
