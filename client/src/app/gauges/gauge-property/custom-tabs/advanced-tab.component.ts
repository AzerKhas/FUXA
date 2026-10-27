import { Component, Input } from '@angular/core';
import { GaugeProperty, GaugeShapeAdvanced } from '../../../_models/hmi';
import { Utils } from '../../../_helpers/utils';

/**
 * custom-SCADA: page "Advanced" of the object dialog
 * (zoom = linear conversion of the value, display range, ratio display)
 */
@Component({
    selector: 'gauge-advanced-tab',
    templateUrl: './advanced-tab.component.html',
    styleUrls: ['./custom-tabs.css']
})
export class GaugeAdvancedTabComponent {

    @Input() property: GaugeProperty;

    defaultColor = Utils.defaultColor;

    get advanced(): GaugeShapeAdvanced {
        return this.property.style.advanced;
    }
}
