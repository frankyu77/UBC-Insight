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
	private actualCount = 0;

	// ================================================ index.htm ======================================================
	public handleIndexHTML(document: any) {
		let table = this.handleTable(document, "table");
		console.log(this.indexTableExist);
		if (this.indexTableExist) {
			let tbody = this.handleTBody(table, "tbody");
			this.handleTr(tbody, "tr");
		} else {
			console.log("asdfasldfasldfa");
			throw new InsightError("No valid table inside index.htm");
		}
		return this.buildingLinkedFromIndex;
	}

	private handleTable (node: any, tag: string): any {
		for (let i = 0; i < node.childNodes?.length; i++) {
			let child = node.childNodes[i];
			// "views-table cols-5 table"
			if (child.nodeName === tag && child.attrs[0].value ===  "views-table cols-5 table") {
				// console.log(child);
				this.indexTableExist = true;
				// console.log("------------------------" + child.nodeName + "------------------------------")
				// console.log(child.attrs[0].value);
				return child;
			}
			const result = this.handleTable(node.childNodes[i], tag);
			if (result) {
				return result;
			}
		}
		return null;
	}

	private handleTBody (node: any, tag: string): any {
		for (let i = 0; i < node.childNodes?.length; i++) {
			let child = node.childNodes[i];
			// "views-table cols-5 table"
			if (child.nodeName === tag) {  // error in second case
				// console.log(child);
				// console.log("------------------------" + child.nodeName + "------------------------------")
				return child;
			}
			const result = this.handleTBody(node.childNodes[i], tag);
			if (result) {
				return result;
			}
		}
		return null;
	}

	private handleTr (node: any, tag: string): any {
		if (!node) {
			return;
		}
		if (!node.childNodes) {
			return;
		}
		for (const tr of node.childNodes) {
			// let child = node.childNodes[i];
			let hasAllElement = true;
			let buildingName: string = "";
			let buildingCode: string = "";
			let buildingAddress: string = "";
			let buildingLink: string = "";

			if (tr.nodeName === tag) {
				// console.log("------------------------" + child.nodeName + "------------------------------")
				for (const td of tr.childNodes) {
					// let td = tr.childNodes[j];
					if (td.nodeName === "td" && this.indexColumnNames.includes(td.attrs[0].value)) {
						// console.log("======" + childOfTr.nodeName + "======")
						// console.log(childOfTr.attrs[0].value);

						// if (childOfTr.attrs[0].value === "views-field views-field-nothing") {
						// 	console.log("path = " + childOfTr.childNodes[1].attrs[0].value);
						// 	this.buildingLinkedFromIndex.push(childOfTr.childNodes[1].attrs[0].value);
						// }

						hasAllElement = hasAllElement && true;

						if (td.attrs[0].value === "views-field views-field-field-building-code") {
							buildingCode = td.childNodes[0].value.trim();
							//console.log(buildingCode);
						} else if (td.attrs[0].value === "views-field views-field-title") {
							buildingName = td.childNodes[1].childNodes[0].value.trim();
							//console.log(buildingName)
						} else if (td.attrs[0].value === "views-field views-field-field-building-address") {
							buildingAddress = td.childNodes[0].value.trim();
							//console.log(buildingAddress);
						} else if (td.attrs[0].value === "views-field views-field-nothing") {
							// console.log(td.childNodes[1].attrs[0].value.substring(2));
							//this.buildingLinkedFromIndex.push(td.childNodes[1].attrs[0].value.substring(2));
							buildingLink = td.childNodes[1].attrs[0].value.substring(2);
							//console.log(buildingLink);
						}
					} else if (td.nodeName === "td" && !this.indexColumnNames.includes(td.attrs[0].value)) {
						// throw new InsightError("Invalid td in index.htm table");
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


	// ================================================ buildings ======================================================
	public async handleBuildingFile(document: any, dataset: Dataset, buildingInfo: BuildingInfo) {
		// console.log("handle building reached");
		let table = this.handleBuildingTable(document, "table");
		if (this.roomsTableExist) {
			// let buildingInfo: BuildingInfo;
			// buildingInfo = this.getBuildingInfo(document, "building-info");
			try {
				let tbody = this.handleBuildingTBody(table, "tbody");
				await this.handleBuildingTr(tbody, "tr", buildingInfo, dataset);
			} catch (error) {
				console.log(error);
				// throw new InsightError("error while reading table");
			}

		}
		return;
	}

	// private getBuildingInfo(node: any, value: string): any {
	// 	for (let i = 0; i < node.childNodes?.length; i++) {
	// 		let child = node.childNodes[i];
	// 		if (child.nodeName === "div" && child.attrs[0].value === "building-info") {
	// 			// console.log ("ASLKDJFALSKDFJHALSKJDFHLASJKDFNLAJKSVLAKSJDBVNLASKJDFLASKJDFHLASKJBLVKJSDBNVLAKJNFLKJASDFNLKJ");
	// 			let fullName = child.childNodes[1].childNodes[0].childNodes[0].value;
	// 			let address = child.childNodes[3].childNodes[0].childNodes[0].value;
	// 			// console.log(fullName);		// FULL NAME GOT
	// 			// console.log(address);		// ADDRESS GOT
	// 			let buildingInfo: BuildingInfo = {name: fullName, address: address};
	// 			// might have to create a dictionary to get the short name from the full namem
	// 			return buildingInfo;
	// 		}
	// 		const result = this.getBuildingInfo(node.childNodes[i], value);
	// 		if (result) {
	// 			return result;
	// 		}
	// 	}
	// 	return null;
	// }

	private handleBuildingTable (node: any, tag: string): any {
		for (let i = 0; i < node.childNodes?.length; i++) {
			let child = node.childNodes[i];
			// "views-table cols-5 table"
			if (child.nodeName === tag && child.attrs[0].value ===  "views-table cols-5 table") {
				// console.log(child);
				this.roomsTableExist = true;
				// console.log("------------------------" + child.nodeName + "------------------------------")
				// console.log(child.attrs[0].value);
				return child;
			}
			const result = this.handleBuildingTable(node.childNodes[i], tag);
			if (result) {
				return result;
			}
		}
		return null;
	}

	private handleBuildingTBody (node: any, tag: string): any {
		if (!node || !node.childNodes) return null;
		const len = node.childNodes.length;
		for (let i = 0; i < len; i++) {
			let child = node.childNodes[i];
			// "views-table cols-5 table"
			if (child.nodeName === tag) {  // error in second case
				// console.log(child);
				// console.log("------------------------" + child.nodeName + "------------------------------");
				return child;
			}
			// const result = this.handleBuildingTBody(node.childNodes[i], tag);
			// if (result) {
			// 	return result;
			// }
		}
		return null;
	}

	// private async handleBuildingTr (node: any, tag: string, buildingInfo: BuildingInfo, dataset: Dataset): Promise<void> {
	// 	const promises: unknown[] = [];
	// 	if (!node) return;
	// 	if (!node.childNodes) return;
	//
	// 	for (let i = 0; i < node.childNodes.length; i++) {
	// 		let tr = node.childNodes[i];
	// 		if (tr.nodeName === tag) {
	// 			console.log("------------------------" + tr.nodeName + "------------------------------")
	// 			let hasAllElement = true;
	// 			for (let j = 0; j < tr.childNodes.length; j++) {
	// 				let td = tr.childNodes[j];
	// 				if (td.nodeName === "td" && this.buildingRoomColumnNames.includes(td.attrs[0].value)) {
	// 					hasAllElement = hasAllElement && true;
	// 					console.log("======" + td.nodeName + "======")
	// 					// console.log(childOfTr.attrs[0].value);
	// 				} else if (td.nodeName === "td" && !this.buildingRoomColumnNames.includes(td.attrs[0].value)) {
	// 					// throw new InsightError("Invalid td in building's rooms table");
	// 					// HANDLE WHEN THE ROOM ONLY HAS 4/5 OF THE VALID FIELDS, etc
	// 					hasAllElement = hasAllElement && false;
	// 					break;
	// 				}
	// 			}
	// 			if (hasAllElement) {
	// 				this.count++;
	// 				console.log(this.count);
	// 				// console.log(node.parentNode.nodeName);
	// 				console.log("full building name = " + buildingInfo.name);
	// 				console.log("building address = " + buildingInfo.address);
	//
	// 				let urlEncodedAddress: string = buildingInfo.address.replace(/ /g, "%20");
	// 				console.log("url encoded addy = " + urlEncodedAddress);
	// 				let urlForRoom = this.getLink + urlEncodedAddress;
	//
	// 				promises.push(
	// 				await fetch(urlForRoom)
	// 					.then((response) => response.json())
	// 					.then(async (json: any) => {
	// 						if (!json.error) {
	// 							// console.log("THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR ")
	// 							console.log(json)
	// 							var buildingFullName = buildingInfo.name;
	// 							var buildingShortName;
	// 							var roomNumber;
	// 							var roomName;
	// 							var buildingAddress = buildingInfo.address;
	// 							var lat = json.lat;
	// 							var lon = json.lon;
	// 							var roomCapacity;
	// 							var roomType;
	// 							var roomFurniture;
	// 							var roomLink;
	//
	// 							for (let j = 0; j < tr.childNodes.length; j++) {
	// 								let td = tr.childNodes[j];
	//
	// 								if (td.nodeName === "td" && td.attrs[0].value === "views-field views-field-field-room-number") {
	// 									roomNumber = td.childNodes[1].childNodes[0].value;
	// 									console.log("roomNumber = " + roomNumber);
	// 								} else if (td.nodeName === "td" && td.attrs[0].value === "views-field views-field-field-room-capacity") {
	// 									var temp = td.childNodes[0].value;
	// 									roomCapacity = temp.replace(/\D/g, '');
	// 									console.log("room capacity = " + roomCapacity);
	// 								} else if (td.nodeName === "td" && td.attrs[0].value === "views-field views-field-field-room-furniture") {
	// 									var temp = td.childNodes[0].value;
	// 									roomFurniture = temp.trim().match(/\S.*\S/)?.[0] || '';
	// 									console.log("room furniture = " + roomFurniture);
	// 								} else if (td.nodeName === "td" && td.attrs[0].value === "views-field views-field-field-room-type") {
	// 									var temp = td.childNodes[0].value;
	// 									roomType = temp.trim().match(/\S.*\S/)?.[0] || '';
	// 									console.log("room type = " + roomType);
	// 								} else if (td.nodeName === "td" && td.attrs[0].value === "views-field views-field-nothing") {
	// 									roomLink = td.childNodes[1].attrs[0].value;
	// 									console.log("link = " + roomLink);
	// 									let buildingRoom = roomLink.split("/").pop();
	// 									buildingShortName = buildingRoom.split("-")[0];
	// 									console.log("building short name = " + buildingShortName);
	// 								}
	// 							}
	//
	// 							roomName = buildingShortName + "_" + roomNumber;
	// 							console.log("room name = " + roomName);
	//
	// 							let newRoom = this.createRoom (buildingFullName,
	// 								buildingShortName,
	// 								roomNumber,
	// 								roomName,
	// 								buildingAddress,
	// 								lat,
	// 								lon,
	// 								roomCapacity,
	// 								roomType,
	// 								roomFurniture,
	// 								roomLink);
	// 							dataset.setValidity(true);
	// 							dataset.addValidRoom(newRoom);
	//
	// 						} else {
	// 							console.log("THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR ")
	// 							console.log("ERROR IS THIS: ");
	// 							console.log(json)
	// 						}
	// 						// console.log(json)
	// 					})
	// 					.catch(error => {
	// 						console.error("Error fetching room data:", error); // Log any fetch errors
	// 					})
	// 				);
	//
	//
	// 			}
	// 		}
	// 		await this.handleBuildingTr(tr, tag, buildingInfo, dataset);
	// 	}
	// 	await Promise.all(promises);
	// 	console.log("valid rooms = " + dataset.getValidRooms().length);
	// };

	private async handleBuildingTr(node: any, tag: string, buildingInfo: BuildingInfo, dataset: Dataset) {

		// const promises: Array<Promise<void>> = [];
		if (!node || !node.childNodes) {
			return;
		}

		let lat: string = "";
		let lon: string = "";

		let urlEncodedAddress: string = buildingInfo.address.replace(/ /g, "%20");
		let urlForRoom = this.getLink + urlEncodedAddress;

		this.getLatLon(urlForRoom, lat, lon);

		for (const tr of node.childNodes) {
			// let tr = node.childNodes[i];
			if (tr.nodeName === tag) {
				let hasAllElement = true;
				hasAllElement = this.validateRoom(tr, hasAllElement);
				if (hasAllElement) {
					this.count++;
					this.fetchRoomData(buildingInfo, lat, lon, tr, dataset);
					// console.log(urlForRoom);

					//promises.push(new Promise<void>((resolve, reject) => {
						// http.get(urlForRoom, (response) => {
						// 	let data = "";
						// 	response.on("data", (chunk) => {
						// 		data += chunk;
						// 	});
						// 	response.on("end", () => {
						// 		const json = JSON.parse(data);
						// 		if (!json.error) {
						// 			// console.log("THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR ")
						// 			// console.log(json);
						// 			this.fetchRoomData(buildingInfo, json, tr, dataset);
						//
						// 		} else {
						// 			console.log("Error response:", json);
						// 		}
						// 		resolve();
						// 	});
						// }).on("error", (error) => {
						// 	console.error("Error fetching room data:", error);
						// 	reject(error);
						// });
					//}));
				}
			}
			// await
			// this.handleBuildingTr(tr, tag, buildingInfo, dataset);
		}
		//await Promise.all(promises);

		// for (const tr of node.childNodes) {
		// 	await this.handleBuildingTr(tr, tag, buildingInfo, dataset);
		// }
	}

	private getLatLon(urlForRoom: string, lat: string, lon: string) {
		//console.log("get called");
		return new Promise ((resolve, reject) => {
			http.get(urlForRoom, (response) => {
				let data = "";
				response.on("data", (chunk) => {
					data += chunk;
				});
				response.on("end", () => {
					const json = JSON.parse(data);
					if (!json.error) {
						// console.log("THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR THERE IS AN ERROR ")
						// console.log(json);
						// this.fetchRoomData(buildingInfo, json, tr, dataset);
						lat = json.lat;
						lon = json.lon;
					} else {
						console.log("Error response:", json);
					}
					resolve("worked");
				});
			}).on("error", (error) => {
				console.error("Error fetching room data:", error);
				reject(error);
			});
		});

	}

	private validateRoom(tr: any, hasAllElement: boolean) {
		for (const td of tr.childNodes) {
			// let td = tr.childNodes[j];
			if (td.nodeName === "td" && this.buildingRoomColumnNames.includes(td.attrs[0].value)) {
				hasAllElement = hasAllElement && true;
			} else if (td.nodeName === "td" && !this.buildingRoomColumnNames.includes(td.attrs[0].value)) {
				hasAllElement = hasAllElement && false;
				break;
			}
		}
		return hasAllElement;
	}

	private fetchRoomData(buildingInfo: BuildingInfo, latitude: string, longitude: string, tr: any, dataset: Dataset) {
		let buildingFullName = buildingInfo.buildingName;
		let buildingShortName = buildingInfo.buildingCode;
		let roomNumber;
		let roomName;
		let buildingAddress = buildingInfo.address;
		let lat = latitude;
		let lon = longitude;
		let roomCapacity;
		let roomType;
		let roomFurniture;
		let roomLink;

		for (const td of tr.childNodes) {
			// let td = tr.childNodes[j];

			if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-field-room-number") {
				roomNumber = td.childNodes[1].childNodes[0].value;
				// console.log("roomNumber = " + roomNumber);
			} else if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-field-room-capacity") {
				let temp = td.childNodes[0].value;
				roomCapacity = temp.replace(/\D/g, "");
				// console.log("room capacity = " + roomCapacity);
			} else if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-field-room-furniture") {
				let temp = td.childNodes[0].value;
				roomFurniture = temp.trim().match(/\S.*\S/)?.[0] || "";
				// console.log("room furniture = " + roomFurniture);
			} else if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-field-room-type") {
				let temp = td.childNodes[0].value;
				roomType = temp.trim().match(/\S.*\S/)?.[0] || "";
				// console.log("room type = " + roomType);
			} else if (td.nodeName === "td" &&
				td.attrs[0].value === "views-field views-field-nothing") {
				roomLink = td.childNodes[1].attrs[0].value;
				// console.log("link = " + roomLink);
				// let buildingRoom = roomLink.split("/").pop();
				// buildingShortName = buildingRoom.split("-")[0];
				// console.log("building short name = " + buildingShortName);
			}
		}

		roomName = buildingShortName + "_" + roomNumber;
		// console.log("room name = " + roomName);

		let newRoom = this.createRoom(buildingFullName,
			buildingShortName,
			roomNumber,
			roomName,
			buildingAddress,
			lat,
			lon,
			roomCapacity,
			roomType,
			roomFurniture,
			roomLink);
		dataset.setValidity(true);
		dataset.addValidRoom(newRoom);
	}

// ================================================ buildings ======================================================

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

export interface BuildingInfo {
	buildingName: string;
	buildingCode: string;
	address: string;
	link: string;
}

// export interface BuildingInfo {
// 	name: string;
// 	address: string;
// }
