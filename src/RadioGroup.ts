import { ITextStyle, TextStyle, Texture } from 'pixi.js';
import { Container, Graphics, Sprite } from 'pixi.js';
import { Signal } from 'typed-signals';
import { CheckBox } from './CheckBox';
import { Layout, LayoutType } from './Layout';

export type GraphicsType = {
    color: number;
    fillColor?: number;
    width?: number;
    height?: number;
    radius?: number;
    padding?: number;
};

export type CheckBoxStyle = {
    bg: string | GraphicsType;
    checked: string | GraphicsType;
    textStyle?: TextStyle | Partial<ITextStyle>;
};

export type CheckBoxOptions = {
    items: string[];
    type: LayoutType;
    elementsMargin: number;
    style: CheckBoxStyle;
    selectedItem?: number;
};

/**
 * Creates a container based group of checkbox elements that can be used as radio buttons
 * @example
 * ```
 * new RadioGroup({
 *     selectedItem: 0,
 *     items: ['Option 1', 'Option 2', 'Option 3'],
 *     type: 'vertical',
 *     elementsMargin: 10,
 *     style: {
 *         bg: 'radio.png',
 *         checked: 'radio_checked.png',
 *         textStyle: {
 *             fontSize: 22,
 *             fill: 0xFFFFFF,
 *         }
 *     },
 * });
 *
 * ```
 */
export class RadioGroup extends Container {
    private items: CheckBox[] = [];

    private value: string;
    private selected: number;

    public onChange: Signal<
        (selectedItemID: number, selectedVal: string) => void
    >;

    public view: Layout;

    constructor(private readonly options: CheckBoxOptions) {
        super();

        this.value = options.items[options.selectedItem];

        this.selected = options.selectedItem;

        this.view = new Layout({
            type: options.type,
            elementsMargin: options.elementsMargin,
        });

        options.items.forEach((item, id) => {
            const unchecked =
                typeof options.style.bg === 'string'
                    ? new Sprite(Texture.from(options.style.bg))
                    : this.getGraphics(options.style.bg as GraphicsType);

            const checked =
                typeof options.style.checked === 'string'
                    ? new Sprite(Texture.from(options.style.checked))
                    : this.getGraphics(options.style.checked as GraphicsType);

            const checkBox = new CheckBox({
                checked: options.selectedItem === id,
                style: {
                    unchecked,
                    checked,
                    text: {
                        text: item,
                        style: options.style.textStyle,
                    },
                },
            });

            this.view.addChild(checkBox);

            checkBox.onChange.connect(() => this.selectItem(id));

            this.items.push(checkBox);

            this.view.addChild(checkBox);
        });

        this.onChange = new Signal();
    }

    private getGraphics({
        color,
        fillColor,
        width,
        height,
        radius,
        padding,
    }: GraphicsType) {
        const graphics = new Graphics().beginFill(color);

        const isCircle = width === height && radius >= width / 2;

        isCircle
            ? graphics.drawCircle(width / 2, width / 2, width / 2)
            : graphics.drawRoundedRect(0, 0, width, height, radius);

        if (fillColor) {
            graphics.beginFill(fillColor);

            const center = width / 2;

            isCircle
                ? graphics.drawCircle(center, center, center - padding)
                : graphics.drawRoundedRect(
                      padding,
                      padding,
                      width - padding * 2,
                      height - padding * 2,
                      radius,
                  );
        }

        return graphics;
    }

    public selectItem(id: number) {
        this.selected = id;

        this.items.map((item) => (item.checked = false));

        this.items[id].checked = true;

        this.value = this.options.items[this.selected];
        this.onChange.emit(this.selected, this.value);
    }
}
