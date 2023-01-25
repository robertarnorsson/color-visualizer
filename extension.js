// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ntc = require('ntcjs');
const path = require('path');

const fileManager = require('./data_manager/save_load')

const hexToRgb = require('./convertions/HEX_to_RGB')
const hexToCmyk = require('./convertions/HEX_to_CMYK')
const hexToHsb = require('./convertions/HEX_to_HSB')

const findContrast = require('./convertions/find_contrast/findContrast')

const filepath_border = path.join(__dirname, 'data_manager', 'data', 'border.json');
const filepath_time = path.join(__dirname, 'data_manager', 'data', 'time.json');
const filepath_page = path.join(__dirname, 'data_manager', 'data', 'page.json');

let border_var = fileManager.loadFromJson(filepath_border);
let time_var = fileManager.loadFromJson(filepath_time);
let page_var = fileManager.loadFromJson(filepath_page);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let globalPanel

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable1 = vscode.commands.registerCommand('color-visualizer.color-v', function () {
		// The code you place here will be executed every time your command is executed

		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'colorVis', // Identifies the type of the webview. Used internally
			'Color Visualizer', // Title of the panel displayed to the user
			vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
			{} // Webview options. More on these later.
		);

		page_var = fileManager.loadFromJson(filepath_page);

		globalPanel = panel
		// And set its HTML content
		if (page_var == true) {
			globalPanel.webview.html = getAdvancedWebview("#FFFFFF", "255, 255, 255", "0, 0, 0, 0", "0, 0, 100", "White", "#000000", "transparent", 2)
		} else {
		globalPanel.webview.html = getSimpleWebview("#FFFFFF", "White", "#000000", "transparent", 2)
		}
		// colorhex, colorrgb, colorcmyk, colorhsb, colorname, textcolorHB, hexbordercolor, cBorderW

	});

	let color_border_width = 2
	
	let disposable2 = vscode.commands.registerCommand('color-visualizer.color-v-border', function () {

		border_var = fileManager.loadFromJson(filepath_border);

		if (border_var == true) {
			border_var = false
			color_border_width = 0
			fileManager.saveToJson(filepath_border, border_var);
		} else if (border_var == false) {
			border_var = true
			color_border_width = 2
			fileManager.saveToJson(filepath_border, border_var);
		}
	});

	let disposable3 = vscode.commands.registerCommand('color-visualizer.color-v-change-check-time', function () {

		time_var = fileManager.loadFromJson(filepath_time);

		vscode.window.showInputBox({
			prompt: 'Enter the prefered time above (1000 = 1 second)',
		  }).then((input) => {
			const numbers = input;
			time_var = numbers;
			vscode.window.showInformationMessage(
			  "The time between each loop is set to: " + numbers + " or " + numbers / 1000 + " seconds"
			);
			clearInterval(timer);
			timer = setInterval(updateColor, time_var);
			fileManager.saveToJson(filepath_time, numbers);
		});
	});

	let disposable4 = vscode.commands.registerCommand('color-visualizer.color-v-change-page', function () {

		let current_view = fileManager.loadFromJson(filepath_page)

		if (page_var == true) {
			page_var = false
			current_view = "Simple"
			fileManager.saveToJson(filepath_page, page_var);
		} else if (page_var == false) {
			page_var = true
			current_view = "Advanced"
			fileManager.saveToJson(filepath_page, page_var);
		}

		vscode.window.showInformationMessage(
			"Changed page to: "+current_view
		);

	});

	function updateColor() {

		const normalhex = "#FFFFFFF"

		// Check if the selection is empty or not
		function checkSelection() {
			// Get the active editor
			const editor = vscode.window.activeTextEditor;
			
			// Check if the editor is defined and not null
			if (editor) {
			  // Get the selection from the editor
			  const selection = editor.selection;
			  // Selection is empty
				if (selection.isEmpty == true) {
					return false;
				}
			  
				// The selection is not empty
				return true;
			} else {
				// No editor is open
			  	return false;
			}
		}

		function updateConvertion(hex) {
			
			// Get color name
			function getName(hex) {
				return ntc.name(hex)[1]
			}

			return [hex.toUpperCase(), hexToRgb(hex), hexToCmyk(hex), hexToHsb(hex), getName(hex), findContrast(hex)[0], findContrast(hex)[1], color_border_width]
			
		}
		
		// An if statement to run code if the selection is not empty
		if (checkSelection() == true) {

			// Get active editor, selected text and then the text from the selected text
			const editor = vscode.window.activeTextEditor;
			const selectedText = editor.selection;
			const text = editor.document.getText(selectedText);		  

			// Function to check if a string is a hex code or RGB values
			function checkHexRgb(text) {
				// Regular expression to check if string is a hex code
				const hexRegex = /^#([a-fA-F0-9]{6})$/;
			
				// Regular expression to check if string is RGB values
				const rgbRegex = /^\d{1,3}, ?\d{1,3}, ?\d{1,3}|\d{1,3},?\d{1,3},?\d{1,3}$/;

				if (hexRegex.test(text)) {
				// String is a hex code
				return "Hex";
				} else if (rgbRegex.test(text)) {
					return "RGB";
				} else {
				// String is neither a hex code nor RGB values
				return "Neither";
				}
			}

			if (checkHexRgb(text) != "Neither") {

				let hex = "#FFFFFF";
				
				if (checkHexRgb(text) == "Hex") {
					hex = text
				} else if (checkHexRgb(text) == "RGB") {
					function rgbToHex(r, g, b) {
						// Make sure each value is between 0 and 255
						r = Math.max(0, Math.min(255, r));
						g = Math.max(0, Math.min(255, g));
						b = Math.max(0, Math.min(255, b));
					  
						// Convert each value to a hexadecimal string
						var hexR = r.toString(16);
						var hexG = g.toString(16);
						var hexB = b.toString(16);
					  
						// Pad each string with zeros if necessary
						hexR = hexR.length == 1 ? "0" + hexR : hexR;
						hexG = hexG.length == 1 ? "0" + hexG : hexG;
						hexB = hexB.length == 1 ? "0" + hexB : hexB;
					  
						// Concatenate the strings and return the result
						return "#" + hexR + hexG + hexB;
					  }
					  
					function getRgbFromString(str) {
						let val = str.split(/[ ,]+/);

						// Return the array of integer values
						return [val[0], val[1], val[2]];
					}

					hex = rgbToHex(getRgbFromString(text)[0], getRgbFromString(text)[1], getRgbFromString(text)[2])
				} else {
					hex = normalhex
				}

				let values = updateConvertion(hex)
				
				if (page_var == true) {
					globalPanel.webview.html = getAdvancedWebview(values[0],values[1],values[2],values[3],values[4],values[5],values[6],values[7])
				} else {
				globalPanel.webview.html = getSimpleWebview(values[0],values[4],values[5],values[6],values[7])
				}
			}
		}
	};
	let timer = setInterval(updateColor, time_var);

	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
	}

	function getSimpleWebview(colorhex, colorname, textcolorHB, hexbordercolor, cBorderW) {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
	.square {
	  	width: 100%;
	  	height: 450px;
	  	background-color: ${colorhex};
		border-color: ${hexbordercolor};
		border-width: ${cBorderW}px;
		border-style: solid;
		border-radius: 25px;
		margin-top: 30px;
		margin-left: 30px;
		margin-right: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-direction: column;
	}
	.c {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-direction: column;
	}
	.squaretext {
	  	width: 100%;
		height: 100%;
		font-family: Arial, Helvetica, sans-serif;
		font-size:10vw;
		border: none;
		background: none;
		margin: 0;
		padding: 0;
		text-align: center;
	}
	.squaretexthex {
	  	width: 100%;
		height: 100%;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 15px;
		color: ${textcolorHB};
		border: none;
		background: none;
		margin-botton: 15px;
		padding: 0;
	}
	.squaretextname {
	  	width: 100%;
		height: 100%;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 40px;
		color: ${textcolorHB};
		border: none;
		background: none;
		margin: 0;
		padding: 0;
	}
	</style>
	</head>
	<body>
	<div class="c">
		<div class="square">
			<div class="c">
				<div class="squaretext">
					<h3 class="squaretexthex">${colorhex}</h3>
				</div>
				<div class="squaretext">
					<h1 class="squaretextname">${colorname}</h1>
				</div>
			</div>
		</div>
	</div>
	</body>
	</html>
	`;
}

function getAdvancedWebview(colorhex, colorrgb, colorcmyk, colorhsb, colorname, textcolorHB, hexbordercolor, cBorderW) {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
	.square {
	  	width: 100%;
	  	height: 450px;
	  	background-color: ${colorhex};
		border-color: ${hexbordercolor};
		border-width: ${cBorderW}px;
		border-style: solid;
		border-radius: 25px;
		margin-top: 30px;
		margin-left: 30px;
		margin-right: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-direction: column;
	}
	.c {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-direction: column;
	}
	.c1 {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-direction: column;
	}
	.squaretext {
	  	width: 100%;
		height: 100%;
		font-family: Arial, Helvetica, sans-serif;
		font-size:10vw;
		border: none;
		background: none;
		margin: 0;
		padding: 0;
		text-align: center;
	}
	.squaretexthex {
	  	width: 100%;
		height: 100%;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 15px;
		color: ${textcolorHB};
		border: none;
		background: none;
		margin-botton: 15px;
		padding: 0;
	}
	.squaretextname {
	  	width: 100%;
		height: 100%;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 40px;
		color: ${textcolorHB};
		border: none;
		background: none;
		margin: 0;
		padding: 0;
	}
	.convertiontext {
		width: 100%;
		height: 100%;
		font-family: Arial, Haettenschweiler, "Franklin Gothic Bold", "Arial Black", "sans-serif";
		font-size: 45px;
		line-height: 1.0em;
		letter-spacing: 0.05em;
		color: #F5F5F5;
		border: none;
		background: none;
		margin-top: 75px;
		padding: 0;
	}
	.bottomcolorbox {
		width: 60%;
		height: 350px;
		background: #CDCDCD;
		border-radius: 25px;
		margin-top: 15px;
	}
	table.convColorTable {
	  font-family: "Arial Black", Gadget, sans-serif;
	  background-color: #F5F5F5;
	  width: 100%;
	  height: 100%;
	  min-width: 350px;
	  border-radius: 25px;
	  text-align: center;
	  border-collapse: collapse;
	  cursor: pointer;
	}
	table.convColorTable td, table.convColorTable th {
	  padding: 5px 1px;
	}
	table.convColorTable tbody td {
	  font-size: 17px;
	  color: #333333;
	}
	table.convColorTable tr:nth-child(even) {
	  background: #E6E6E6;
	}
	table.convColorTable tfoot td {
	  font-size: 14px;
	}
	table.convColorTable tfoot .links {
	  text-align: right;
	}
	table.convColorTable tfoot .links a{
	  display: inline-block;
	  background: #1C6EA4;
	  color: #FFFFFF;
	  padding: 2px 8px;
	  border-radius: 5px;
	}

	table.convColorTable tr:hover td:nth-of-type(2):before {
	font-size: 22px;
	border-radius: 25px;
	}
	.parent:hover .child{ color:  #6C6C6C; }
	</style>
	</head>
	<body>
	<div class="c">
		<div class="square">
			<div class="c">
				<div class="squaretext">
					<h3 class="squaretexthex">${colorhex}</h3>
				</div>
				<div class="squaretext">
					<h1 class="squaretextname">${colorname}</h1>
				</div>
			</div>
		</div>
		<div class="c1">
			<div>
				<h2 class="convertiontext">Convertion</h2>
			</div>
			<div class="c1">
				<div class="bottomcolorbox">
					<table class="convColorTable">
						<tbody>
							<tr class="parent">
								<td class="child">NAME</td>
								<td class="child">${colorname}</td>
							</tr>
							<tr class="parent">
								<td class="child">HEX</td>
								<td class="child">${colorhex}</td>
							</tr>
							<tr class="parent">
								<td class="child">RGB</td>
								<td class="child">${colorrgb}</td>
							</tr>
							<tr class="parent">
								<td class="child">CMYK</td>
								<td class="child">${colorcmyk}</td>
							</tr>
							<tr class="parent">
								<td class="child">HSB</td>
								<td class="child">${colorhsb}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	</body>
	</html>
	`;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}