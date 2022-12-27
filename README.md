# swiper

Fuzzy search lines in current window.

Supports regex, negate, match highting, case sensitive search.

a copy of emacs swiper: the thing I missed most in vscode.

Search `"swiper !not Test"` matches a line with `SWiPeR Test` without mentions of `not` string.

![DEMO](./img/swiper-silver.gif)

## Installation

Install this extension.

## Commands

`swiper.swiper-word-at-cursor` search the current word at cursor.

`swiper.swiper` search the last value tried.

## Quick tutorial

Invoke command `Swiper: Swiper Search/Resume` and start typing.

basic rules:

1. Search either literal string e.g. `abc` or javascript regex `/.../`.
2. Search strings separated by space are AND-ed together. e.g. "a b" matched lines with "a" and "b" on the same line.
3. Search string prefixed with `!` negates the search, "a !b" matches lines with "a" but not "b". Use regex `/\!/` if you want to match `"!"` literal string.
   Search string starts with `!` does not contribute to the border highlights.
4. Default case insensitive search. Upcased search term matches case sensitively.

Some quick Example:

```sh
# search wildcard
/command.*swiper/

a b matches lines with a and b
a !b # matches lines with a but not b

/lint|display/ # lint OR display
lint|display # searches the literal string "lint|display"

# line starts with test
/^test/

a B # matches "aB", "AB"

/\(.*\)/ # matches paren
!/\(.*\)/ # do not match paren
```

## Motivation

I come from emacs to VScode, vscode is awesome, but misses a few features i do daily in emacs. This is one of them.

More on my motivation: [medium link](https://medium.com/@wenhoujx/vscode-productivity-quick-narrow-down-to-the-searched-line-1f8052acac0b?source=friends_link&sk=995200d35ae6570c186c3322be2816c7)

I wrote a [blog](https://medium.com/@wenhoujx/boot-productivity-with-vscode-tasks-c98fa0f8b567?source=friends_link&sk=1b435e151d2982a2e1c53ff5dcdba5b1) that covers achieving some my other emacs workflows in VScode.

## TODO

- [x] somehow test on non-macOS?
- [x] search all file in the workspace.
    >  Use VScode search feature.
- [x] if upper case char typed, turn to case sensitive search for that subSearchString.
    > Done
- [x] do not save tmp file for unsaved buffer.

## misc

[publish URL](https://marketplace.visualstudio.com/manage/publishers/wenhoujx)
