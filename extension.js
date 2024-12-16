const vscode = require('vscode');

const isDebug = false

// TODO: not sure how to select the best list of colors according to the theme.
const styles = [
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'medium',
			borderColor: "red"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'medium',
			borderColor: "cyan"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'medium',
			borderColor: "green"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'medium',
			borderColor: "yellow"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'medium',
			borderColor: "BlueViolet"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'medium',
			borderColor: "Fuchsia"
		}
	),
]



const PROMPT_STRING = "type 2 or more chars to search"

let state = {
	// last searched string 
	lastValue: PROMPT_STRING,
	// last selected item 
	lastSelected: null
}


function _parseSearchString(searchStr) {
	if (!searchStr.trim().length) {
		return []
	}
	return searchStr.split(" ")
		.map(subSearch => subSearch.trim())
		.filter(subSearch => subSearch)
		.map(subSearch => {
			const isNegate = subSearch.startsWith("!")
			return ({
				pattern: isNegate ? subSearch.slice(1) : subSearch,
				isRegex: isNegate ? subSearch.startsWith("!/") : subSearch.startsWith("/"),
				caseSensitive: /[A-Z]/.test(subSearch),
				negate: subSearch.startsWith("!")
			})
		})
}

function _searchContent(parsed) {
	const items = []
	const doc = vscode.window.activeTextEditor.document
	for (let i = 0; i < doc.lineCount; i++) {
		const matches = _searchLine(i, doc.lineAt(i).text, parsed)
		if (matches) {
			items.push(matches)
		}
	}
	return items
}

function _searchLine(lineIndex, line, parsed) {
	const matchedRange = {
		line: lineIndex,
		ranges: []
	}
	for (const p of parsed) {
		if (p.isRegex) {
			const splitRegex = p.pattern.match(new RegExp('^/(.*?)/([gimy]*)$'));
			if (!splitRegex) {
				return null
			}
			const [pattern, flags] = splitRegex.slice(1)
			// only find the first 
			const regex = new RegExp(pattern, flags);
			const m = regex.exec(line)
			if (!m && !p.negate) {
				// regular mode, and this line doesn't match 
				return null
			} else if (m && p.negate) {
				// intentionally skip for case when matches but should be ignored. 
				return null
			} else if (!m && p.negate) {
				// negate, and doesn't match, should keep this line. 
				continue
			} else {
				// normal mode, record the matched range. 
				matchedRange.ranges.push([m.index, m[0].length])
			}
		} else {
			const m = p.caseSensitive ? line.indexOf(p.pattern) : line.toLowerCase().indexOf(p.pattern)
			if (p.negate) {
				if (m !== -1) {
					// intentionally skip this line. 
					return null
				}
			} else {
				if (m === -1) {
					// normal mode, no match 
					return null
				} else {
					// normal mode, matches, record range. 
					matchedRange.ranges.push([m, p.pattern.length])
				}
			}
		}
	}
	return matchedRange
}

function _search(searchStr, pick) {
	if (searchStr.length < 2 || searchStr === PROMPT_STRING) {
		// to avoid search on too short a string. 
		return
	}
	const parsed = _parseSearchString(searchStr)
	const items = _searchContent(parsed)
	isDebug && console.log(searchStr)
	isDebug && console.log(JSON.stringify(parsed))
	isDebug && console.log(JSON.stringify(items))

	const doc = vscode.window.activeTextEditor.document
	pick.items = items.map(match => ({
		label: `${_leftPad(match.line+1)}: ${searchStr} `,
		// IMPORTANT: set description forces vscode quickpick to match the description 
		// instead of the line content itself.
		// otherwise quickpick filters to nothing. 
		description: `${doc.lineAt(match.line).text}`,
		...match
	}))
	if (state.lastValue === searchStr && state.lastSelected) {
		// javascript uses reference equal, we need to find the exact object that matches the last selected 
		pick.activeItems = [pick.items.find(it =>
			// same label, same line #. 
			(it.label === state.lastSelected.label) &&
			(it.line === state.lastSelected.line)
		)]
	}
	_updateMatchColor(items)
}

function _leftPad(lineN) {
	const lineNStr = lineN.toString()
	return "0".repeat(Math.max(0, 4 - lineNStr.length)) + lineNStr
}

function _clearDecorations() {
	styles.forEach(s => vscode.window.activeTextEditor.setDecorations(s, []))
}

function _updateMatchColor(items) {
	_clearDecorations()
	const colors = Array.from(Array(styles.length), () => [])
	for (const item of items) {
		for (let i = 0; i < item.ranges.length; i++) {
			const [start, length] = item.ranges[i]
			if (length === 0) {
				// no length, no need to set border. 
				continue
			}
			colors[i % styles.length].push(
				new vscode.Range(
					new vscode.Position(item.line, start),
					new vscode.Position(item.line, start + length)
				)
			)
		}
	}
	for (let i = 0; i < colors.length; i++) {
		vscode.window.activeTextEditor.setDecorations(styles[i], colors[i])
	}
}


function _jumpTo(selected) {
	// find the last range which corresponds to the last search term 
	const lastIndex = _firstOrNull(selected.ranges.reverse())
	const start = lastIndex ? lastIndex[0] : 0
	const end = lastIndex ? lastIndex[0] + lastIndex[1] : 0
	const selectMatch = vscode.workspace.getConfiguration("swiper").get("selectMatch")
	vscode.window.activeTextEditor.selections = [
		new vscode.Selection(
			new vscode.Position(selected.line, selectMatch ? start : end),
			new vscode.Position(selected.line, end))]
}

function _firstOrNull(items) {
	if (!(items.length) || !(items[0])) {
		return null
	} else {
		return items[0]
	}
}

function swipeWordAtCursor() {
	const editor = vscode.window.activeTextEditor
	const currentSelection = vscode.window.activeTextEditor.selection
	// either selection or cursor
	const word = editor.document.getText(editor.selection) || editor.document.getText(editor.document.getWordRangeAtPosition(currentSelection.start))
	state = {
		lastValue: word, // set last value with current word or selection
		lastSelected: null
	}
	swipe()
}

function swipe() {
	const currentSelection = vscode.window.activeTextEditor.selection
	const pick = vscode.window.createQuickPick()

	pick.canSelectMany = false
	pick.matchOnDescription = true
	pick.value = state.lastValue

	pick.onDidChangeValue((value) => {
		_search(value, pick)
	})
	pick.onDidAccept(() => {
		const selected = _firstOrNull(pick.selectedItems)
		isDebug && console.log(`selected: ${JSON.stringify(selected)}`)
		if (!selected) {
			return
		}
		state = {
			lastValue: pick.value,
			lastSelected: selected
		}
		pick.hide();
		_jumpTo(state.lastSelected)
	});
	pick.onDidChangeActive(items => {
		const focused = _firstOrNull(items)
		if (!focused) {
			return
		}
		_focusOnActiveItem(focused)
	})
	pick.onDidHide(() => {
		// resort previous cursor position if nothing selected
		_clearDecorations()
		_resortCursorIfNoneSelected(pick, currentSelection)
	})
	pick.show()
}

function _resortCursorIfNoneSelected(pick, previousSelection) {
	if (pick.selectedItems.length === 0) {
		vscode.window.activeTextEditor.revealRange(
			new vscode.Range(previousSelection.start, previousSelection.end),
			vscode.TextEditorRevealType.InCenter);
		vscode.window.activeTextEditor.selection = previousSelection;
	}
}

function _focusOnActiveItem(focused) {
	const start = new vscode.Position(focused.line, 0);
	const end = new vscode.Position(focused.line, 0);
	vscode.window.activeTextEditor.revealRange(
		new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter);
	vscode.window.activeTextEditor.selection = new vscode.Selection(start, end);
}

function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('swiper.swiper', () => swipe()));
	context.subscriptions.push(
		vscode.commands.registerCommand('swiper.swiper-word-at-cursor', () =>
			swipeWordAtCursor()
		));
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
