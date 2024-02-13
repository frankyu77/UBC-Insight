import {
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import {clearDisk, getContentFromArchives, readFileQueries} from "../resources/archives/TestUtil";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import assert from "node:assert";


chai.use(chaiAsPromised);

export interface ITestQuery {
    title: string; // title of the test case
    input: unknown; // the query under test
    errorExpected: boolean; // if the query is expected to throw an error
    expected: any; // the expected result
}


// // ADD REMOVE LIST TESTS !!!
// describe("InsightFacade add/remove/listDatasets Tests", function()  {
//
//
// 	let validDataset: string;
// 	let invalidDataset: string;
// 	let knownRowsDataset: string;
// 	let emptyZip: string;
// 	let facade: InsightFacade;
//
// 	before(async function() {
// 		validDataset = await getContentFromArchives("valid_dataset.zip");
// 		invalidDataset = await getContentFromArchives("invalid_dataset.zip");
// 		knownRowsDataset = await getContentFromArchives("known_rows_dataset.zip");
// 		emptyZip = await getContentFromArchives("empty_zip.zip");
//
//
// 	});
//
// 	beforeEach(async function () {
// 		await clearDisk();
//
// 		facade = new InsightFacade();
// 	});
//
//         // ADD TESTS !!!
// 	it ("add - accept", function() {
// 		const newId: string = "1";
// 		const expectedResult: string[] = [newId];
// 		const result = facade.addDataset(newId, validDataset, InsightDatasetKind.Sections);
//
// 		return expect(result).to.eventually.deep.equal(expectedResult);
// 	});
//
// 	it ("add - reject - dataset id empty", function() {
// 		const result = facade.addDataset("", validDataset, InsightDatasetKind.Sections);
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("add - reject - dataset id with ONLY whitespace", function() {
// 		const result = facade.addDataset("  ", validDataset, InsightDatasetKind.Sections);
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("add - reject - dataset id with underscore", function() {
// 		const result = facade.addDataset("0_1", validDataset, InsightDatasetKind.Sections);
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("add - reject - dataset id duplicated", function() {
// 		const result = facade.addDataset("1", validDataset, InsightDatasetKind.Sections)
// 			.then(() => facade.addDataset("1", validDataset, InsightDatasetKind.Sections));
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("add - reject - content invalid (no valid sections in the set)", function() {
// 		const result = facade.addDataset("1", invalidDataset, InsightDatasetKind.Sections);
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("add - reject - content empty)", function() {
// 		const result = facade.addDataset("1", "", InsightDatasetKind.Sections);
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("add - reject - zip empty)", function() {
// 		const result = facade.addDataset("1", emptyZip, InsightDatasetKind.Sections);
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
//         // it("add - reject - content null)", function() {
//         //     const result = facade.addDataset("1", null, InsightDatasetKind.Sections);
//         //
//         //     return expect(result).to.eventually.be.rejectedWith(InsightError);
//         // });
//
//         // DatasetKind Test
// 	it("add - reject - kind incorrect)", function() {
// 		const result = facade.addDataset("1", validDataset, InsightDatasetKind.Rooms);
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
//         // REMOVE TESTS !!!
// 	it ("remove - accept", function() {
// 		const newId: string = "1";
// 		const expectedResult: string = newId;
// 		const result = facade.addDataset(newId, validDataset, InsightDatasetKind.Sections)
// 			.then(() => facade.removeDataset(newId));
//
// 		return expect(result).to.eventually.deep.equal(expectedResult);
// 	});
//
// 	it ("remove - reject - dataset id empty", function() {
// 		const result = facade.removeDataset("");
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("remove - reject - dataset id with ONLY whitespace", function() {
// 		const result = facade.removeDataset("  ");
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("remove - reject - dataset id with underscore", function() {
// 		const result = facade.removeDataset("0_1");
//
// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
// 	});
//
// 	it("remove - reject - dataset id not found", function() {
// 		const result = facade.removeDataset("1");
//
// 		return expect(result).to.eventually.be.rejectedWith(NotFoundError);
// 	});
//
// 	it("remove - reject - dataset id removed twice", function() {
// 		const result = facade.addDataset("twice", validDataset, InsightDatasetKind.Sections)
// 			.then(() => facade.removeDataset("twice"))
// 			.then(() => facade.removeDataset("twice"));
// 		return expect(result).to.eventually.be.rejectedWith(NotFoundError);
// 	});
//
//
//         // LIST TESTS !!!
// 	it("list - accept (v1)",  function() {
// 		const result = facade.addDataset("first", knownRowsDataset, InsightDatasetKind.Sections)
// 			.then(() => facade.listDatasets());
//
// 		return expect(result).to.eventually.deep.equal([{
// 			id: "first",
// 			kind: InsightDatasetKind.Sections,
// 			numRows: 4}]
// 		);
//
// 	});
//
//         // it("list - accept (v2)", async function() {
//         //     //Setup
//         //     await facade.addDataset("ubc", full_dataset, InsightDatasetKind.Sections);
//         //
//         //     //Execution
//         //     const datasets = await facade.listDatasets();
//         //
//         //     //Validation
//         //     expect(datasets).to.deep.equal([{
//         //         id: "ubc",
//         //         kind: InsightDatasetKind.Sections,
//         //         numRows: 64612
//         //
//         //     }]);
//         // });
//
//
//         // it("list - accept (empty facade)", async () => {
//         //
//         //     const result = facade.listDatasets();
//         //
//         //     return expect(result).to.have.length(0);
//         //
//         // });
//
// });


// Load full data set
// Add full data set to facade
// QUERY TESTS !!!
describe ("InsightFacade performQuery Tests", function() {
	let facade: InsightFacade;
	let sections: string;

	before(async function() {
		sections = await getContentFromArchives("pair.zip");
		await clearDisk();
		facade = new InsightFacade();
		//await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
	});

	// describe("valid queries", function() {
	//
	// 	let validQueries: ITestQuery[];
	//
	// 	try {
	// 		validQueries = readFileQueries("valid");
	// 	} catch (e: unknown) {
	// 		expect.fail(`Failed to read one or more test queries. ${e}`);
	// 	}
	//
	// 	validQueries.forEach(function(test: any) {
	// 		it(`${test.title}`, function () {
	// 			return facade.performQuery(test.input).then((result) => {
	//
	// 				expect(result).to.deep.equal(test.expected);
	//
	// 			}).catch((err: any) => {
    //                         // should NOT throw insightError
	// 				assert.fail(`performQuery threw unexpected error: ${err}`);
	//
	// 			});
	// 		});
	// 	});
	// });
	//


	describe("invalid queries", function() {

		let invalidQueries: ITestQuery[];

		try {
			invalidQueries = readFileQueries("invalid");
		} catch (e: unknown) {
			expect.fail(`Failed to read one or more test queries. ${e}`);
		}

		invalidQueries.forEach(function(test: any) {
			it(`${test.title}`, function () {
				return facade.performQuery(test.input).then((result) => {

					assert.fail("performQuery completed with no expected error thrown"); //!!!!!!! assert fail?

				}).catch((err: any) => {
					console.log(err)
                            // SHOULD throw insightError OR MaxResultsError
                            // assert.equal(err, InsightError || ResultTooLargeError);
                            // expect(err).to.eventually.be.rejectedWith(errors[test.expected as keyof typeof errors]);


				});
			});
		});
	});

});

