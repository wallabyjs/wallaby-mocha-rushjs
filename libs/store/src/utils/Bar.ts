import {Foo} from "@libs/domain/utils/Foo"

export function Bar(): string {
	return `${Foo()} from Bar`;
}