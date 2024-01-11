import InsightFacade from "../../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives} from "../resources/archives/TestUtil";
import {InsightDatasetKind, InsightError} from "../../src/controller/IInsightFacade";
import {expect} from "chai";

// describe("Testing base case for addDataset", () => {
//     before(() => {
//         const insightFacade = new InsightFacade();
//     })
// });

describe("InsightFacade", function() {
    describe("addDataset", function() {
        let sections: string;
        let facade: InsightFacade;

        before(function() {
            sections = getContentFromArchives("yourzipfile.zip");
            console.log("hello");
        });

        beforeEach(function() {
            clearDisk();
            facade = new InsightFacade();
        });

        //**********************************************REJECTIONS******************************************************
        //empty id -----------------------------------------------------------------------------------------------------
        it ("should reject with an empty dataset id", function() {
            const result = facade.addDataset("", sections, InsightDatasetKind.Sections)

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        //id containing underscore -------------------------------------------------------------------------------------
        it ("should reject if id added contains an underscore (at the front)", () => {
           const result = facade.addDataset("_UBC", sections, InsightDatasetKind.Sections)

           return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it ("should reject if id added contains an underscore (at the back)", () => {
            const result = facade.addDataset("UBC_", sections, InsightDatasetKind.Sections)

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it ("should reject if id added contains an underscore (in the middle)", () => {
            const result = facade.addDataset("U_BC", sections, InsightDatasetKind.Sections)

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        it ("should reject if id added contains an underscore (multiple)", () => {
            const result = facade.addDataset("U_B_C_", sections, InsightDatasetKind.Sections)

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        //duplicate id -------------------------------------------------------------------------------------------------
        it ("should reject when adding two duplicate datasets with same id", () => {
            facade.addDataset("hello", sections, InsightDatasetKind.Sections)
            const result2 = facade.addDataset("hello", sections, InsightDatasetKind.Sections)

            return expect(result2).to.eventually.be.rejectedWith(InsightError);
        });

        it ("should reject when adding two duplicate datasets with same id (not back to back)", () => {
            facade.addDataset("hello", sections, InsightDatasetKind.Sections)
            facade.addDataset("testing", sections, InsightDatasetKind.Sections)
            facade.addDataset("bonjour", sections, InsightDatasetKind.Sections)
            const result2 = facade.addDataset("hello", sections, InsightDatasetKind.Sections)

            return expect(result2).to.eventually.be.rejectedWith(InsightError);
        });

        //***********************************************SUCCESSES******************************************************
        it ("should successfully add one dataset", function() {
            const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections)

            return expect(result).to.eventually.have.members(["ubc"]);
        });

        it ("should successfully add two different datasets", () => {
            facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections)
            const result2 = facade.addDataset("CPSC210", sections, InsightDatasetKind.Sections)

            return expect(result2).to.eventually.have.members(["CPSC110", "CPSC210"]);
        });

    });
});