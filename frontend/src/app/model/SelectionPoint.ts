export class SelectionPoint {
	_positionX: number;
	_positionY: number;

	constructor(coordinateX: number, coordinateY: number) {
		this._positionX = coordinateX;
		this._positionY = coordinateY;
	}

	public get positionX() {
		return this._positionX;
	}

	public get positionY() {
		return this._positionY;
	}
}