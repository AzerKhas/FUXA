import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GaugeProperty, GaugeShapeVisibility, IPropertyVariable } from '../../../_models/hmi';
import { PermissionData, PermissionDialogComponent } from '../permission-dialog/permission-dialog.component';

/**
 * custom-SCADA: page "Visibility" of the object dialog
 * (shown/hidden by a bit tag, by a word tag condition, by the user level; control penetration)
 */
@Component({
    selector: 'gauge-visibility-tab',
    templateUrl: './visibility-tab.component.html',
    styleUrls: ['./custom-tabs.css']
})
export class GaugeVisibilityTabComponent {

    @Input() data: any;
    @Input() property: GaugeProperty;

    conditions = ['eq', 'ne', 'gt', 'ge', 'lt', 'le'];

    constructor(private dialog: MatDialog,
                private cdr: ChangeDetectorRef) {
    }

    get visibility(): GaugeShapeVisibility {
        return this.property.style.visibility;
    }

    /** the user level uses the FUXA authorization of the object (same as the lock of the page Property) */
    get byUserLevel(): boolean {
        return !!(this.property.permission || this.property.permissionRoles?.show?.length || this.property.permissionRoles?.enabled?.length);
    }

    onBitTagChange(event: IPropertyVariable) {
        this.visibility.bitVariableId = event.variableId;
    }

    onWordTagChange(event: IPropertyVariable) {
        this.visibility.wordVariableId = event.variableId;
    }

    onUserLevelToggle(checked: boolean) {
        if (checked) {
            this.onEditUserLevel();
        } else {
            this.property.permission = null;
            this.property.permissionRoles = null;
        }
    }

    onEditUserLevel() {
        const dialogRef = this.dialog.open(PermissionDialogComponent, {
            position: { top: '60px' },
            data: <PermissionData>{ permission: this.property.permission, permissionRoles: this.property.permissionRoles }
        });
        dialogRef.afterClosed().subscribe((result: PermissionData) => {
            if (result) {
                this.property.permission = result.permission;
                this.property.permissionRoles = result.permissionRoles;
            }
            this.cdr.markForCheck();
        });
    }
}
