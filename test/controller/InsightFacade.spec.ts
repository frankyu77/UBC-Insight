import InsightFacade from "../../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives, readFileQueries} from "../resources/archives/TestUtil";
import {
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import chai, {assert, expect} from "chai";
import {describe} from "mocha";
import chaiAsPromised from "chai-as-promised";
import * as fs from "fs-extra";

export interface ITestQuery {
    title: string; // title of the test case
    input: unknown; // the query under test
    errorExpected: boolean; // if the query is expected to throw an error
    expected: any; // the expected result
}

describe("InsightFacade", function() {
	//
    // // ####################################################################################################    addDataset
	// describe("addDataset", function() {
	// 	let sections: string;
	// 	let facade: InsightFacade;
	//
	// 	before(async function() {
	// 		sections = await getContentFromArchives("shorterCourses.zip");
	// 		chai.use(chaiAsPromised);
	// 	});
	//
	// 	beforeEach(async function() {
	// 		await clearDisk();
	// 		facade = new InsightFacade();
	// 	});
	//
    //     //* *********************************************REJECTIONS******************************************************
    //     // empty id -----------------------------------------------------------------------------------------------------
	// 	it ("should reject with an empty dataset id when adding", function() { // test taken from CPSC310 site
	// 		const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
    //     // invalid content ----------------------------------------------------------------------------------------------
	// 	it ("should reject with an invalid content when adding", function() {
	// 		const result = facade.addDataset("hello", "blah blah", InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
    //     // not base64 ----------------------------------------------------------------------------------------------
	// 	it ("should reject when adding dataset not base64", async function() {
	// 		const buffer = await fs.readFile("test/resources/archives/file.txt");
	// 		const test = buffer.toString("base64url");
	//
	// 		const result = facade.addDataset("hello", test, InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
    //     // rooms and not sections ---------------------------------------------------------------------------------------
	// 	it ("should reject with in valid kind", function() {
	// 		const result = facade.addDataset("ubc", sections, InsightDatasetKind.Rooms);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
    //     // valid dataset with invalid course (NOT JSON formatted)--------------------------------------------------------
	// 	it ("should reject when adding content with valid dataset but invalid course (not JSON formatted)",
	// 		async function() {
	// 			let newSections = await getContentFromArchives("fileNotJSONFormatted.zip");
	//
	// 			const result = facade.addDataset("ubc", newSections, InsightDatasetKind.Sections);
	//
	// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 		});
	//
    //     // invalid course (root of zip not 'courses') -------------------------------------------------------------------
	// 	it ("should reject when adding content whose root folder is not call courses/", async function() {
	// 		let newSections = await getContentFromArchives("coursesNotRootFolder.zip");
	//
	// 		const result = facade.addDataset("ubc", newSections, InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
    //     // invalid course (no valid section) ----------------------------------------------------------------------------
	// 	it ("should reject when adding content with no valid section", async function() {
	// 		let newSections = await getContentFromArchives("noValidSection.zip");
	//
	// 		const result = facade.addDataset("ubc", newSections, InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
    //     // invalid section (missing fields) -----------------------------------------------------------------------------
	// 	it ("should reject when adding content with missing fields in sections", async function() {
	// 		let newSections = await getContentFromArchives("missingFields.zip");
	//
	// 		const result = facade.addDataset("ubc", newSections, InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
    //     // id containing underscore -------------------------------------------------------------------------------------
	// 	it ("should reject if id added contains an underscore (at the front)", async () => {
	// 		try {
	// 			await facade.addDataset("_CPSC110", sections, InsightDatasetKind.Sections);
	// 			return expect.fail("should not have added");
	// 		} catch (error) {
	// 			return expect(error).to.be.an.instanceof(InsightError);
	// 		}
	// 	});
	//
	// 	it ("should reject if id added contains an underscore (at the back)", async () => {
	// 		try {
	// 			await facade.addDataset("CPSC110_", sections, InsightDatasetKind.Sections);
	// 			return expect.fail("should not have added");
	// 		} catch (error) {
	// 			return expect(error).to.be.an.instanceof(InsightError);
	// 		}
	// 	});
	//
	// 	it ("should reject if id added contains an underscore (in the middle)", async () => {
	// 		try {
	// 			await facade.addDataset("CPSC_110", sections, InsightDatasetKind.Sections);
	// 			return expect.fail("should not have added");
	// 		} catch (error) {
	// 			return expect(error).to.be.an.instanceof(InsightError);
	// 		}
	// 	});
	//
	// 	it ("should reject if id added contains an underscore (multiple)", async () => {
	// 		try {
	// 			await facade.addDataset("C_P_S_C110", sections, InsightDatasetKind.Sections);
	// 			return expect.fail("should not have added");
	// 		} catch (error) {
	// 			return expect(error).to.be.an.instanceof(InsightError);
	// 		}
	// 	});
	//
	// 	it ("should reject when adding two duplicate datasets with same id", async () => {
	// 		return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result) => {
	// 			return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result1) => {
	// 				return expect.fail("should not have added");
	// 			});
	// 		}).catch((error) => {
	// 			return expect(error).to.be.an.instanceof(InsightError);
	// 		});
	// 	});
	//
	// 	describe("testing", () => {
	// 		for (let i = 0; i < 100; i++) {
	// 			it ("" + i, async () => {
	// 				try {
	// 					await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
	// 				} catch (err) {
	// 					console.log(err);
	// 					console.log("lol");
	// 				}
	// 				try {
	// 					const facade2 = new InsightFacade();
	// 					const result2 = await facade2.addDataset("ubc", sections, InsightDatasetKind.Sections);
	// 					// await result2;
	// 					return expect.fail("should not have added");
	// 				} catch (error) {
	// 					console.log(error);
	// 					return expect(error).to.be.an.instanceof(InsightError);
	// 				}
	// 			});
	// 		}
	// 	});
	// 	// it ("should reject if adding same dataset to a new instance of facade", async () => {
	// 	// 	await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
	// 	// 	try {
	// 	// 		const facade2 = new InsightFacade();
	// 	// 		const result2 = await facade2.addDataset("ubc", sections, InsightDatasetKind.Sections);
	// 	// 		// await result2;
	// 	// 		return expect.fail("should not have added");
	// 	// 	} catch (error) {
	// 	// 		console.log(error);
	// 	// 		return expect(error).to.be.an.instanceof(InsightError);
	// 	// 	}
	// 	// });
	//
    //     //* **********************************************SUCCESSES******************************************************
	// 	it ("should successfully add one dataset", async function() {
	// 		try {
	// 			const result = await facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections);
	// 			expect(result).to.deep.equal(["CPSC110"]);
	// 		} catch (error) {
	// 			console.log(error);
	// 			expect.fail("should have added");
	// 		}
	// 	});
	//
	// 	it ("should successfully add two different datasets", async () => {
	// 		// try {
	// 		// 	const result1 = await facade.addDataset("CPSC110", sections, InsightDatasetKind.Section);
	// 		// 	expect(result1).to.deep.equal(["CPSC110"]);
	// 		//
	// 		// 	try {
	// 		// 		const result2 = await facade.addDataset("CSPC210", sections, InsightDatasetKind.Section);
	// 		// 		return expect(result2).to.have.members(["CPSC110", "CPSC210"]);
	// 		// 	} catch (error2) {
	// 		// 		expect.fail("should have added 2");
	// 		// 	}
	// 		// } catch (error1: any) {
	// 		// 	expect.fail(error1);
	// 		// }
	// 		try {
	// 			const result = await facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections);
	// 			expect(result).to.deep.equal(["CPSC110"]);
	// 		} catch (error) {
	// 			console.log(error);
	// 			expect.fail("should have added");
	// 		}
	//
	// 		try {
	// 			const result = await facade.addDataset("CPSC12345", sections, InsightDatasetKind.Sections);
	// 			expect(result).to.deep.equal(["CPSC110", "CPSC12345"]);
	// 		} catch (error) {
	// 			console.log(error);
	// 			expect.fail("should have added");
	// 		}
	// 	});
	//
    //     // pass, contains one valid section------------------------------------------------------------------------------
	// 	it ("contains one singular valid section", async function() {
	// 		let newSections = await getContentFromArchives("oneValidSection.zip");
	//
	// 		try {
	// 			const result = await facade.addDataset("ubc", newSections, InsightDatasetKind.Sections);
	// 			expect(result).to.deep.equal(["ubc"]);
	// 		} catch (error) {
	// 			expect.fail("should have added");
	// 		}
	// 	});
	//
    //     // pass, in section some field contain empty string--------------------------------------------------------------
	// 	it ("section has some fields containing empty string", async function() {
	// 		let newSections = await getContentFromArchives("someFieldEmptyString.zip");
	//
	// 		try {
	// 			const result = await facade.addDataset("ubc", newSections, InsightDatasetKind.Sections);
	// 			expect(result).to.deep.equal(["ubc"]);
	// 		} catch (error) {
	// 			expect.fail("should have added");
	// 		}
	// 	});
	//
	// });
	//
	//
    // // #################################################################################################### removeDataset
	// describe("removeDataset", () => {
	//
	// 	let sections: string;
	// 	let facade: InsightFacade;
	//
	// 	before(async function() {
	// 		sections = await getContentFromArchives("shorterCourses.zip");
	// 		chai.use(chaiAsPromised);
	// 	});
	//
	// 	beforeEach(async function() {
	// 		await clearDisk();
	// 		facade = new InsightFacade();
	// 	});
	//
    //     //* *********************************************REJECTIONS******************************************************
    //     // empty id -----------------------------------------------------------------------------------------------------
	// 	it ("should reject with an empty dataset id when remove", function() {
	// 		const result = facade.removeDataset("");
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
    //     // id containing underscore -------------------------------------------------------------------------------------
	// 	it ("should reject if id removed contains an underscore (at the front)", async () => {
	// 		try {
	// 			await facade.removeDataset("_CPSC110");
	// 			expect.fail("should not have removed");
	// 		} catch (error) {
	// 			expect(error).to.be.an.instanceof(InsightError);
	// 		}
	// 	});
	//
	// 	it ("should reject if id removed contains an underscore (at the back)", async () => {
	// 		try {
	// 			await facade.removeDataset("CPSC110_");
	// 			expect.fail("should not have removed");
	// 		} catch (error) {
	// 			expect(error).to.be.an.instanceof(InsightError);
	// 		}
	// 	});
	//
	// 	it ("should reject if id removed contains an underscore (in the middle)", async () => {
	// 		try {
	// 			await facade.removeDataset("CPSC_110");
	// 			expect.fail("should not have removed");
	// 		} catch (error) {
	// 			expect(error).to.be.an.instanceof(InsightError);
	// 		}
	// 	});
	//
	// 	it ("should reject if id removed contains an underscore (multiple)", async () => {
	// 		try {
	// 			await facade.removeDataset("C_P_S_C110");
	// 			expect.fail("should not have removed");
	// 		} catch (error) {
	// 			expect(error).to.be.an.instanceof(InsightError);
	// 		}
	// 	});
	//
    //     // non-existent id-----------------------------------------------------------------------------------------------
	// 	it ("should fail if try and remove an id that is non-existent", async () => {
	// 		try {
	// 			const result1 = await facade.addDataset("CAPS449", sections, InsightDatasetKind.Sections);
	// 			expect(result1).to.deep.equal(["CAPS449"]);
	// 			try {
	// 				const result = await facade.removeDataset("hello");
	// 				expect.fail("should not have removed");
	// 			} catch (error) {
	// 				expect(error).to.be.an.instanceof(NotFoundError);
	// 			}
	// 		} catch (error1) {
	// 			expect.fail("should have removed");
	// 		}
	// 	});
	//
	// 	it ("should fail if try and remove an id from an empty list of datasets", async () => {
	// 		try {
	// 			await facade.removeDataset("CPSC110");
	// 			expect.fail("should not have removed");
	// 		} catch (error) {
	// 			expect(error).to.be.an.instanceof(NotFoundError);
	// 		}
	// 	});
	//
    //     //* **********************************************SUCCESSES******************************************************
	// 	it ("should successfully remove one dataset", async function() {
	// 		try {
	// 			const result1 = await facade.addDataset("CAPS449", sections, InsightDatasetKind.Sections);
	// 			expect(result1).to.deep.equal(["CAPS449"]);
	// 			try {
	// 				const result = await facade.removeDataset("CAPS449");
	// 				expect(result).to.deep.equal("CAPS449");
	// 			} catch (error) {
	// 				expect.fail("should have removed");
	// 			}
	// 		} catch (error1) {
	// 			expect.fail("should have removed");
	// 		}
	//
	//
	// 	});
	//
	// 	it ("should successfully remove two different datasets", async () => {
	// 		try {
	// 			const res = await facade.addDataset("CAPS449", sections, InsightDatasetKind.Sections);
	// 			expect(res).to.deep.equal(["CAPS449"]);
	// 			try {
	// 				const res2 = await facade.addDataset("CAPS430", sections, InsightDatasetKind.Sections);
	// 				expect(res2).to.deep.equal(["CAPS449", "CAPS430"]);
	// 				try {
	// 					const result1 = await facade.removeDataset("CAPS449");
	// 					expect(result1).to.deep.equal("CAPS449");
	//
	// 					try {
	// 						const result2 = await facade.removeDataset("CAPS430");
	// 						expect(result2).to.deep.equal("CAPS430");
	// 					} catch (error4) {
	// 						expect.fail("should have removed");
	// 					}
	// 				} catch (error3) {
	// 					expect.fail("should have removed");
	// 				}
	// 			} catch (error2) {
	// 				expect.fail("should have added");
	// 			}
	// 		} catch (error) {
	// 			expect.fail("should have added");
	// 		}
	// 	});
	//
	// 	it ("should be able to remove dataset from a different instance of facade", async () => {
	// 		try {
	// 			const result = await facade.addDataset("CAPS449", sections, InsightDatasetKind.Sections);
	// 			expect(result).to.deep.equal(["CAPS449"]);
	//
	// 			let facade2 = new InsightFacade();
	// 			try {
	// 				const result2 = await facade2.removeDataset("CAPS449");
	// 				expect(result2).to.deep.equal("CAPS449");
	// 			} catch (error) {
	// 				expect.fail("should have removed");
	// 			}
	// 		} catch (error1) {
	// 			expect.fail("should have added");
	// 		}
	// 	});
	//
	// });
	//
	//
    // // #################################################################################################### listDataset
	// describe("listDataset", () => {
	//
	// 	let sections: string;
	// 	let facade: InsightFacade;
	//
	// 	before(async function() {
	// 		sections = await getContentFromArchives("oneValidSection.zip");
	// 		chai.use(chaiAsPromised);
	// 	});
	//
	// 	beforeEach(async function() {
	// 		await clearDisk();
	// 		facade = new InsightFacade();
	// 	});
	//
	// 	it ("should list an empty datset", async () => {
	// 		const datasets = await facade.listDatasets();
	//
	// 		expect(datasets).to.deep.equal([]);
	// 	});
	//
    //     // test taken from CPSC310 site
	// 	it ("should list one dataset", async () => {
    //         // Setup
	// 		await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
	//
    //         // Execution
	// 		const datasets = await facade.listDatasets();
	//
    //         // Validation
	// 		expect(datasets).to.deep.equal([{
	// 			id: "ubc",
	// 			kind: InsightDatasetKind.Sections,
	// 			numRows: 39
	// 		}]);
	// 	});
	//
	// 	it ("should list multiple datasets", async () => {
	// 		await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
	// 		await facade.addDataset("sfu", sections, InsightDatasetKind.Sections);
	// 		await facade.addDataset("uofc", sections, InsightDatasetKind.Sections);
	//
	// 		const datasets = await facade.listDatasets();
	//
	// 		expect(datasets).to.have.deep.members([
	// 			{id: "sfu", kind: InsightDatasetKind.Sections, numRows: 39},
	// 			{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 39},
	// 			{id: "uofc", kind: InsightDatasetKind.Sections, numRows: 39}
	// 		]);
	// 	});
	//
	// 	it ("should list multiple datasets after a sequence of add and remove", async () => {
	// 		await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
	// 		await facade.addDataset("sfu", sections, InsightDatasetKind.Sections);
	// 		await facade.removeDataset("sfu");
	// 		await facade.addDataset("uofc", sections, InsightDatasetKind.Sections);
	// 		await facade.removeDataset("ubc");
	//
	// 		const datasets = await facade.listDatasets();
	//
	// 		expect(datasets).to.deep.equal([{
	// 			id: "uofc",
	// 			kind: InsightDatasetKind.Sections,
	// 			numRows: 39
	// 		}]);
	// 	});
	//
	// });


    // #####################################################################################################performQuery

	describe("performQuery", () => {
		let sections: string;
		let facade: InsightFacade;

		before(async function() {
			sections = await getContentFromArchives("pair.zip");
			facade = new InsightFacade();

			chai.use(chaiAsPromised);
			await clearDisk();
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
		});

		describe("valid queries", function() {
			let validQueries: ITestQuery[];
			try {
				validQueries = readFileQueries("valid");
			} catch (e: unknown) {
				expect.fail(`Failed to read one or more test queries. ${e}`);
			}

			validQueries.forEach(function(test: any) {
				it(`${test.title}`, async function () {
					return facade.performQuery(test.input).then((result) => {
						if (!test.errorExpected) {

							expect(result).to.have.deep.members(test.expected);

						} else {
							throw new Error("error expected");
						}

					}).catch((err: string) => {
						assert.fail(`performQuery threw unexpected error: ${err}`);
					});
				});
			});
		});

		describe("invalid queries", () => {
			let invalidQueries: ITestQuery[];
			try {
				invalidQueries = readFileQueries("invalid");
			} catch (e: unknown) {
				expect.fail(`Failed to read one or more test queries. ${e}`);
			}

			invalidQueries.forEach(function(test: any) {
				it(`${test.title}`, async function () {
					try {
						const result = facade.performQuery(test.input);
						await result;
						assert.fail("should have thrown an error");
					} catch (err: unknown) {
						expect(err).to.be.an.instanceof(Error);
					}
				});
			});
		});

	});

});

