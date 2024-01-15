import InsightFacade from "../../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives} from "../resources/archives/TestUtil";
import {InsightDatasetKind, InsightError} from "../../src/controller/IInsightFacade";
import {expect} from "chai";
import {describe} from "mocha";

// describe("Testing base case for addDataset", () => {
//     before(() => {
//         const insightFacade = new InsightFacade();
//     })
// });

export interface ITestQuery {
    title: string; //title of the test case
    input: unknown; //the query under test
    errorExpected: boolean; //if the query is expected to throw an error
    expected: any; //the expected result
}

describe("InsightFacade", function() {
    //####################################################################################################    addDataset
    describe("addDataset", function() {
        let sections: string;
        let facade: InsightFacade;

        before(async function() {
            sections = await getContentFromArchives("shorterCourses.zip");
            var chai = require("chai");
            var chaiAsPromised = require("chai-as-promised");

            chai.use(chaiAsPromised);
        });

        beforeEach(async function() {
            await clearDisk();
            facade = new InsightFacade();
        });

        //**********************************************REJECTIONS******************************************************
        //empty id -----------------------------------------------------------------------------------------------------
        it ("should reject with an empty dataset id when adding", function() {
            const result = facade.addDataset("", sections, InsightDatasetKind.Sections)

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        //id containing underscore -------------------------------------------------------------------------------------
        it ("should reject if id added contains an underscore (at the front)", async () => {
           // const result = facade.addDataset("_UBC", sections, InsightDatasetKind.Sections)
           //
           // return expect(result).to.eventually.be.rejectedWith(InsightError);

            return facade.addDataset("_CPSC110", sections, InsightDatasetKind.Sections).then((result) => {
                expect.fail("should not have added");
            }).catch((error) => {
                expect(error).to.eventually.equal(Error);
            })
        });

        it ("should reject if id added contains an underscore (at the back)", async () => {
            // const result = facade.addDataset("UBC_", sections, InsightDatasetKind.Sections)
            //
            // return expect(result).to.eventually.be.rejectedWith(InsightError);

            return facade.addDataset("CPSC110_", sections, InsightDatasetKind.Sections).then((result) => {
                expect.fail("should not have added");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        });

        it ("should reject if id added contains an underscore (in the middle)", async () => {
            // const result = facade.addDataset("U_BC", sections, InsightDatasetKind.Sections)
            //
            // return expect(result).to.eventually.be.rejectedWith(InsightError);

            return facade.addDataset("CPSC_110", sections, InsightDatasetKind.Sections).then((result) => {
                expect.fail("should not have added");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        });

        it ("should reject if id added contains an underscore (multiple)", async () => {
            // const result = facade.addDataset("U_B_C_", sections, InsightDatasetKind.Sections)
            //
            // return expect(result).to.eventually.be.rejectedWith(InsightError);

            return facade.addDataset("C_P_S_C110", sections, InsightDatasetKind.Sections).then((result) => {
                expect.fail("should not have added");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        });

        //duplicate id -------------------------------------------------------------------------------------------------
        // it ("should reject when adding two duplicate datasets with same id", () => {
        //     facade.addDataset("hello", sections, InsightDatasetKind.Sections)
        //     const result2 = facade.addDataset("hello", sections, InsightDatasetKind.Sections)
        //
        //     return expect(result2).to.eventually.be.rejectedWith(InsightError);
        // });

        it ("should reject when adding two duplicate datasets with same id (not back to back)", async () => {
            await facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections)
            await facade.addDataset("CPSC210", sections, InsightDatasetKind.Sections)
            await facade.addDataset("CPSC310", sections, InsightDatasetKind.Sections)
            // const result2 = facade.addDataset("hello", sections, InsightDatasetKind.Sections)
            //
            // return expect(result2).to.eventually.be.rejectedWith(InsightError);

            return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result) => {
                expect.fail("should not have added");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        });

        //***********************************************SUCCESSES******************************************************
        it ("should successfully add one dataset", async function() {
            // const result = facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections)
            //
            // return expect(result).to.eventually.have.members(["CPSC110"]);

            // return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result) => {
            //     expect(result).to.eventually.equal(["CPSC110"]);
            // }).catch((error) => {
            //     expect.fail("should have added");
            // });

            try {
                const result = facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections);
                await result;
                expect(result).to.eventually.equal(["CPSC110"]);
            } catch (error) {
                expect.fail("should have added");
            }
        });

        it ("should successfully add two different datasets", async () => {
            // facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections);
            // return facade.addDataset("CPSC210", sections, InsightDatasetKind.Sections).then((result) => {
            //     //expect(result).to.eventually.have.members(["CPSC110", "CPSC210"]);
            //     expect(result).to.have.members(["CPSC110", "CPSC210"]);
            // }).catch((error) => {
            //     expect.fail("should have added");
            // })

            // return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result) => {
            //     facade.addDataset("CPSC210", sections, InsightDatasetKind.Sections).then((result2) => {
            //         expect(result2).to.eventually.equal(["CPSC110", "CPSC210"]);
            //     }).catch((error2) => {
            //         expect.fail("should have added");
            //     });
            // }).catch((error) => {
            //     expect.fail("should have added");
            // });

            // return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result1) => {
            //     expect(result1).to.eventually.equal(["CPSC110"]);
            //     return facade.addDataset("CSPC210", sections, InsightDatasetKind.Sections);
            // }).then((result2) => {
            //     expect(result2).to.eventually.equal(["CPSC110", "CPSC210"]);
            // }).catch((error) => {
            //     expect.fail("should have added");
            // });

            try {
                const result1 = facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections);
                //expect(result1).to.eventually.equal(["CPSC110"]);

                try {
                    const result2 = facade.addDataset("CSPC210", sections, InsightDatasetKind.Sections);
                    expect(result2).to.eventually.equal(["CPSC110", "CPSC210"]);
                } catch (error2) {
                    expect.fail("should have added");
                }
            } catch (error1) {
                expect.fail("should have added");
            }

            //return expect(result2).to.eventually.have.members(["CPSC110", "CPSC210"]);

        });

    });


    //#################################################################################################### removeDataset
    describe("removeDataset", () => {

        let sections: string;
        let facade: InsightFacade;

        before(async function() {
            sections = await getContentFromArchives("pair.zip");
            var chai = require("chai");
            var chaiAsPromised = require("chai-as-promised");

            chai.use(chaiAsPromised);
        });

        beforeEach(async function() {
            await clearDisk();
            facade = new InsightFacade();

            // await facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections);
            // await facade.addDataset("CPSC210", sections, InsightDatasetKind.Sections);
            // await facade.addDataset("CPSC221", sections, InsightDatasetKind.Sections);
            // await facade.addDataset("CPSC213", sections, InsightDatasetKind.Sections);
        });

        //**********************************************REJECTIONS******************************************************
        //empty id -----------------------------------------------------------------------------------------------------
        it ("should reject with an empty dataset id when remove", function() {
            const result = facade.removeDataset("")

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        //id containing underscore -------------------------------------------------------------------------------------
        it ("should reject if id removed contains an underscore (at the front)", async () => {
            return facade.removeDataset("_CPSC110").then((result) => {
                expect.fail("should not have been removed");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        });

        it ("should reject if id removed contains an underscore (at the back)", async () => {
            return facade.removeDataset("CPSC110_").then((result) => {
                expect.fail("should not have been removed");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        });

        it ("should reject if id removed contains an underscore (in the middle)", async () => {
            return facade.removeDataset("CPSC_110").then((result) => {
                expect.fail("should not have been removed");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        });

        it ("should reject if id removed contains an underscore (multiple)", async () => {
            return facade.removeDataset("C_P_S_C110").then((result) => {
                expect.fail("should not have been removed");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        });

        //non-existent id-----------------------------------------------------------------------------------------------
        it ("should fail if try and remove an id that is non-existent", async () => {
            return facade.removeDataset("CPEN211").then((result) => {
                expect.fail("should not have been removed");
            }).catch((error) => {
                expect(error).to.eventually.be.rejectedWith(InsightError);
            })
        })

        //***********************************************SUCCESSES******************************************************
        it ("should successfully remove one dataset", async function() {
            // return facade.removeDataset("CAPS449").then((result) => {
            //     expect(result).to.eventually.equal("CAPS449");
            // }).catch((error) => {
            //     expect.fail("should have removed");
            // });

            try {
                const result = facade.removeDataset("CAPS449");
                await result;
                expect(result).to.eventually.equal("CAPS449");
            } catch (error) {
                expect.fail("should have removed");
            }
        });

        it ("should successfully remove two different datasets", async () => {
            // return facade.removeDataset("CAPS449").then((result) => {
            //     facade.removeDataset("CAPS430").then((result2) => {
            //         expect(result2).to.eventually.equal("CAPS430");
            //     }).catch((error2) => {
            //         expect.fail("should have removed");
            //     });
            // }).catch((error) => {
            //     expect.fail("should have removed");
            // });

            try {
                const result1 = facade.removeDataset("CAPS449");
                await result1;
                expect(result1).to.eventually.equal("CAPS449");

                try {
                    const result2 = facade.removeDataset("CAPS430");
                    await result2;
                    expect(result2).to.eventually.equal("CAPS430");
                } catch (error2) {
                    expect.fail("should have removed");
                }
            } catch (error1) {
                expect.fail("should have removed");
            }

        });


    });


});