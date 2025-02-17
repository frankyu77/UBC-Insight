import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "../controller/IInsightFacade";


export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private facade: InsightFacade;
	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();

		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		this.express.use(express.static("./frontend/public"));
		this.facade = new InsightFacade();
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);

		// TODO: your other endpoints should go here
		// this.express.get("/dataset/:id/:kind", this.registerPut);
		// this.express.get("/dataset/:id", this.registerDelete);
		// this.express.get("/query", this.registerPost);
		// this.express.get("/datasets", this.registerGet);


		this.express.put("/dataset/:id/:kind", (req, res) => this.registerPut(req, res));
		this.express.delete("/dataset/:id", (req, res) => this.registerDelete(req, res));
		this.express.post("/query", (req, res) => this.registerPost(req, res));
		this.express.get("/datasets", (req, res) => this.registerGet(req, res));
	}

	private async registerPut(req: Request, res: Response) {
		const {id, kind} = req.params;
		const {body} = req;

		if (!body) {
			res.status(400).json({error: "No file uploaded"});
			return;
		}

		console.log(id);
		console.log(body);
		console.log(kind);
		try {
			const zipFileBase64: string = body.toString("base64");


			let datasetKind = InsightDatasetKind.Sections;
			if (kind === "rooms") {
				datasetKind = InsightDatasetKind.Rooms;
			} else if (kind === "sections") {
				datasetKind = InsightDatasetKind.Sections;
			} else {
				throw Error("Not a valid kind listed");
			}
			console.log(datasetKind);

			const datasetAdded: string[] = await this.facade.addDataset(req.params.id, zipFileBase64, datasetKind);
			res.status(200).json({result: datasetAdded});
		} catch (err) {
			res.status(400).json({error: "InsightError" + err});
		}
	}

	private async registerDelete(req: Request, res: Response) {
		try {
			console.log("removed: " + req.params.id);

			const deletedResult: string = await this.facade.removeDataset(req.params.id);

			res.status(200).json({result: deletedResult});
		} catch (err) {
			console.log(err);
			if (err instanceof InsightError) {
				console.log("insight errir caught");
				res.status(400).json({error: "InsightError" + err});
			} else if (err instanceof NotFoundError) {
				console.log("not found error caught");
				res.status(404).json({error: "NotFoundError" + err});
			} else {
				console.log("random error");
				res.status(400).json({error: "RandomError" + err});
			}
		}
	}

	private async registerPost(req: Request, res: Response) {
		try {
			const queryObject = JSON.parse(req.body.query);
			console.log(queryObject);
			console.log(typeof queryObject);

			const keysArray = Object.keys(queryObject);
			console.log(keysArray);

			const queryResult: InsightResult[] = await this.facade.performQuery(queryObject);
			console.log(queryResult);
			res.status(200).json({result: queryResult});
		} catch (error) {
			console.log(error);
			res.status(400).json({error: "Error"}); // Pass in related error to query. !!!!!
		}
	}

	private async registerGet(req: Request, res: Response ) {
		try {
			const listDataSetResult: InsightDataset[] = await this.facade.listDatasets();
			res.status(200).json({result: listDataSetResult});
		} catch (err) {
			res.status(400).json({error: "Random error thrown" + err});
		}
	}

	// The next two methods handle the echo service.
	// These are almost certainly not the best place to put these, but are here for your reference.
	// By updating the Server.echo function pointer above, these methods can be easily moved.
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}
