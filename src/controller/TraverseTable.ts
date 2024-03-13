import {parse, defaultTreeAdapter} from "parse5";
import {InsightDataset, InsightError} from "./IInsightFacade";
import Dataset from "./Dataset";
import Room from "./Room";
import * as http from "http";

export default class TraverseTable {
	private indexColumnNames: string[] = [
		"views-field views-field-field-building-image",
		"views-field views-field-field-building-code",
		"views-field views-field-title",
		"views-field views-field-field-building-address",
		"views-field views-field-nothing"
	];

	private buildingRoomColumnNames: string[] = [
		"views-field views-field-field-room-number",
		"views-field views-field-field-room-capacity",
		"views-field views-field-field-room-furniture",
		"views-field views-field-field-room-type",
		"views-field views-field-nothing"
	];

	private indexTableExist: boolean = false;
	private roomsTableExist: boolean = false;
	private count = 0;
	private getLink = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team103/";
	private buildingLinkedFromIndex: BuildingInfo[] = [];

	// ================================================ index.htm ======================================================
	// iterate through the index table
	public handleIndexHTML(document: any) {
		let table = this.handleTable(document, "table");
		if (this.indexTableExist) {
			let tbody = this.handleTBody(table, "tbody");
			this.handleTr(tbody, "tr");
		} else {
			throw new InsightError("No valid table inside index.htm");
		}
		return this.buildingLinkedFromIndex;
	}

	// finds the buildings table
	private handleTable (node: any, tag: string): any {
		if (!node || !node.childNodes) {
			return null;
		}
		const len = node.childNodes.length;
		for (let i = 0; i < len; i++) {
			let child = node.childNodes[i];
			if (child.nodeName === tag && child.attrs[0].value ===  "views-table cols-5 table") {
				this.indexTableExist = true;
				return child;
			}
			const result = this.handleTable(node.childNodes[i], tag);
			if (result) {
				return result;
			}
		}
		return null;
	}

	// extracts all the building information from the building table
	private handleTr (node: any, tag: string): any {
		if (!node) {
			return;
		}
		if (!node.childNodes) {
			return;
		}
		for (const tr of node.childNodes) {
			let hasAllElement = true;
			let buildingName: string = "";
			let buildingCode: string = "";
			let buildingAddress: string = "";
			let buildingLink: string = "";

			if (tr.nodeName === tag) {
				for (const td of tr.childNodes) {
					if (td.nodeName === "td" && this.indexColumnNames.includes(td.attrs[0].value)) {
						hasAllElement = hasAllElement && true;

						if (td.attrs[0].value === "views-field views-field-field-building-code") {
							buildingCode = td.childNodes[0].value.trim();
						} else if (td.attrs[0].value === "views-field views-field-title") {
							buildingName = td.childNodes[1].childNodes[0].value.trim();
						} else if (td.attrs[0].value === "views-field views-field-field-building-address") {
							buildingAddress = td.childNodes[0].value.trim();
						} else if (td.attrs[0].value === "views-field views-field-nothing") {
							buildingLink = td.childNodes[1].attrs[0].value.substring(2);
						}
					} else if (td.nodeName === "td" && !this.indexColumnNames.includes(td.attrs[0].value)) {
						hasAllElement = hasAllElement && false;
						break;
					}
				}
			}
			if (hasAllElement) {
				let buildingInfo: BuildingInfo = {
					buildingName: buildingName,
					buildingCode: buildingCode,
					address: buildingAddress,
					link: buildingLink
				};
				this.buildingLinkedFromIndex.push(buildingInfo);
			}

			this.handleTr(tr, tag);
		}
		return;
	}
	// ================================================ index.htm ======================================================

	// find the body in the table
	private handleTBody (node: any, tag: string): any {
		if (!node || !node.childNodes) {
			return null;
		}
		const len = node.childNodes.length;
		for (let i = 0; i < len; i++) {
			let child = node.childNodes[i];
			if (child.nodeName === tag) {
				return child;
			}
		}
		return null;
	}

	// ================================================ buildings ======================================================
	// iterate through the rooms table for the building
	public async handleBuildingFile(document: any, dataset: Dataset, buildingInfo: BuildingInfo) {
		let table = this.handleBuildingTable(document, "table");
		if (this.roomsTableExist) {
			let tbody = this.handleTBody(table, "tbody");
			await this.handleBuildingTr(tbody, "tr", buildingInfo, dataset);
		}
		return;
	}

	// finds the rooms table if it exists
	private handleBuildingTable (node: any, tag: string): any {
		for (let i = 0; i < node.childNodes?.length; i++) {
			let child = node.childNodes[i];
			if (child.nodeName === tag && child.attrs[0].value ===  "views-table cols-5 table") {
				this.roomsTableExist = true;
				return child;
			}
			const result = this.handleBuildingTable(node.childNodes[i], tag);
			if (result) {
				return result;
			}
		}
		return null;
	}

	// handles each of the rooms listed in the rooms table
	private async handleBuildingTr(node: any, tag: string, buildingInfo: BuildingInfo, dataset: Dataset) {

		if (!node || !node.childNodes) {
			return;
		}

		let urlEncodedAddress = encodeURIComponent(buildingInfo.address);
		let urlForRoom = this.getLink + urlEncodedAddress;
		let location: Location = await this.getLatLon(urlForRoom);

		for (const tr of node.childNodes) {
			if (tr.nodeName === tag) {
				let hasAllElement = true;
				hasAllElement = this.validateRoom(tr, hasAllElement);
				if (hasAllElement) {
					this.count++;
					this.fetchRoomData(buildingInfo, location.latitutde, location.longitude, tr, dataset);
				}
			}
		}
	}

	// gets the geolocation for the building
	private getLatLon(urlForRoom: string): Promise<Location> {
		return new Promise ((resolve, reject) => {
			http.get(urlForRoom, (response) => {
				let data = "";
				response.on("data", (chunk) => {
					data += chunk;
				});
				response.on("end", () => {
					const json = JSON.parse(data);
					let location: Location;
					let buildingLat: string;
					let buildingLon: string;
					if (!json.error) {
						buildingLat = json.lat;
						buildingLon = json.lon;

						location = {latitutde: buildingLat.toString(), longitude: buildingLon.toString()};

						resolve(location);
					} else {
						console.log("Error response:", json);
						reject(new InsightError("cannot get geolocation"));
					}

				});
			}).on("error", (error) => {
				console.error("Error fetching room data:", error);
				reject(error);
			});
		});

	}

	// checks that the room in the table has each of the sections that the table specifies
	private validateRoom(tr: any, hasAllElement: boolean) {
		for (const td of tr.childNodes) {
			if (td.nodeName === "td" && this.buildingRoomColumnNames.includes(td.attrs[0].value)) {
				hasAllElement = hasAllElement && true;
			} else if (td.nodeName === "td" && !this.buildingRoomColumnNames.includes(td.attrs[0].value)) {
				hasAllElement = hasAllElement && false;
				break;
			}
		}
		return hasAllElement;
	}

	// extracts all the information necessary for the rooms to be stored in the dataset
	private fetchRoomData(buildingInfo: BuildingInfo, latitude: string, longitude: string, tr: any, dataset: Dataset) {
		let buildingFullName = buildingInfo.buildingName;
		let buildingShortName = buildingInfo.buildingCode;
		let roomNumber;
		let roomName;
		let buildingAddress = buildingInfo.address;
		let roomLat = latitude;
		let roomLon = longitude;
		let roomCapacity;
		let roomType;
		let roomFurniture;
		let roomLink;

		for (const td of tr.childNodes) {
			// let td = tr.childNodes[j];

			if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-field-room-number") {
				roomNumber = td.childNodes[1].childNodes[0].value;
			} else if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-field-room-capacity") {
				let temp = td.childNodes[0].value;
				roomCapacity = temp.replace(/\D/g, "");
			} else if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-field-room-furniture") {
				let temp = td.childNodes[0].value;
				roomFurniture = temp.trim().match(/\S.*\S/)?.[0] || "";
			} else if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-field-room-type") {
				let temp = td.childNodes[0].value;
				roomType = temp.trim().match(/\S.*\S/)?.[0] || "";
			} else if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-nothing") {
				roomLink = td.childNodes[1].attrs[0].value;
			}
		}

		roomName = buildingShortName + "_" + roomNumber;

		let newRoom = this.createRoom(buildingFullName,
			buildingShortName,
			roomNumber,
			roomName,
			buildingAddress,
			roomLat,
			roomLon,
			roomCapacity,
			roomType,
			roomFurniture,
			roomLink);
		dataset.setValidity(true);
		dataset.addValidRoom(newRoom);
	}

// ================================================ buildings ======================================================

	// creates a new room
	private createRoom (
		buildingFullName: string,
		buildingShortName: string,
		roomNumber: string,
		roomName: string,
		buildingAddress: string,
		lat: string,
		lon: string,
		roomCapacity: string,
		roomType: string,
		roomFurniture: string,
		roomLink: string
	): Room {
		return new Room (
			buildingFullName,
			buildingShortName,
			roomNumber,
			roomName,
			buildingAddress,
			Number(lat),
			Number(lon),
			Number(roomCapacity),
			roomType,
			roomFurniture,
			roomLink
		);
	}
}

// interface to hold all the information about the building
export interface BuildingInfo {
	buildingName: string;
	buildingCode: string;
	address: string;
	link: string;
}

// interface to hold geolocation of the building
export interface Location {
	latitutde: string;
	longitude: string;
}
