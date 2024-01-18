import {InsightDatasetKind, InsightError} from "../../src/controller/IInsightFacade";
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

    describe("addDataset Tests", function() {
        let sections: string;
        let facade: InsightFacade;

        before(async function() {
            sections = await getContentFromArchives("valid_courses.zip");
        });

        beforeEach(async function () {
            await clearDisk();

            facade = new InsightFacade();
        });


        it ("should reject with  an empty dataset id", function() {
            const result = facade.addDataset("", sections, InsightDatasetKind.Sections)

            return expect(result).to.eventually.be.rejectedWith(new InsightError());
        });
    });
});