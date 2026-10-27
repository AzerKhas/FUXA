import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GaugeProperty, GaugeShapeGeneral, IPropertyVariable } from '../../../_models/hmi';
import { Utils } from '../../../_helpers/utils';

/**
 * custom-SCADA: page "General" of the object dialog
 * (colors, pattern, data type, tag (monitor address), digits)
 */
@Component({
    selector: 'gauge-general-tab',
    templateUrl: './general-tab.component.html',
    styleUrls: ['./custom-tabs.css']
})
export class GaugeGeneralTabComponent {

    @Input() data: any;
    @Input() property: GaugeProperty;
    /** emitted when the tag is changed, the dialog forwards it to the Property page */
    @Output() tagChange = new EventEmitter<IPropertyVariable>();

    defaultColor = Utils.defaultColor;
    dataTypes = ['int16', 'uint16', 'int32', 'uint32', 'float32', 'float64', 'bool', 'string'];
    patterns = ['solid', 'none'];

    get general(): GaugeShapeGeneral {
        return this.property.style.general;
    }

    get previewText(): string {
        return this.property.style.label.text;
    }

    onTagChange(event: IPropertyVariable) {
        this.tagChange.emit(event);
    }
}
