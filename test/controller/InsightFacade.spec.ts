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

// describe("Testing base case for addDataset", () => {
//     before(() => {
//         const insightFacade = new InsightFacade();
//     })
// });

export interface ITestQuery {
    title: string; //title of the test case
    input: unknown; //the query under test
    errorExpected: boolean; //if the query is expected to throw an error
    result: any; //the expected result
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
        it ("should reject with an empty dataset id when adding", function() { //test taken from CPSC310 site
            const result = facade.addDataset("", sections, InsightDatasetKind.Sections)

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        //id containing underscore -------------------------------------------------------------------------------------
        it ("should reject if id added contains an underscore (at the front)", async () => {
           // const result = facade.addDataset("_UBC", sections, InsightDatasetKind.Sections)
           //
           // return expect(result).to.eventually.be.rejectedWith(InsightError);

            // return facade.addDataset("_CPSC110", sections, InsightDatasetKind.Sections).then((result) => {
            //     expect.fail("should not have added");
            // }).catch((error) => {
            //     expect(error).to.eventually.equal(Error);
            // })

            try {
                await facade.addDataset("_CPSC110", sections, InsightDatasetKind.Sections);
                return expect.fail("should not have added");
            } catch (error) {
                return expect(error).to.be.an.instanceof(InsightError);
            }
        });

        it ("should reject if id added contains an underscore (at the back)", async () => {
            // const result = facade.addDataset("UBC_", sections, InsightDatasetKind.Sections)
            //
            // return expect(result).to.eventually.be.rejectedWith(InsightError);

            // return facade.addDataset("CPSC110_", sections, InsightDatasetKind.Sections).then((result) => {
            //     expect.fail("should not have added");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            try {
                await facade.addDataset("CPSC110_", sections, InsightDatasetKind.Sections);
                return expect.fail("should not have added");
            } catch (error) {
                return expect(error).to.be.an.instanceof(InsightError);
            }
        });

        it ("should reject if id added contains an underscore (in the middle)", async () => {
            // const result = facade.addDataset("U_BC", sections, InsightDatasetKind.Sections)
            //
            // return expect(result).to.eventually.be.rejectedWith(InsightError);

            // return facade.addDataset("CPSC_110", sections, InsightDatasetKind.Sections).then((result) => {
            //     expect.fail("should not have added");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            try {
                await facade.addDataset("CPSC_110", sections, InsightDatasetKind.Sections);
                return expect.fail("should not have added");
            } catch (error) {
                return expect(error).to.be.an.instanceof(InsightError);
            }
        });

        it ("should reject if id added contains an underscore (multiple)", async () => {
            // const result = facade.addDataset("U_B_C_", sections, InsightDatasetKind.Sections)
            //
            // return expect(result).to.eventually.be.rejectedWith(InsightError);

            // return facade.addDataset("C_P_S_C110", sections, InsightDatasetKind.Sections).then((result) => {
            //     expect.fail("should not have added");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            try {
                await facade.addDataset("C_P_S_C110", sections, InsightDatasetKind.Sections);
                return expect.fail("should not have added");
            } catch (error) {
                return expect(error).to.be.an.instanceof(InsightError);
            }
        });

        //duplicate id -------------------------------------------------------------------------------------------------
        // it ("should reject when adding two duplicate datasets with same id", () => {
        //     facade.addDataset("hello", sections, InsightDatasetKind.Sections)
        //     const result2 = facade.addDataset("hello", sections, InsightDatasetKind.Sections)
        //
        //     return expect(result2).to.eventually.be.rejectedWith(InsightError);
        // });

        it ("should reject when adding two duplicate datasets with same id", async () => {
            // await facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections)
            // await facade.addDataset("CPSC210", sections, InsightDatasetKind.Sections)
            // await facade.addDataset("CPSC310", sections, InsightDatasetKind.Sections)

            // const result2 = facade.addDataset("hello", sections, InsightDatasetKind.Sections)
            //
            // return expect(result2).to.eventually.be.rejectedWith(InsightError);

            // return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result) => {
            //     expect.fail("should not have added");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            // try {
            //     await facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections);
            //     return expect.fail("should not have added");
            // } catch (error) {
            //     return expect(error).to.be.an.instanceof(InsightError);
            // }

            return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result) => {
                return facade.addDataset("CPSC110", sections, InsightDatasetKind.Sections).then((result1) => {
                    return expect.fail("should not have added");
                })
            }).catch((error) => {
                return expect(error).to.be.an.instanceof(InsightError);
            })
        });

        it ("should reject if adding same dataset to a new instance of facade", async () => {
            // try {
            //     const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
            //     await result;
            //     expect(result).to.eventually.equal(["ubc"]);
            //     try {
            //         const facade2 = new InsightFacade();
            //         const result2 = facade2.addDataset("ubc", sections, InsightDatasetKind.Sections);
            //         await result2;
            //         return expect.fail("should not have added");
            //     } catch (error1) {
            //         return expect(error1).to.be.an.instanceof(InsightError);
            //     }
            // } catch (error) {
            //     return expect.fail("should have added");
            // }
            await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
            try {
                const facade2 = new InsightFacade();
                const result2 = facade2.addDataset("ubc", sections, InsightDatasetKind.Sections);
                await result2;
                return expect.fail("should not have added");
            } catch (error) {
                return expect(error).to.be.an.instanceof(InsightError);
            }


        })

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
                await result1;
                //expect(result1).to.eventually.equal(["CPSC110"]);

                try {
                    const result2 = facade.addDataset("CSPC210", sections, InsightDatasetKind.Sections);
                    await result2;
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
        it ("should reject with an empty dataset id when remove", function() {
            const result = facade.removeDataset("")

            return expect(result).to.eventually.be.rejectedWith(InsightError);
        });

        //id containing underscore -------------------------------------------------------------------------------------
        it ("should reject if id removed contains an underscore (at the front)", async () => {
            // return facade.removeDataset("_CPSC110").then((result) => {
            //     expect.fail("should not have been removed");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            try {
                await facade.removeDataset("_CPSC110");
                expect.fail("should not have removed");
            } catch (error) {
                expect(error).to.be.an.instanceof(InsightError);
            }
        });

        it ("should reject if id removed contains an underscore (at the back)", async () => {
            // return facade.removeDataset("CPSC110_").then((result) => {
            //     expect.fail("should not have been removed");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            try {
                await facade.removeDataset("CPSC110_");
                expect.fail("should not have removed");
            } catch (error) {
                expect(error).to.be.an.instanceof(InsightError);
            }
        });

        it ("should reject if id removed contains an underscore (in the middle)", async () => {
            // return facade.removeDataset("CPSC_110").then((result) => {
            //     expect.fail("should not have been removed");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            try {
                await facade.removeDataset("CPSC_110");
                expect.fail("should not have removed");
            } catch (error) {
                expect(error).to.be.an.instanceof(InsightError);
            }
        });

        it ("should reject if id removed contains an underscore (multiple)", async () => {
            // return facade.removeDataset("C_P_S_C110").then((result) => {
            //     expect.fail("should not have been removed");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            try {
                await facade.removeDataset("C_P_S_C110");
                expect.fail("should not have removed");
            } catch (error) {
                expect(error).to.be.an.instanceof(InsightError);
            }
        });

        //non-existent id-----------------------------------------------------------------------------------------------
        it ("should fail if try and remove an id that is non-existent", async () => {
            // return facade.removeDataset("CPEN211").then((result) => {
            //     expect.fail("should not have been removed");
            // }).catch((error) => {
            //     expect(error).to.eventually.be.rejectedWith(InsightError);
            // })

            await facade.addDataset("CAPS449", sections, InsightDatasetKind.Sections);

            try {
                await facade.removeDataset("hello");
                expect.fail("should not have removed");
            } catch (error) {
                expect(error).to.be.an.instanceof(NotFoundError);
            }
        })

        //***********************************************SUCCESSES******************************************************
        it ("should successfully remove one dataset", async function() {
            // return facade.removeDataset("CAPS449").then((result) => {
            //     expect(result).to.eventually.equal("CAPS449");
            // }).catch((error) => {
            //     expect.fail("should have removed");
            // });

            await facade.addDataset("CAPS449", sections, InsightDatasetKind.Sections);

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

            await facade.addDataset("CAPS449", sections, InsightDatasetKind.Sections);
            await facade.addDataset("CAPS430", sections, InsightDatasetKind.Sections);

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

    //#################################################################################################### listDataset
    describe("listDataset", () => {

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
        });

        it ("should list an empty datset", async () => {
            const datasets = await facade.listDatasets();

            expect(datasets).to.deep.equal([]);
        })

        //test taken from CPSC310 site
        it ("should list one dataset", async () => {
            //Setup
            await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);

            //Execution
            const datasets = await facade.listDatasets();

            //Validation
            expect(datasets).to.deep.equal([{
                id: "ubc",
                kind: InsightDatasetKind.Sections,
                numRows: 64612
            }]);
        });

        it ("should list multiple datasets", async () => {
            await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
            await facade.addDataset("sfu", sections, InsightDatasetKind.Sections);
            await facade.addDataset("uofc", sections, InsightDatasetKind.Sections);

            const datasets = await facade.listDatasets();

            expect(datasets).to.deep.equal([
                {id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612},
                {id: "sfu", kind: InsightDatasetKind.Sections, numRows: 64612},
                {id: "uofc", kind: InsightDatasetKind.Sections, numRows: 64612}
            ]);
        });

        it ("should list multiple datasets after a sequence of add and remove", async () => {
            await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
            await facade.addDataset("sfu", sections, InsightDatasetKind.Sections);
            await facade.removeDataset("sfu");
            await facade.addDataset("uofc", sections, InsightDatasetKind.Sections);
            await facade.removeDataset("ubc");

            const datasets = await facade.listDatasets();

            expect(datasets).to.deep.equal([{
                id: "uofc",
                kind: InsightDatasetKind.Sections,
                numRows: 64612
            }]);
        })

    });




    //######################################################################################################performQuery

    describe("performQuery", () => {
        let sections: string;
        let facade: InsightFacade;

        before(async function() {
            sections = await getContentFromArchives("pair.zip");
            facade = new InsightFacade();

            var chai = require("chai");
            var chaiAsPromised = require("chai-as-promised");
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
                        //assert.fail("Write your assertions here!");
                        //expect(result).to.equal(test.expected);



                        if (!test.errorExpected) {
                            //assert.fail("asdlfkjasdfkla");
                            expect(result).to.be.deep.equal(test.result);
                            //expect(result).to.be.deep.members(test.result);

                        } else {
                            throw new Error("error expected");
                        }

                    }).catch((err: string) => {
                        assert.fail(`performQuery threw unexpected error: ${err}`);
                    });

                    // try {
                    //     const result = facade.performQuery(test.input);
                    //     await result;
                    //     expect(result).to.eventually.equal(test.expected);
                    // } catch (err: unknown) {
                    //     assert.fail(`performQuery threw unexpected error: ${err}`);
                    // }
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
                        assert.fail('should have thrown an error');
                    } catch (err: unknown) {
                        //expect(err).to.be.an.instanceof(InsightError);
                        //expect(err).to.be.an.instanceof(ResultTooLargeError);
                        expect(err).to.be.an.instanceof(Error);
                    }
                });
            });


        })

    });


});