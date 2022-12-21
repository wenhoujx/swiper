# swiper

a dumb copycat of emacs swiper. Support search regex string in the current open window.

> I only tested this on my macOS, Please file bug report or feature request.

> This swiper does not match multiline (yet...)

![DEMO](./img/swiper-silver.gif)

## Installation

Install this extension.

Install the [silver search](https://github.com/ggreer/the_silver_searcher).

## Quick tutorial

Invoke command `Swiper: Swiper Silver` and start typing.

default case insensitive search.

Remember to escape common regex character e.g. `\[` , `\.`

Some quick Example:

```sh
# search widecard 
command.*swiper 
# lint OR display 
lint|display
# line starts with test 
^test
```

## Behind the scene

This extension is a simple wrapper of the CLI `ag`, it relays user input to `ag` and parses its output.

The reason to use `ag` instead of grep is that i weant to later search all files in the current workspace.

There is no good reason why I use `ag` over `rg` and any other tools. I am more familiar with `ag`.

## Motivation

I come from emacs to VScode, vscode is awesome, but misses a few features i do daily in emacs. This is one of them.

I wrote a [blog](https://medium.com/@wenhoujx/boot-productivity-with-vscode-tasks-c98fa0f8b567) that covers achiving some my other emacs workflows in VScode.

## TODO

- [ ] search all file in the workspace.  
- [ ] somehow test on non-macOS?
- [ ] maybe multiline search support
