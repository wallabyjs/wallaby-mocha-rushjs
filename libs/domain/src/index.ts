import {Foo} from "@libs/domain/utils/Foo";

export default function() {
    return `${Foo()} - from libs/domain/index`;
}