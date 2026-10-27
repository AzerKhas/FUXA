import { GaugeSettings, GaugeShapeGeneral, GaugeShapeLabel, GaugeShapeStyle } from '../../../_models/hmi';
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
