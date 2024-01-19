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
    title: string; //title of the test case
    input: unknown; //the query under test
    errorExpected: boolean; //if the query is expected to throw an error
    expected: any; //the expected result
}

// const errors = {
//     InsightError,
//     ResultTooLargeError,
// };


// ADD REMOVE LIST TESTS !!!
describe("InsightFacade add/remove/listDatasets Tests", function()  {


        let valid_dataset: string;
        let invalid_dataset: string;
        let known_rows_dataset: string;
        let empty_zip: string;
        let facade: InsightFacade;

        before(async function() {
            valid_dataset = await getContentFromArchives("valid_dataset.zip");
            invalid_dataset = await getContentFromArchives("invalid_dataset.zip");
            known_rows_dataset = await getContentFromArchives("known_rows_dataset.zip");
            empty_zip = await getContentFromArchives("empty_zip.zip");


        });

        beforeEach(async function () {
            await clearDisk();

            facade = new InsightFacade();
        });

        // ADD TESTS !!!
        it ("add - accept", function() {
            const new_id: string = "1";
            const expected_result: string[] = [new_id];
            const result = facade.addDataset(new_id, valid_dataset, InsightDatasetKind.Sections);

            return expect(result).to.eventually.deep.equal(expected_result);
        });

        it ("add - reject - dataset id empty", function() {
            const result = facade.addDataset("", valid_dataset, InsightDatasetKind.Sections);

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("add - reject - dataset id with ONLY whitespace", function() {
            const result = facade.addDataset("  ", valid_dataset, InsightDatasetKind.Sections);

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("add - reject - dataset id with underscore", function() {
            const result = facade.addDataset("0_1", valid_dataset, InsightDatasetKind.Sections);

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("add - reject - dataset id duplicated", function() {
            const result = facade.addDataset("1", valid_dataset, InsightDatasetKind.Sections)
                .then(() => facade.addDataset("1", valid_dataset, InsightDatasetKind.Sections));

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("add - reject - content invalid (no valid sections in the set)", function() {
            const result = facade.addDataset("1", invalid_dataset, InsightDatasetKind.Sections);

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("add - reject - content empty)", function() {
            const result = facade.addDataset("1", "", InsightDatasetKind.Sections);

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("add - reject - zip empty)", function() {
            const result = facade.addDataset("1", empty_zip, InsightDatasetKind.Sections);

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        // it("add - reject - content null)", function() {
        //     const result = facade.addDataset("1", null, InsightDatasetKind.Sections);
        //
        //     return expect(result).to.eventually.be.rejectedWith(InsightError);
        // });

        //DatasetKind Test
        it("add - reject - kind incorrect)", function() {
            const result = facade.addDataset("1", valid_dataset, InsightDatasetKind.Rooms);

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        //REMOVE TESTS !!!
        it ("remove - accept", function() {
            const new_id: string = "1";
            const expected_result: string = new_id;
            const result = facade.addDataset(new_id, valid_dataset, InsightDatasetKind.Sections)
                .then(() => facade.removeDataset(new_id));

            return expect(result).to.eventually.deep.equal(expected_result);
        });

        it ("remove - reject - dataset id empty", function() {
            const result = facade.removeDataset("");

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("remove - reject - dataset id with ONLY whitespace", function() {
            const result = facade.removeDataset("  ");

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("remove - reject - dataset id with underscore", function() {
            const result = facade.removeDataset("0_1");

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it("remove - reject - dataset id not found", function() {
            const result = facade.removeDataset("1");

            return expect(result).to.eventually.be.rejectedWith(NotFoundError);
        });

        it("remove - reject - dataset id removed twice", function() {
            const result = facade.addDataset("twice", valid_dataset, InsightDatasetKind.Sections)
                .then(() => facade.removeDataset("twice"))
                .then(() => facade.removeDataset("twice"));
            return expect(result).to.eventually.be.rejectedWith(NotFoundError);
        });


        //LIST TESTS !!!
        it("list - accept (v1)",  function() {
            const result = facade.addDataset("first", known_rows_dataset, InsightDatasetKind.Sections)
                .then(() => facade.listDatasets());

            return expect(result).to.eventually.deep.equal([{
                id: "first",
                kind: InsightDatasetKind.Sections,
                numRows: 4}]
            );

        });

        // it("list - accept (v2)", async function() {
        //     //Setup
        //     await facade.addDataset("ubc", full_dataset, InsightDatasetKind.Sections);
        //
        //     //Execution
        //     const datasets = await facade.listDatasets();
        //
        //     //Validation
        //     expect(datasets).to.deep.equal([{
        //         id: "ubc",
        //         kind: InsightDatasetKind.Sections,
        //         numRows: 64612
        //
        //     }]);
        // });


        // it("list - accept (empty facade)", async () => {
        //
        //     const result = facade.listDatasets();
        //
        //     return expect(result).to.have.length(0);
        //
        // });

});


// Load full data set
// Add full data set to facade
// QUERY TESTS !!!
describe ("InsightFacade performQuery Tests", function() {
            let facade: InsightFacade;
            let sections: string;

            before(async function() {
                sections = await getContentFromArchives("pair.zip")
                await clearDisk();
                facade = new InsightFacade();
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
                    it(`${test.title}`, function () {
                        return facade.performQuery(test.input).then((result) => {

                            expect(result).to.deep.equal(test.expected);

                        }).catch((err: any) => {
                            // should NOT throw insightError
                            assert.fail(`performQuery threw unexpected error: ${err}`);

                        });
                    });
                });
            });

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

                            assert.fail("performQuery completed with no expected error thrown");

                        }).catch((err: any) => {
                            // SHOULD throw insightError OR MaxResultsError
                            //assert.equal(err, InsightError || ResultTooLargeError);
                            //expect(err).to.eventually.be.rejectedWith(errors[test.expected as keyof typeof errors]);


                        });
                    });
                });
            });

});

