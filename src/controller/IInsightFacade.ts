/*
 * This is the primary high-level API for the project. In this folder there should be:
 * A class called InsightFacade, this should be in a file called InsightFacade.ts.
 * You should not change this interface at all or the test suite will not work.
 */

export enum InsightDatasetKind {
	Sections = "sections",
	Rooms = "rooms",
}

export interface InsightDataset {
	id: string;
	kind: InsightDatasetKind;
	numRows: number;
}

export interface InsightResult {
	[key: string]: string | number;
}

export class InsightError extends Error {
	constructor(message?: string) {
		super(message);
		Error.captureStackTrace(this, InsightError);
	}
}

export class NotFoundError extends Error {
	constructor(message?: string) {
		super(message);
		Error.captureStackTrace(this, NotFoundError);
	}
}

export class ResultTooLargeError extends Error {
	constructor(message?: string) {
		super(message);
		Error.captureStackTrace(this, ResultTooLargeError);
	}
}

export interface IInsightFacade {
	/**
	 * Add a dataset to insightUBC.
	 *
	 * @param id  The id of the dataset being added.
	 * @param content  The base64 content of the dataset. This content should be in the form of a serialized zip file.
	 * @param kind  The kind of the dataset
	 *
	 * @return Promise <string[]>
	 *
	 * The promise should fulfill on a successful add, reject for any failures.
	 * The promise should fulfill with a string array,
	 * containing the ids of all currently added datasets upon a successful add.
	 * The promise should reject with an InsightError describing the error.
	 *
	 * An id is invalid if it contains an underscore, or is only whitespace characters.
	 * If id is the same as the id of an already added dataset, the dataset should be rejected and not saved.
	 *
	 * After receiving the dataset, it should be processed into a data structure of
	 * your design. The processed data structure should be persisted to disk; your
	 * system should be able to load this persisted value into memory for answering
	 * queries.
	 *
	 * Ultimately, a dataset must be added or loaded from disk before queries can
	 * be successfully answered.
	 */
	addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]>;


	/**
	 * Remove a dataset from insightUBC.
	 *
	 * @param id  The id of the dataset to remove.
	 *
	 * @return Promise <string>
	 *
	 * The promise should fulfill upon a successful removal. Reject on any error.
	 * A removed dataset behaves as if it never existed in the system (i.e. it was never added).
	 * Attempting to remove a dataset that hasn't been added yet counts as an error.
	 *
	 * An id is invalid if it contains an underscore, or is only whitespace characters.
	 *
	 * The promise should fulfill with the id of the dataset that was removed.
	 * The promise should reject with a NotFoundError (if a valid id was not yet added)
	 * or an InsightError (invalid id or any other source of failure) describing the error.
	 */
	removeDataset(id: string): Promise<string>;


	/**
	 * Perform a query on insightUBC.
	 *
	 * @param query  The query to be performed.
	 *
	 * If a query is incorrectly formatted, references a dataset not added (in memory or on disk),
	 * or references multiple datasets, it should be rejected with an InsightError.
	 * If a query would return more than 5000 results, it should be rejected with a ResultTooLargeError.
	 *
	 * @return Promise <InsightResult[]>
	 *
	 * The promise should fulfill with an array of results.
	 * The promise should reject with an InsightError describing the error.
	 */
	performQuery(query: unknown): Promise<InsightResult[]>;


	/**
	 * List all currently added datasets, their types, and number of rows.
	 *
	 * @return Promise <InsightDataset[]>
	 * The promise should fulfill an array of currently added InsightDatasets, and will only fulfill.
	 */
	listDatasets(): Promise<InsightDataset[]>;
}
