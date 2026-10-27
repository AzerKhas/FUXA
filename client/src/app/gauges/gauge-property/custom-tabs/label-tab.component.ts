import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GaugeProperty, GaugeShapeLabel } from '../../../_models/hmi';
import { Utils } from '../../../_helpers/utils';
import { LibImagesComponent } from '../../../resources/lib-images/lib-images.component';

/**
 * custom-SCADA: page "Label" of the object dialog
 * (text, font, color, position, image)
 */
@Component({
    selector: 'gauge-label-tab',
    templateUrl: './label-tab.component.html',
    styleUrls: ['./custom-tabs.css']
})
export class GaugeLabelTabComponent {

    @Input() property: GaugeProperty;

    defaultColor = Utils.defaultColor;
    fontFamilies = ['Arial', 'Agency FB', 'Calibri', 'Courier New', 'Georgia', 'Roboto', 'Tahoma', 'Times New Roman', 'Verdana'];
    fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
    wordSpacings = [0, 1, 2, 3, 4, 5, 8, 10];
    positions = ['left', 'center', 'right'];

    constructor(private dialog: MatDialog,
                private cdr: ChangeDetectorRef) {
    }

    get label(): GaugeShapeLabel {
        return this.property.style.label;
    }

    /** removes the label image ("None" button) */
    clearImage() {
        this.label.image = '';
    }

    /** chooses an image from the FUXA images library ("Gallery" button) */
    onGallery() {
        const dialogRef = this.dialog.open(LibImagesComponent, {
            disableClose: true,
            position: { top: '60px' }
        });
        dialogRef.afterClosed().subscribe((imgPath: string) => {
            if (imgPath) {
                this.label.image = imgPath;
                this.cdr.markForCheck();
            }
        });
    }

    /** loads an image from a local file ("File" button) as data URL, so it is saved with the project */
    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            this.label.image = <string>reader.result;
            this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
    }
}
