# swiper

copycat of emacs ivy swiper.

> I only tested this on my macOS, Please file bug report or feature request.

## Installation

install this extension,
install [silver-search](https://github.com/ggreer/the_silver_searcher)

make sure you can run `ag <search-string> <file>`

## Quick tutorial

Invoke command `Swiper: swiper` and start typing.


## Behind the scene

This extension is a simple wrapper of the CLI `ag`, it relays user input to `ag` and read its output.
