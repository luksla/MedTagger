import {EventEmitter} from "@angular/core";
import {SelectionPoint} from "../../model/SelectionPoint";

export interface Selector<SliceSelection> {

	drawPreviousSelections(): any;

	drawSelection(selection: SliceSelection, color: string): any;

	onMouseDown(eventPoint: SelectionPoint): any;

	onMouseMove(eventPoint: SelectionPoint): any;

	onMouseUp(eventPoint: SelectionPoint): any;

	clearCanvasSelection(): any;

	clearData(): any;

	getStateChangeEmitter(): EventEmitter<void>;

	getCurrentSelection(): SliceSelection;

	addCurrentSelection(): any;

	updateCurrentSlice(currentSliceId: number): any;

	updateCanvasPosition(canvasRect: ClientRect): any;

	hasArchivedSelections(): boolean;

	hasSliceSelection(): boolean;

	hasValidSelection(...validityFlags: boolean[]): boolean;

	getSelections(): SliceSelection[];

	formArchivedSelections(selectionMap: Array<SliceSelection>): Array<SliceSelection>;

	archiveSelections(selectionMap?: Array<SliceSelection>): any;

	removeCurrentSelection(): any;

	clearSelections(): any;

	getTranslationMatrix(): Array<number>;

	updateTranslationMatrix(weights: Array<number>): any;
}
