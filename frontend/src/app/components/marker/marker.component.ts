import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MarkerSlice} from '../../model/MarkerSlice';
import {MatSlider} from '@angular/material/slider';
import {Subject} from 'rxjs/Subject';
import {ScanViewerComponent} from '../scan-viewer/scan-viewer.component';
import {SliceSelection} from '../../model/SliceSelection';
import {MatSlideToggleChange, MatSlideToggle} from "@angular/material";
import {SelectionPoint} from "../../model/SelectionPoint";

enum MarkerMode {
	SELECTING,
	ZOOMING
}

@Component({
	selector: 'app-marker-component',
	templateUrl: './marker.component.html',
	styleUrls: ['./marker.component.scss']
})
export class MarkerComponent extends ScanViewerComponent implements OnInit {

	MarkerMode = MarkerMode;
	currentMarkerMode: MarkerMode;

	currentImage: HTMLImageElement;
	downloadingScanInProgress = false;
	downloadingSlicesInProgress = false;

	@ViewChild('image')
	set viewImage(viewElement: ElementRef) {
		this.currentImage = viewElement.nativeElement;
	}

	zoomCanvas: HTMLCanvasElement;

	@ViewChild('zoomCanvas')
	set viewZoomCanvas(viewElement: ElementRef) {
		this.zoomCanvas = viewElement.nativeElement;
	}

	zoomCanvasCtx: CanvasRenderingContext2D;
	zoomMouseDown: boolean = false;
	translatePosition: { x: number, y: number };
	zoomScale: number = 2;
	dragPosition: { x: number, y: number };
	zoomCavasPosition: ClientRect;
	canvas: HTMLCanvasElement;

	@ViewChild('markerCanvas')
	set viewCanvas(viewElement: ElementRef) {
		this.canvas = viewElement.nativeElement;
	}

	@ViewChild('slider') slider: MatSlider;

	@ViewChild('editModeToggle') editModeToggle: MatSlideToggle;

	public selectionState: { isValid: boolean, is2d: boolean, hasArchive: boolean } = {
		isValid: false,
		is2d: false,
		hasArchive: false
	};

	public observableSliceRequest: Subject<number>;

	constructor() {
		super();
	}

	get currentSlice() {
		return this._currentSlice;
	}

	public setDownloadScanInProgress(isInProgress: boolean) {
		this.downloadingScanInProgress = isInProgress;
	}

	public setDownloadSlicesInProgress(isInProgress: boolean) {
		this.downloadingSlicesInProgress = isInProgress;
	}

	public removeCurrentSelection(): void {
		this.selector.removeCurrentSelection();
		this.updateSelectionState();
	}

	private updateSelectionState(): void {
		this.selectionState.hasArchive = this.selector.hasArchivedSelections();
		this.selectionState.is2d = this.selector.hasSliceSelection();
		this.selectionState.isValid = this.selector.hasValidSelection();
	}

	public get3dSelection(): SliceSelection[] {
		this.selector.archiveSelections();
		this.updateSelectionState();

		this.selector.clearCanvasSelection();

		const coordinates: SliceSelection[] = this.selector.getSelections();
		this.selector.clearSelections();
		this.updateSelectionState();

		this.selector.drawPreviousSelections();

		return coordinates;
	}

	private hookUpStateChangeSubscription(): void {
		this.selector.getStateChangeEmitter().subscribe(() => {
			console.log('Marker | getStateChange event from selector!');
			this.updateSelectionState();
		});
	}

	public prepareForNewScan(): void {
		this.clearData();
		this.hookUpStateChangeSubscription();
	}

	ngOnInit() {
		console.log('Marker init');
		console.log('View elements: image ', this.currentImage, ', canvas ', this.canvas, ', slider ', this.slider);

		this.currentMarkerMode = MarkerMode.SELECTING;

		this.zoomCanvasCtx = this.zoomCanvas.getContext('2d');

		this.translatePosition = {
			x: 0,
			y: 0
		};

		this.zoomCavasPosition = this.zoomCanvas.getBoundingClientRect();

		this.initCanvasZoomingTool();

		this.dragPosition = {
			x: undefined,
			y: undefined
		};

		this.slices = new Map<number, MarkerSlice>();

		this.editModeToggle.registerOnChange((toggleChange: MatSlideToggleChange) => {
			console.log('Marker | checkEditMode | currentMode: ', this.currentMarkerMode);
			console.log('Marker | checkEditMode | toggleChange: ', toggleChange);
			console.log('Marker | initCanvasZoomingTool onmousemove | translate: ', this.translatePosition);
			this.currentMarkerMode = toggleChange ? MarkerMode.SELECTING : MarkerMode.ZOOMING;
			// marker -> zoom
			if (this.currentMarkerMode == this.MarkerMode.ZOOMING) {
				this.translatePosition = {
					x: 0,
					y: 0
				};
				this.drawZoomImage();
			} else {
				// zoom -> marker
				this.zoomToMarkerImageCopy();
			}
		});

		this.selector.clearData();

		this.hookUpStateChangeSubscription();

		this.initializeCanvas();

		this.setCanvasImage();

		this.slider.registerOnChange((sliderValue: number) => {
			console.log('Marker init | slider change: ', sliderValue);

			this.requestSlicesIfNeeded(sliderValue);
			this.changeMarkerImage(sliderValue);

			this.selector.clearCanvasSelection();

			this.selector.drawPreviousSelections();
			this.updateSelectionState();
		});

		this.initCanvasSelectionTool();

	}

	private initCanvasSelectionTool(): void {
		console.log('Marker | initCanvasSelectionTool');

		this.canvas.onmousedown = (mouseEvent: MouseEvent) => {
			console.log('Marker | initCanvasSelectionTool | onmousedown clientXY: ', mouseEvent.clientX, mouseEvent.clientY);
			this.selector.onMouseDown(new SelectionPoint(mouseEvent.clientX, mouseEvent.clientY));
		};

		this.canvas.onmouseup = (mouseEvent: MouseEvent) => {
			this.selector.onMouseUp(new SelectionPoint(mouseEvent.clientX, mouseEvent.clientY));
		};

		this.canvas.onmousemove = (mouseEvent: MouseEvent) => {
			this.selector.onMouseMove(new SelectionPoint(mouseEvent.clientX, mouseEvent.clientY));
		};
	}

	private initCanvasZoomingTool(): void {
		console.log('Marker | initCanvasZoomingTool');

		this.zoomCanvas.width = 600;
		this.zoomCanvas.height = 600;

		this.zoomCanvas.onmousedown = (mouseEvent: MouseEvent) => {
			console.log('Marker | initCanvasZoomingTool onmousedown | event: ', mouseEvent);
			this.zoomMouseDown = true;
			this.dragPosition.x = mouseEvent.clientX - this.translatePosition.x;
			this.dragPosition.y = mouseEvent.clientY - this.translatePosition.y;
		};

		this.zoomCanvas.onmouseup = (mouseEvent: MouseEvent) => {
			this.zoomMouseDown = false;
			this.translatePosition = {
				x: 0,
				y: 0
			};
		};

		this.zoomCanvas.onmousemove = (mouseEvent: MouseEvent) => {
			if (this.zoomMouseDown) {
				console.log('Marker | initCanvasZoomingTool onmousemove | event: ', mouseEvent);
				this.translatePosition.x = ((mouseEvent.clientX) - this.dragPosition.x);
				this.translatePosition.y = ((mouseEvent.clientY) - this.dragPosition.y);
				console.log('Marker | initCanvasZoomingTool onmousemove | translate: ', this.translatePosition);
				this.drawZoomImage();
				this.dragPosition.x = mouseEvent.clientX;
				this.dragPosition.y = mouseEvent.clientY;
			}
		};
	}

	private drawZoomImage(): void {
		this.zoomCanvasCtx.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
		// console.log('Marker | prepareZoomCanvas | currentImage:', this.currentImage);
		// console.log('Marker | prepareZoomCanvas | zoomCanvas:', this.zoomCanvas);

		// translacja jest niewinna
		this.translate(this.translatePosition.x, this.translatePosition.y);

		this.zoomCanvasCtx.drawImage(this.currentImage,
			0, 0, this.currentImage.width, this.currentImage.height);
		//this.zoomCanvasCtx.drawImage(this.canvas, 0, 0);
	}

	private zoomToMarkerImageCopy(): void {
		//this.selector.clearCanvasSelection();

		//TODO: tak chyba nie moze być
		this.currentImage.src = this.zoomCanvas.toDataURL();
	}

	public zoomIn(): boolean {
		console.log("RectROISelector | zoomIn | scale: ", this.zoomScale);
		this.scale(this.zoomScale, this.zoomScale);
		this.drawZoomImage();
		return true;
	}

	public zoomOut(): boolean {
		let scale: number = 1 / this.zoomScale;
		console.log("RectROISelector | zoomOut | scale: ", scale);
		this.scale(scale, scale);
		this.drawZoomImage();
		return true;
	}

	//TODO: dev only, remove later
	private checkOriginalCoordinates(): void {
		let originalSelection: SliceSelection = this.selector.getCurrentSelection();
		console.log("RectROISelector | zoomOut | original selection: ", originalSelection);
	}

	private translate(x: number, y: number): void {
		let currentTranslationMatrix: Array<number> = this.selector.getTranslationMatrix();
		currentTranslationMatrix[4] += currentTranslationMatrix[0] * x + currentTranslationMatrix[2] * y;
		currentTranslationMatrix[5] += currentTranslationMatrix[1] * x + currentTranslationMatrix[3] * y;
		this.selector.updateTranslationMatrix(currentTranslationMatrix);
		this.zoomCanvasCtx.translate(x, y);
	}

	private scale(x: number, y: number): void {
		let currentTranslationMatrix: Array<number> = this.selector.getTranslationMatrix();
		currentTranslationMatrix[0] *= x;
		currentTranslationMatrix[1] *= x;
		currentTranslationMatrix[2] *= y;
		currentTranslationMatrix[3] *= y;
		this.selector.updateTranslationMatrix(currentTranslationMatrix);
		this.zoomCanvasCtx.scale(x, y);
	}



	// private hookUpZoom(): void {
	//     let svg: SVGSVGElement = new SVGSVGElement();
	//     this.transformMatrix = svg.createSVGMatrix();
	//
	//     let savedTransforms = [];
	//     let save: () => void = this.zoomCanvasCtx.save;
	//     this.zoomCanvasCtx.save = () => {
	//         savedTransforms.push(this.transformMatrix.translate(0, 0));
	//         return save.call(this.zoomCanvasCtx);
	//     };
	//
	//     let restore: () => void = this.zoomCanvasCtx.restore;
	//     this.zoomCanvasCtx.restore = () => {
	//         this.transformMatrix = savedTransforms.pop();
	//         return restore.call(this.zoomCanvasCtx);
	//     };
	// }
}
