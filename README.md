# swiper

a dumb copycat of emacs swiper. Support search regex string in the current open window.

> I only tested this on my macOS, Please file bug report or feature request.

> This swiper does not match multiline (yet...)

![DEMO](./img/swiper-silver.gif)

## Installation

Install this extension.

## Quick tutorial

Invoke command `Swiper: Swiper Grep` and start typing.

basic rules:

1. Search use grep basic regex syntax.
2. Search strings separated by space are AND-ed toegether. e.g. "a b" matched lines with "a" and "b" on the same line.
3. Search string prefixed with `!` negates the search, "a !b" matches lines with "a" but not "b"
4. Default case insensitive search.

Some quick Example:

```sh
# search widecard 
command*swiper 
# lint OR display 
lint\|display

lint|display # searches the literal string "lint|display"
# line starts with test 
^test
```

## Behind the scene

This extension is a simple wrapper of the CLI `grep`, it relays user input to `grep` and parses its output.

The reason to use `grep` over `ag` or `rg` is to avoid additional installation and work out of box.

## Motivation

I come from emacs to VScode, vscode is awesome, but misses a few features i do daily in emacs. This is one of them.

I wrote a [blog](https://medium.com/@wenhoujx/boot-productivity-with-vscode-tasks-c98fa0f8b567) that covers achiving some my other emacs workflows in VScode.

## TODO

- [ ] search all file in the workspace.  
- [ ] somehow test on non-macOS?
- [ ] maybe multiline search support
