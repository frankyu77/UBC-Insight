import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";
import {getContentFromArchives, getBuffer} from "../resources/archives/TestUtil";

describe("Facade D3", function () {
	let sections: Buffer;
	let facade: InsightFacade;
	let server: Server;
	const SERVER_URL = "http://localhost:4321";

	before(async function () {
		sections = await getBuffer("shorterCourses.zip");
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		try {
			await server.start();
		} catch (err) {
			console.log(err);
		}
	});

	after(async function () {
		// TODO: stop server here once!
		try {
			await server.stop();
		} catch (err) {
			console.log(err);
		}
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	// Sample on how to format PUT requests
	/* it("PUT test for courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	}); */
	it("PUT test for sections dataset one valid", async function () {
		try {
			return request(SERVER_URL)
				.put("/dataset/sections/sections")
				.attach("body", sections, "shorterCourses.zip")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.log(err);
			expect.fail();
		}
	});

	it("PUT test for sections dataset pair.zip", async function () {
		try {
			const pair = await getBuffer("pair.zip");
			return request(SERVER_URL)
				.put("/dataset/sections/sections")
				// .attach("body", "test/resources/archives/pair.zip")
				.attach("body", pair, "pair.zip")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.log(err);
			expect.fail();
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
});
