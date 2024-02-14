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


// Load full data setx
// Add full data set to facade
// QUERY TESTS !!!
describe ("InsightFacade performQuery Tests", function() {
	let facade: InsightFacade;
	let sections: string;

	before(async function() {
		sections = await getContentFromArchives("pair.zip");
		await clearDisk();
		facade = new InsightFacade();
		// await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
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

					assert.fail("performQuery completed with no expected error thrown"); // !!!!!!! assert fail?

				}).catch((err: any) => {
					console.log(err);
                            // SHOULD throw insightError OR MaxResultsError
                            // assert.equal(err, InsightError || ResultTooLargeError);
                            // expect(err).to.eventually.be.rejectedWith(errors[test.expected as keyof typeof errors]);


				});
			});
		});
	});

});

