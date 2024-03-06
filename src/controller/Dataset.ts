import Section from "./Section";
import {InsightDatasetKind} from "./IInsightFacade";
import Room from "./Room";

export default class Dataset {
	private idName: string = "";
	private validSections: Section[] = [];
	private validRooms: Room[] = [];
	private kind: InsightDatasetKind = InsightDatasetKind.Sections;
	private isValidDataset: boolean = false;

	public setIDName(id: string) {
		this.idName = id;
	}

	public addValidSection(section: Section) {
		this.validSections.push(section);
	}

	public addValidRoom(room: Room) {
		this.validRooms.push(room);
	}

	public setKind(datasetKind: InsightDatasetKind) {
		this.kind = datasetKind;
	}

	public setValidity(bool: boolean) {
		this.isValidDataset = bool;
	}

	public getIDName() {
		return this.idName;
	}

	public getValidSections() {
		return this.validSections;
	}

	public getValidRooms() {
		return this.validRooms;
	}

	public getKind() {
		return this.kind;
	}

	public getValidity() {
		return this.isValidDataset;
	}
}
