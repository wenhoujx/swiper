# Change Log

## [2.1.2] - 2024-12-16

- fix pick item description

## [2.1.1] - 2024-10-25

- fix issue [#11](https://github.com/wenhoujx/swiper/issues/11), wrong line number display, off by 1

## [2.1.0] - 2024-04-19

### Changed

- fixed line sort order, smaller line number are offered first. Note I had to hack for this to happen by moving searchStr to the beginning of the quickPickItem.

## [2.0.10] - 2022-12-23

### Added

- A configuration point `swiper.selectMatch` (default true) that controls if match is selected.

## [2.0.6] - 2022-12-23

### Changed

- remove annoying debug console logs.

## [2.0.4] - 2022-12-23

### Changed

- shameless plug my medium blog in readme.

## [2.0.0] - 2022-12-23

### Changed

- rename command to remove `grep`, since it's not backed by `grep` anymore. SORRY.
- use javascript string manipulation and regex, instead of grep, for more control.

## [1.7.0] - 2022-12-23

### Changed

- fix bug, now use globalStorageUri for file system

## [1.6.0] - 2022-12-23

### Changed

- now use `echo` command instead of relying on FS, should work on Windows.

## [1.5.0] - 2022-12-22

### Added

- now has border colors around the matched terms.

## [1.4.0] - 2022-12-22

### Changed

- better readme

## [1.3.0] - 2022-12-22

### Changed

- swiper selects the matched string.

## [1.2.0] - 2022-12-22

### Added

- `swiper.swiper-grep-word-at-cursor` that auto greps the current word at cursor.

## [1.1.0] - 2022-12-21

### Changed

- Use `grep` over `ag` for out of box UX, and more straightforward regex matching.

## [1.0.0] - 2022-12-21

- Initial release
