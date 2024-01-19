import {InsightDatasetKind, InsightError, NotFoundError} from "../../src/controller/IInsightFacade";
import {clearDisk, getContentFromArchives} from "../resources/archives/TestUtil";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";


chai.use(chaiAsPromised);

// var chai = require("chai");
// var chaiAsPromised = require("chai-as-promised");
//
// chai.use(chaiAsPromised);
//
// // Then either:
// var expect = chai.expect;



// MY FIRST TEST
describe("InsightFacade Tests", function()  {


        let valid_dataset: string;
        let invalid_dataset: string;
        let known_rows_dataset: string;
        let facade: InsightFacade;

        before(async function() {
            valid_dataset = await getContentFromArchives("valid_dataset.zip");
            invalid_dataset = await getContentFromArchives("invalid_dataset.zip");
            known_rows_dataset = await getContentFromArchives("known_rows_dataset.zip");
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

            return expect(result).to.eventually.be.equal(expected_result);
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

        // it("add - reject - content null)", function() {
        //     const result = facade.addDataset("1", null, InsightDatasetKind.Sections);
        //
        //     return expect(result).to.eventually.be.rejectedWith(InsightError);
        // });

        //DatasetKind Test

        //REMOVE TESTS !!!
        it ("remove - accept", function() {
            const new_id: string = "1";
            const expected_result: string = new_id;
            const result = facade.addDataset(new_id, valid_dataset, InsightDatasetKind.Sections)
                .then(() => facade.removeDataset(new_id));

            return expect(result).to.eventually.be.equal(expected_result);
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


        //LIST TESTS !!!
        it("should list one dataset",  function() {
            const result = facade.addDataset("first", known_rows_dataset, InsightDatasetKind.Sections)
                .then(() => facade.listDatasets());

            return expect(result).to.eventually.equal([{
                id: "first",
                kind: InsightDatasetKind.Sections,
                numRows: 4}]
            );

        });
});