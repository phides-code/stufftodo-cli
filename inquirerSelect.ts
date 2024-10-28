/*
This file includes code from https://github.com/SBoudrias/Inquirer.js
Modifications have been made to the original source.
Original License:

MIT License

Copyright (c) 2023 Simon Boudrias

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

import {
    createPrompt,
    useState,
    useKeypress,
    usePrefix,
    usePagination,
    useRef,
    useMemo,
    useEffect,
    isBackspaceKey,
    isEnterKey,
    isUpKey,
    isDownKey,
    isNumberKey,
    Separator,
    ValidationError,
    makeTheme,
    type Theme,
    type Status,
} from '@inquirer/core';
import type { PartialDeep } from '@inquirer/type';
import colors from 'yoctocolors-cjs';
import figures from '@inquirer/figures';
import ansiEscapes from 'ansi-escapes';
import { getErrorState, getWeHaveAtLeastOneTask, setActionLetter } from '.';

type SelectTheme = {
    icon: { cursor: string };
    style: {
        disabled: (text: string) => string;
        description: (text: string) => string;
    };
    helpMode: 'always' | 'never' | 'auto';
};

const selectTheme: SelectTheme = {
    icon: { cursor: figures.pointer },
    style: {
        disabled: (text: string) => colors.dim(`- ${text}`),
        description: (text: string) => colors.cyan(text),
    },
    helpMode: 'auto',
};

type Choice<Value> = {
    value: Value;
    name?: string;
    description?: string;
    short?: string;
    disabled?: boolean | string;
    type?: never;
};

type NormalizedChoice<Value> = {
    value: Value;
    name: string;
    description?: string;
    short: string;
    disabled: boolean | string;
};

type SelectConfig<
    Value,
    ChoicesObject =
        | ReadonlyArray<string | Separator>
        | ReadonlyArray<Choice<Value> | Separator>
> = {
    message: string;
    choices: ChoicesObject extends ReadonlyArray<string | Separator>
        ? ChoicesObject
        : ReadonlyArray<Choice<Value> | Separator>;
    pageSize?: number;
    loop?: boolean;
    default?: unknown;
    theme?: PartialDeep<Theme<SelectTheme>>;
};

function isSelectable<Value>(
    item: NormalizedChoice<Value> | Separator
): item is NormalizedChoice<Value> {
    return !Separator.isSeparator(item);
}

function normalizeChoices<Value>(
    choices:
        | ReadonlyArray<string | Separator>
        | ReadonlyArray<Choice<Value> | Separator>
): Array<NormalizedChoice<Value> | Separator> {
    return choices.map((choice) => {
        if (Separator.isSeparator(choice)) return choice;

        if (typeof choice === 'string') {
            return {
                value: choice as Value,
                name: choice,
                short: choice,
                disabled: false,
            };
        }

        const name = choice.name ?? String(choice.value);
        return {
            value: choice.value,
            name,
            description: choice.description,
            short: choice.short ?? name,
            disabled: choice.disabled ?? false,
        };
    });
}

export default createPrompt(
    <Value>(config: SelectConfig<Value>, done: (value: Value) => void) => {
        const { loop = true, pageSize = 7 } = config;
        const firstRender = useRef(true);
        const theme = makeTheme<SelectTheme>(selectTheme, config.theme);
        const [status, setStatus] = useState<Status>('idle');
        const prefix = usePrefix({ status, theme });
        const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

        const items = useMemo(
            () => normalizeChoices(config.choices),
            [config.choices]
        );

        const bounds = useMemo(() => {
            const first = items.findIndex(isSelectable);
            const last = items.findLastIndex(isSelectable);

            if (first === -1) {
                throw new ValidationError(
                    '[select prompt] No selectable choices. All choices are disabled.'
                );
            }

            return { first, last };
        }, [items]);

        const defaultItemIndex = useMemo(() => {
            if (!('default' in config)) return -1;
            return items.findIndex(
                (item) => isSelectable(item) && item.value === config.default
            );
        }, [config.default, items]);

        const [active, setActive] = useState(
            defaultItemIndex === -1 ? bounds.first : defaultItemIndex
        );

        // Safe to assume the cursor position always point to a Choice.
        const selectedChoice = items[active] as NormalizedChoice<Value>;

        useKeypress((key, rl) => {
            clearTimeout(searchTimeoutRef.current);

            const keyNameUppercase = key.name.toUpperCase();

            let allowedMenuOptions = 'Q';
            if (!getErrorState()) {
                if (getWeHaveAtLeastOneTask()) {
                    allowedMenuOptions += 'D';

                    if (!selectedChoice.disabled) {
                        allowedMenuOptions += 'EM';
                    }
                }

                allowedMenuOptions += 'C';
            }

            if (isEnterKey(key)) {
                // do nothing
            } else if (
                keyNameUppercase.length === 1 &&
                keyNameUppercase.match(new RegExp(`[${allowedMenuOptions}]`))
            ) {
                setActionLetter(keyNameUppercase);
                setStatus('done');
                done(selectedChoice.value);
            } else if (isUpKey(key) || isDownKey(key)) {
                rl.clearLine(0);
                if (
                    loop ||
                    (isUpKey(key) && active !== bounds.first) ||
                    (isDownKey(key) && active !== bounds.last)
                ) {
                    const offset = isUpKey(key) ? -1 : 1;
                    let next = active;
                    do {
                        next = (next + offset + items.length) % items.length;
                    } while (!isSelectable(items[next]!));
                    setActive(next);
                }
            } else if (isNumberKey(key)) {
                rl.clearLine(0);
                const position = Number(key.name) - 1;
                const item = items[position];
                if (item != null && isSelectable(item)) {
                    setActive(position);
                }
            } else if (isBackspaceKey(key)) {
                rl.clearLine(0);
            }
        });

        useEffect(
            () => () => {
                clearTimeout(searchTimeoutRef.current);
            },
            []
        );

        const message = theme.style.message(config.message, status);

        let helpTipTop = '';
        let helpTipBottom = '';
        if (
            theme.helpMode === 'always' ||
            (theme.helpMode === 'auto' && firstRender.current)
        ) {
            firstRender.current = false;

            if (items.length > pageSize) {
                helpTipBottom = `\n${theme.style.help(
                    '(Use arrow keys to reveal more choices)'
                )}`;
            } else {
                helpTipTop = theme.style.help('(Use arrow keys)');
            }
        }

        const page = usePagination({
            items,
            active,
            renderItem({ item, isActive }) {
                if (Separator.isSeparator(item)) {
                    return ` ${item.separator}`;
                }

                const color = isActive
                    ? theme.style.highlight
                    : (x: string) => x;
                const cursor = isActive ? theme.icon.cursor : ` `;
                return color(
                    `${cursor} ${item.name} ${
                        item.disabled ? '(completed)' : ''
                    }`
                );
            },
            pageSize,
            loop,
        });

        if (status === 'done') {
            return `${prefix} ${message} ${theme.style.answer(
                selectedChoice.short
            )}`;
        }

        const choiceDescription = selectedChoice.description
            ? `\n${theme.style.description(selectedChoice.description)}`
            : ``;

        return `${[prefix, message, helpTipTop]
            .filter(Boolean)
            .join(' ')}\n${page}${helpTipBottom}${choiceDescription}${
            ansiEscapes.cursorHide
        }`;
    }
);

export { Separator } from '@inquirer/core';