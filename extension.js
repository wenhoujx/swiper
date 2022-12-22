const vscode = require('vscode');
const cp = require('child_process')
const fs = require('fs')

const styles = [
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'thin',
			borderColor: "red"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'thin',
			borderColor: "blue"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'thin',
			borderColor: "green"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'thin',
			borderColor: "yellow"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'thin',
			borderColor: "aqua"
		}
	),
	vscode.window.createTextEditorDecorationType(
		{
			border: "solid",
			borderWidth: 'thin',
			borderColor: "cyan"
		}
	),
]
function _writeToTempFileIfNotSaved(document) {
	if (document.filename) {
		// console.log(`file is a saved file ${document.filename}`)
		return document.filename
	} else {
		const filePath = "/tmp/vscode-swiper-tmp-buffer"
		// console.log(`file not saved, create a tmp file: ${filePath}`)
		fs.writeFileSync(filePath, document.getText(), 'utf8');
		return filePath
	}
}


function _matchLineToQuickPickItem(line, parsed) {
	const lineIndex = line.indexOf(":")
	const lineNumber = parseInt(line.slice(0, lineIndex))
	const lineContent = line.slice(lineIndex + 1)
	return {
		label: `${lineNumber} : ${lineContent}`,
		description: parsed.map(p => p.pattern).join(" "),
		parsed: parsed,
		line: lineNumber - 1
	}
}

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
		.map(subSearch => ({
			pattern: subSearch,
			caseSensitive: /[A-Z]/.test(subSearch),
			negate: subSearch.startsWith("!")
		}))
}
function _getSearchCommand(parsed, filename) {
	if (!parsed.length) {
		return null
	}

	const greps = parsed.reduce((acc, subSearch) => {
		// default case insensitive search 
		let grepString = "grep"
		if (!subSearch.caseSensitive) {
			grepString += " -i"
		}
		if (!acc.length) {
			// print line number in the first grep 
			grepString += " -n"
		}
		if (subSearch.negate) {
			// not pattern 
			grepString += ` -v '${subSearch.pattern.slice(1)}'`
		} else {
			grepString += ` '${subSearch.pattern}'`
		}
		acc.push(grepString)
		return acc
	}, [])
		.join(" | ")
	return `cat ${filename} | ${greps}`
}


function _search(searchStr, filename, pick) {
	if (searchStr.length < 2 || searchStr === PROMPT_STRING) {
		// to avoid search on too short a string. 
		return
	}
	const parsed = _parseSearchString(searchStr)
	const shellCommand = _getSearchCommand(parsed, filename)
	if (!shellCommand) {
		return
	}
	console.log(`search: ${shellCommand}`)
	cp.exec(shellCommand, (err, stdout, stderr) => {
		if (stdout) {
			console.log(stdout)
			pick.items = stdout.split("\n")
				.filter(ele => ele && ele.trim().length)
				.map(ele => _matchLineToQuickPickItem(ele, parsed))
			// resume previous focus if possible
			if (state.lastValue === searchStr && state.lastSelected) {
				// javascript uses reference equal, we need to find the exact object that matches the last selected 
				pick.activeItems = [pick.items.find(it => (it.label === state.lastSelected.label) &&
					(it.description === state.lastSelected.description) &&
					(it.line === state.lastSelected.line)
				)]
			}
			_updateMatchColor(pick.items)
		}
		if (err) {
			console.log("stderr: " + stderr)
			console.log('error: ' + err);
			pick.items = []
			_clearDecorations()
		}
	});
}

function _findMatchedIndices(item) {
	const { line, parsed } = item
	const lineText = vscode.window.activeTextEditor.document.lineAt(line).text

	return parsed
		.filter(p => !p.negate)
		.map(p => {
			const pattern = _cleanPattern(p.pattern)
			if (p.caseSensitive) {
				return [lineText.indexOf(pattern), pattern.length]
			} else {
				return [lineText.toLowerCase().indexOf(pattern), pattern.length]
			}
		})
}

function _clearDecorations() {
	styles.forEach(s => vscode.window.activeTextEditor.setDecorations(s, []))
}

function _updateMatchColor(items) {
	// im not very happy with the code in this func 
	_clearDecorations()
	const ranges = items.map(item => {
		const indices = _findMatchedIndices(item)
		return indices.map(ind => {
			const [start, length] = ind
			if (start === -1) {
				console.log(`item: ${JSON.stringify(item)}`)
				// keep coloring aligned
				return null
			} else {
				return new vscode.Range(
					new vscode.Position(item.line, start),
					new vscode.Position(item.line, start + length))
			}
		})
	})

	const colors = Array.from(Array(styles.length), () => [])
	for (const r of ranges) {
		for (let i = 0; i < r.length; i++) {
			const range = r[i]
			if (range) {
				colors[i % styles.length].push(range)
			}
		}
	}
	for (let i = 0; i < colors.length; i++) {
		vscode.window.activeTextEditor.setDecorations(styles[i], colors[i])
	}
}

function _cleanPattern(pattern) {
	let cleaned = pattern
	cleaned = cleaned.replaceAll("\\!", "!")
	if (cleaned.includes("\\")) {
		return pattern.slice(0, cleaned.indexOf("\\"))
	} else {
		return cleaned
	}
}
function _jumpTo(selected) {
	// find the last 
	const firstIndex = _firstOrNull(_findMatchedIndices(selected).reverse())
	const start = firstIndex ? firstIndex[0] : 0
	const end = firstIndex ? firstIndex[0] + firstIndex[1] : 0
	vscode.window.activeTextEditor.selections = [
		new vscode.Selection(
			new vscode.Position(selected.line, start),
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
	const editor = vscode.window.activeTextEditor
	const filename = _writeToTempFileIfNotSaved(editor.document)
	const currentSelection = vscode.window.activeTextEditor.selection
	const pick = vscode.window.createQuickPick()

	pick.canSelectMany = false
	pick.matchOnDescription = true
	pick.value = state.lastValue

	pick.onDidChangeValue((value) => {
		_search(value, filename, pick)
	})
	pick.onDidAccept(() => {
		const selected = _firstOrNull(pick.selectedItems)
		console.log(`selected: ${JSON.stringify(selected)}`)
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
		_resortCursor(pick, currentSelection)
	})
	pick.show()
}

function _resortCursor(pick, previousSelection) {
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
		vscode.commands.registerCommand('swiper.swiper-grep', () => swipe()));
	context.subscriptions.push(
		vscode.commands.registerCommand('swiper.swiper-grep-word-at-cursor', () =>
			swipeWordAtCursor()
		));
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
