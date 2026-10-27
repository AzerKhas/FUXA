import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GaugeProperty, GaugeShapeGeneral, GaugeShapeLabel, IPropertyVariable } from '../../../_models/hmi';
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
    patterns = ['solid', 'hatch', 'none'];

    get general(): GaugeShapeGeneral {
        return this.property.style.general;
    }

    get label(): GaugeShapeLabel {
        return this.property.style.label;
    }

    /** preview of the pattern: solid background, hatch (foreground lines on background) or none */
    get previewBackground(): string {
        if (this.general.pattern === 'solid') {
            return this.general.background;
        } else if (this.general.pattern === 'hatch') {
            return `repeating-linear-gradient(45deg, ${this.general.foreground} 0 2px, ${this.general.background} 2px 8px)`;
        }
        return 'transparent';
    }

    get previewJustify(): string {
        return this.label.position === 'left' ? 'flex-start' : this.label.position === 'right' ? 'flex-end' : 'center';
    }

    onTagChange(event: IPropertyVariable) {
        this.tagChange.emit(event);
    }
}
