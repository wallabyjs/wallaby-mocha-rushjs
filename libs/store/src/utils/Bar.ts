import {Foo} from "@libs/domain/utils/Foo"

export function Bar() {
	return `${Foo()} from Bar`;
}