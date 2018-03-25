export interface SliceSelection {
    sliceIndex: number;

    // TODO: dev option for now, remove later
    getSelectionObject: Object;

    scaleToView(scalar: number): void;
}
