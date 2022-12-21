# swiper

copycat of emacs swiper

> I only tested this on my macOS, Please file bug report or feature request.

## Installation

install this extension,
install [silver-search](https://github.com/ggreer/the_silver_searcher)

make sure you can run `ag <search-string> <file>`

## Quick tutorial

Invoke command `Swiper: swiper` and start typing.

default case insensitive search.

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

This extension is a simple wrapper of the CLI `ag`, it relays user input to `ag` and read its output.

## TODO

- [ ] search all file in the workspace.  
- [ ] somehow test on non-macOS?
