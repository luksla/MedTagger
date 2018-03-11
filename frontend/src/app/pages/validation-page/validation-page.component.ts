import {Component, OnInit, ViewChild} from '@angular/core';
import {LabelService} from '../../services/label.service';
import {Label} from '../../model/Label';
import {ScanService} from '../../services/scan.service';
import {MarkerSlice} from '../../model/MarkerSlice';
import {ScanMetadata} from "../../model/ScanMetadata";
import {ScanViewerComponent} from '../../components/scan-viewer/scan-viewer.component';
import {RectROISelector} from '../../components/selectors/RectROISelector';
import {ROISelection2D} from '../../model/ROISelection2D';
import {DialogService} from "../../services/dialog.service";
import {Location} from "@angular/common";


@Component({
    selector: 'app-validation-page',
    templateUrl: './validation-page.component.html',
    providers: [LabelService, ScanService],
    styleUrls: ['./validation-page.component.scss']
})
export class ValidationPageComponent implements OnInit {

    private static readonly SLICE_BATCH_SIZE = 25;
    @ViewChild(ScanViewerComponent) scanViewer: ScanViewerComponent;

    scan: ScanMetadata;
    agreement_ratio: number = 100;
    labels_used: number = 0;
    labels_total: number = 0;
    labels_similarities = [];

    constructor(private labelService: LabelService, private scanService: ScanService,
                private dialogService: DialogService, private location: Location) {
    }

    ngOnInit() {
        console.log('ValidationPage init', this.scanViewer);

        this.scanViewer.setSelector(new RectROISelector(this.scanViewer.getCanvas()));

        this.scanService.getScanForScanId('c23213a5-3c3d-4801-b713-4ca7720524dc').then((scan: ScanMetadata) => {
            this.scan = scan;
            this.requestValidationData();
        });

        this.scanService.validationMaskObservable().subscribe((slice: MarkerSlice) => {
            this.scanViewer.feedData(slice);
        });

        this.scanViewer.hookUpSliceObserver(ValidationPageComponent.SLICE_BATCH_SIZE).then((isObserverHooked: boolean) => {
            if (isObserverHooked) {
                this.scanViewer.observableSliceRequest.subscribe((sliceRequest: number) => {
                    console.log('ValidationPage | observable sliceRequest: ', sliceRequest);
                    let count = ValidationPageComponent.SLICE_BATCH_SIZE;
                    if (sliceRequest + count > this.scan.numberOfSlices) {
                        count = this.scan.numberOfSlices - sliceRequest;
                    }
                    if (sliceRequest < 0) {
                        count = count + sliceRequest;
                        sliceRequest = 0;
                    }
                    //this.scanService.requestSlices(scan.scanId, begin, count);
                    let labels_ids = this.labels_similarities
                        .filter(function(label) {return label['used_for_generation']})
                        .map(function(label) {return label['label_id']});
                    this.scanService.requestValidationMask(this.scan.scanId, labels_ids, sliceRequest, count);
                });
            }
        });
    }

    private requestValidationData() {
        let labels_ids_for_generation = this.labels_similarities
            .filter(function(label) {return label['used_for_generation']})
            .map(function(label) {return label['label_id']});
        this.labelService.getValidationResultsForScan(this.scan.scanId, labels_ids_for_generation).then((response) => {
            this.scanViewer.clearData();

            this.agreement_ratio = response['agreement_ratio'];
            this.labels_similarities = response['labels_similarities'];
            this.labels_used = this.labels_similarities.filter(function(label) {return label['used_for_generation']}).length;
            this.labels_total = this.labels_similarities.length;

            let begin = Math.floor(Math.random() * (response['label_end'] - response['label_start'])) + response['label_start'];
            let count = ValidationPageComponent.SLICE_BATCH_SIZE;
            let labels_ids = this.labels_similarities
                .filter(function(label) {return label['used_for_generation']})
                .map(function(label) {return label['label_id']});
            //this.scanService.requestSlices(this.scan.scanId, begin, count);
            this.scanService.requestValidationMask(this.scan.scanId, labels_ids, begin, count);
        });
    }

    private rect2DROIConverter(selections: any): Array<ROISelection2D> {
        const roiSelections: Array<ROISelection2D> = [];
        selections.forEach((selection: any) => {
            roiSelections.push(new ROISelection2D(selection.x, selection.y, selection.slice_index, selection.width, selection.height));
        });
        return roiSelections;
    }

    public isAtLeastOneLabelSelected() {
        return this.labels_similarities.filter(function(label) {return label['used_for_generation']}).length != 0;
    }

    public markAsValid(): void {
    /*
        this.labelService.changeStatus(this.label.labelId, 'VALID').then(() => {
            this.skipScan();
        });
    */
    }

    public markAsInvalid(): void {
    /*
        this.labelService.changeStatus(this.label.labelId, 'INVALID').then(() => {
            this.skipScan();
        });
    */
    }

    public clearScan(): void {
            }
}
