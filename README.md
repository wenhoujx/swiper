# swiper

a copy of emacs swiper: the thing I missed most in vscode.

Search "swiper !not Test" matches a line with `SWiPeR Test` without mentions of `not` string.

Support search regex string in the current open window.

![DEMO](./img/swiper-silver.gif)

## Installation

Install this extension.

## Commands

`swiper.swiper-grep-word-at-cursor` greps the current word at cursor.

`swiper.swiper-grep` greps the last value tried.

## Quick tutorial

Invoke command `Swiper: Swiper Grep` and start typing.

basic rules:

1. Search use grep basic regex syntax.
2. Search strings separated by space are AND-ed together. e.g. "a b" matched lines with "a" and "b" on the same line.
3. Search string prefixed with `!` negates the search, "a !b" matches lines with "a" but not "b". Use `\!` if you want to match `"!"` literal string.
4. Default case insensitive search. Upcased search term matches case sensitively.

Some quick Example:

```sh
# search wildcard
command*swiper 

# lint OR display 
lint\|display

lint|display # searches the literal string "lint|display"
# line starts with test 
^test

a B # matches "aB", "AB"
```

## Behind the scene

This extension is a simple wrapper of the CLI `grep`, it relays user input to `grep` and parses its output.

The reason to use `grep` over `ag` or `rg` is to avoid additional installation and work out of box.

## Motivation

I come from emacs to VScode, vscode is awesome, but misses a few features i do daily in emacs. This is one of them.

I wrote a [blog](https://medium.com/@wenhoujx/boot-productivity-with-vscode-tasks-c98fa0f8b567) that covers achieving some my other emacs workflows in VScode.

## TODO

- [ ] somehow test on non-macOS?
- [x] search all file in the workspace.
    >  Use VScode search feature.
- [x] if upper case char typed, turn to case sensitive search for that subSearchString.
    > Done

## misc

[publish URL](https://marketplace.visualstudio.com/manage/publishers/wenhoujx)
