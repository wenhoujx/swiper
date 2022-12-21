const vscode = require('vscode');
const cp = require('child_process')
const fs = require('fs')


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


function _matchLineToQuickPickItems(line, searchStr) {
	// return array of matches with line # and ranges, one line can have >1 matches. 
	const match = /^(\d+);([\d ,]+)*:?(.*)$/.exec(line)
	const lineNumber = parseInt(match[1])
	const rangeString = match[2]
	const lineContent = match[3]
	if (!rangeString.trim()) {
		// no range, only line number, mark the whole line 
		return [{
			label: `${lineNumber}: ${lineContent}`,
			// this is a hack for quickpick to match 
			description: searchStr,
			// b/c ag line matches starts from 1, vscode from 0
			line: lineNumber - 1,
			start: 0,
			end: lineContent.length

		}]
	} else {
		return (rangeString.includes(",") ? rangeString.trim().split(",") : [rangeString.trim()])
			.map(range => range.split(" ").map(ele => parseInt(ele)))
			.map(range => ({
				label: `${lineNumber}: ${lineContent}`,
				// this is a hack for quickpick to match 
				description: searchStr,
				// b/c ag line matches starts from 1, vscode from 0
				line: lineNumber - 1,
				start: range[0],
				end: range[0] + range[1]
			}))
	}
}

const PROMPT_STRING = "type 3 or more chars to search"

let state = {
	// last searched string 
	lastValue: PROMPT_STRING,
	// last selected item 
	lastSelected: null
}


function _search(searchStr, filename, pick) {
	if (searchStr.length < 3 || searchStr === PROMPT_STRING) {
		// to avoid search on too short string. 
		return
	}
	const shellCommand = `ag --nomultiline --ackmate '${searchStr}' ${filename}`
	console.log(`search: ${shellCommand}`)
	cp.exec(shellCommand, (err, stdout, stderr) => {
		if (stdout) {
			console.log(stdout)
			pick.items = stdout.split("\n")
				.filter(ele => ele && ele.trim().length)
				.flatMap(ele => _matchLineToQuickPickItems(ele, searchStr))
			// resume previous focus if possible
			if (state.lastValue === searchStr && state.lastSelected) {
				// javascript uses refenrece equal, we need to find the exact object that matches the last selected 
				pick.activeItems = [pick.items.find(it => (it.label === state.lastSelected.label) &&
					(it.line === state.lastSelected.line) &&
					(it.start === state.lastSelected.start) &&
					(it.end === state.lastSelected.end)
				)]
			}
		}
		if (err) {
			console.log("stderr: " + stderr)
			console.log('error: ' + err);
		}
	});
}

function _jumpTo({ line, start, end }) {
	vscode.window.activeTextEditor.selections = [
		new vscode.Selection(
			new vscode.Position(line, start),
			new vscode.Position(line, end))]
}

function _firstOrNull(items) {
	if (!(items.length) || !(items[0])) {
		return null
	} else {
		return items[0]
	}
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
		_resortCursor(pick, currentSelection)
	})
	pick.show()
}

function _resortCursor(pick, previousSelection) {
	if (pick.selectedItems.length == 0) {
		vscode.window.activeTextEditor.revealRange(
			new vscode.Range(previousSelection.start, previousSelection.end),
			vscode.TextEditorRevealType.InCenter);
		vscode.window.activeTextEditor.selection = previousSelection;
	}
}

function _focusOnActiveItem(focused) {
	const start = new vscode.Position(focused.line, focused.start);
	const end = new vscode.Position(focused.line, focused.end);
	vscode.window.activeTextEditor.revealRange(
		new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter);
	vscode.window.activeTextEditor.selection = new vscode.Selection(start, end);
}

function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('swiper.swiper-ag', () => swipe()));
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
