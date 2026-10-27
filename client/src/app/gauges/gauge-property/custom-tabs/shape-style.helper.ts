import { GaugeSettings, GaugeShapeAdvanced, GaugeShapeCondition, GaugeShapeGeneral, GaugeShapeLabel, GaugeShapeStyle, GaugeStatus } from '../../../_models/hmi';
import { Utils } from '../../../_helpers/utils';

/**
 * custom-SCADA: applies the style of the pages "General" and "Label" to the SVG element of an object.
 * The attributes are written in the SVG of the view, so they are saved with the project and shown in the viewer.
 */
export class ShapeStyleHelper {

    static readonly valueTypeTag = 'svg-ext-value';
    private static readonly svgNs = 'http://www.w3.org/2000/svg';

    /** true if the style was never changed by the user (only the default values) */
    static isDefault(style: GaugeShapeStyle): boolean {
        return JSON.stringify(style) === JSON.stringify(new GaugeShapeStyle());
    }

    /**
     * apply the style to the SVG element of the object
     * - text objects (text, Value): font, font color, position, text (Value only)
     * - other shapes: border color, background and pattern
     * @returns true if the element was changed
     */
    static applyToElement(settings: GaugeSettings): boolean {
        const style: GaugeShapeStyle = settings?.property?.style;
        const element = settings?.id ? document.getElementById(settings.id) : null;
        if (!style || !element) {
            return false;
        }
        const isValue = settings.type === ShapeStyleHelper.valueTypeTag;
        const texts: Element[] = element.tagName.toLowerCase() === 'text' ? [element] : isValue ? Array.from(element.querySelectorAll('text')) : [];
        if (texts.length) {
            if (isValue) {
                ShapeStyleHelper.setTextAttributes(element, style.label);
            }
            texts.forEach(text => {
                ShapeStyleHelper.setTextAttributes(text, style.label);
                if (isValue) {
                    text.textContent = style.label.text;
                }
            });
        } else {
            ShapeStyleHelper.setShapeAttributes(element, style.general);
        }
        return true;
    }

    /**
     * format a numeric value with the digits of the page "General" (used by the Value object in the viewer)
     * @returns the formatted value, or null if the value is not a number or the data type is not numeric
     */
    static formatValue(value: any, general: GaugeShapeGeneral): string | null {
        if (!general || general.dataType === 'string' || general.dataType === 'bool') {
            return null;
        }
        const num = Utils.toFiniteNumber(value);
        if (num === null) {
            return null;
        }
        const isInteger = general.dataType.indexOf('int') >= 0;
        const fractional = isInteger ? 0 : Math.max(0, Number(general.fractionalDigits) || 0);
        let result = Math.abs(isInteger ? Math.trunc(num) : num).toFixed(fractional);
        if (general.zeroPadding) {
            const integerDigits = Math.max(1, (Number(general.totalDigits) || 1) - fractional);
            const parts = result.split('.');
            parts[0] = parts[0].padStart(integerDigits, '0');
            result = parts.join('.');
        }
        return (num < 0 ? '-' : '') + result;
    }

    /**
     * format the value of a Value object with the pages General and Advanced (zoom, display range color, ratio)
     * @param textElement SVG text of the value, its color is changed when the value is out of the display range
     * @returns the formatted value, or null to keep the FUXA formatting
     */
    static formatStyledValue(value: any, style: GaugeShapeStyle, textElement?: Element): string | null {
        let num = Utils.toFiniteNumber(value);
        if (num === null || !style?.general || style.general.dataType === 'string' || style.general.dataType === 'bool') {
            return null;
        }
        const advanced = style.advanced;
        if (advanced?.zoom) {
            num = ShapeStyleHelper.scale(num, advanced.zoomSourceMin, advanced.zoomSourceMax, advanced.zoomDisplayMin, advanced.zoomDisplayMax);
        }
        if (textElement) {
            ShapeStyleHelper.setRangeColor(textElement, num, advanced);
        }
        if (advanced?.ratioDisplay) {
            const min = Number(advanced.rangeMin), max = Number(advanced.rangeMax);
            if (max !== min) {
                const ratio = (num - min) / (max - min) * 100;
                return ratio.toFixed(Math.max(0, Number(style.general.fractionalDigits) || 0)) + ' %';
            }
        }
        return ShapeStyleHelper.formatValue(num, style.general);
    }

    /** tags used by the page Visibility, to add to the signals of the object */
    static addVisibilitySignals(signals: string[] | null, property: any): string[] | null {
        const visibility = property?.style?.visibility;
        const ids = [];
        if (visibility?.byBit && visibility.bitVariableId) {
            ids.push(visibility.bitVariableId);
        }
        if (visibility?.byWord && visibility.wordVariableId) {
            ids.push(visibility.wordVariableId);
        }
        if (!ids.length) {
            return signals;
        }
        return [...(signals || []), ...ids.filter(id => !signals?.includes(id))];
    }

    /**
     * show or hide the object in the viewer with the page Visibility (bit and word conditions)
     * an unknown tag value does not hide the object
     */
    static processVisibility(ga: GaugeSettings, svgele: any, gaugeStatus: GaugeStatus) {
        const visibility = ga?.property?.style?.visibility;
        const node: HTMLElement | SVGElement = svgele?.node ?? svgele;
        if (!visibility || (!visibility.byBit && !visibility.byWord) || !node?.style) {
            return;
        }
        const values = gaugeStatus?.variablesValue || {};
        let visible = true;
        if (visibility.byBit && !Utils.isNullOrUndefined(values[visibility.bitVariableId])) {
            const bitValue = values[visibility.bitVariableId];
            const isOn = bitValue === true || bitValue === 'true' || (Utils.toFiniteNumber(bitValue) ?? 0) !== 0;
            visible = visible && (visibility.bitShowWhen === 'off' ? !isOn : isOn);
        }
        if (visibility.byWord && !Utils.isNullOrUndefined(values[visibility.wordVariableId])) {
            const wordValue = Utils.toFiniteNumber(values[visibility.wordVariableId]);
            if (wordValue !== null) {
                visible = visible && ShapeStyleHelper.compare(wordValue, visibility.wordCondition, Number(visibility.wordValue));
            }
        }
        // '' keeps the visibility attribute set by the server for the user permission
        node.style.visibility = visible ? '' : 'hidden';
    }

    /** prepare the object in the viewer: "Control penetration" lets the clicks pass through the object */
    static initInView(ga: GaugeSettings) {
        if (ga?.property?.style?.visibility?.penetration) {
            const element = document.getElementById(ga.id);
            if (element) {
                element.style.pointerEvents = 'none';
            }
        }
    }

    private static scale(value: number, srcMin: number, srcMax: number, dstMin: number, dstMax: number): number {
        srcMin = Number(srcMin); srcMax = Number(srcMax); dstMin = Number(dstMin); dstMax = Number(dstMax);
        if (srcMax === srcMin) {
            return value;
        }
        return dstMin + (value - srcMin) * (dstMax - dstMin) / (srcMax - srcMin);
    }

    private static compare(value: number, condition: GaugeShapeCondition, reference: number): boolean {
        switch (condition) {
            case 'ne': return value !== reference;
            case 'gt': return value > reference;
            case 'ge': return value >= reference;
            case 'lt': return value < reference;
            case 'le': return value <= reference;
            default: return value === reference;
        }
    }

    /** color of the text when the value is out of the display range, the original color is kept in data-fill */
    private static setRangeColor(textElement: Element, value: number, advanced: GaugeShapeAdvanced) {
        if (!textElement.hasAttribute('data-fill')) {
            textElement.setAttribute('data-fill', textElement.getAttribute('fill') || '');
        }
        let color = textElement.getAttribute('data-fill');
        if (advanced?.displayRange) {
            if (value < Number(advanced.rangeMin)) {
                color = advanced.belowColor;
            } else if (value > Number(advanced.rangeMax)) {
                color = advanced.aboveColor;
            }
        }
        if (color) {
            textElement.setAttribute('fill', color);
        } else {
            textElement.removeAttribute('fill');
        }
    }

    private static setTextAttributes(element: Element, label: GaugeShapeLabel) {
        element.setAttribute('fill', label.color);
        element.setAttribute('font-family', label.fontFamily);
        element.setAttribute('font-size', String(label.fontSize));
        element.setAttribute('font-weight', label.bold ? 'bold' : 'normal');
        element.setAttribute('font-style', label.italic ? 'italic' : 'normal');
        element.setAttribute('text-decoration', label.underline ? 'underline' : 'none');
        element.setAttribute('word-spacing', String(label.wordSpacing));
        element.setAttribute('text-anchor', label.position === 'left' ? 'start' : label.position === 'right' ? 'end' : 'middle');
    }

    private static setShapeAttributes(element: Element, general: GaugeShapeGeneral) {
        element.setAttribute('stroke', general.borderColor);
        if (general.pattern === 'solid') {
            element.setAttribute('fill', general.background);
        } else if (general.pattern === 'hatch') {
            element.setAttribute('fill', `url(#${ShapeStyleHelper.setHatchPattern(element, general)})`);
        } else {
            element.setAttribute('fill', 'none');
        }
    }

    /** create (or update) the SVG hatch pattern of the element, returns its id */
    private static setHatchPattern(element: Element, general: GaugeShapeGeneral): string {
        const id = `hatch_${element.id}`;
        const svg = (element as SVGElement).ownerSVGElement;
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS(ShapeStyleHelper.svgNs, 'defs');
            svg.insertBefore(defs, svg.firstChild);
        }
        svg.querySelector(`#${id}`)?.remove();
        const pattern = document.createElementNS(ShapeStyleHelper.svgNs, 'pattern');
        pattern.setAttribute('id', id);
        pattern.setAttribute('width', '8');
        pattern.setAttribute('height', '8');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('patternTransform', 'rotate(45)');
        const background = document.createElementNS(ShapeStyleHelper.svgNs, 'rect');
        background.setAttribute('width', '8');
        background.setAttribute('height', '8');
        background.setAttribute('fill', general.background);
        const line = document.createElementNS(ShapeStyleHelper.svgNs, 'rect');
        line.setAttribute('width', '2');
        line.setAttribute('height', '8');
        line.setAttribute('fill', general.foreground);
        pattern.appendChild(background);
        pattern.appendChild(line);
        defs.appendChild(pattern);
        return id;
    }
}
