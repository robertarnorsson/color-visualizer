// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ntc = require('ntcjs');

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
		// And set its HTML content
		panel.webview.html = getWebviewContent("#FFFFFF", "White", "#000000");
		globalPanel = panel
	});

	function updateColor() {

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
		
		// An if statement to run code if the selection is not empty
		if (checkSelection() == true) {

			// Get active editor, selected text and then the text from the selected text
			const editor = vscode.window.activeTextEditor;
			const selectedText = editor.selection;
			const text = editor.document.getText(selectedText);

			// Function to check if a string is a hex code or RGB values
			function checkHexOrRgb(text) {
				// Regular expression to check if string is a hex code
				const hexRegex = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
			
				// Regular expression to check if string is RGB values
				const rgbRegex = /^\d{1,3}, ?\d{1,3}, ?\d{1,3}|\d{1,3},?\d{1,3},?\d{1,3}$/;

				if (hexRegex.test(text)) {
				// String is a hex code
				return "Hex";
				} else if (rgbRegex.test(text)) {
				// String is RGB values
				return "RGB";
				} else {
				// String is neither a hex code nor RGB values
				return "Neither";
				}
			}

			if (checkHexOrRgb(text) != "Neither") {

				let hex;
				
				if (checkHexOrRgb(text) == "Hex") {
					hex = text
				} else if (checkHexOrRgb(text) == "RGB") {
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
					  
					function getValuesFromString(str) {
						let val = str.split(/[ ,]+/);

						// Return the array of integer values
						return [val[0], val[1], val[2]];
					}

					hex = rgbToHex(getValuesFromString(text)[0], getValuesFromString(text)[1], getValuesFromString(text)[2])
				}

				// Find the contrast of the color and then change the text color to white or black depending on the contrast

				function getRGB(c) {
					return parseInt(c, 16) || c;
				}
				
				function getsRGB(c) {
					return getRGB(c) / 255 <= 0.03928
					? getRGB(c) / 255 / 12.92
					: Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
				}
				
				function getLuminance(hexColor) {
					return (
					0.2126 * getsRGB(hexColor.substr(1, 2)) +
					0.7152 * getsRGB(hexColor.substr(3, 2)) +
					0.0722 * getsRGB(hexColor.substr(-2))
					);
				}
				
				function getContrast(f, b) {
					const L1 = getLuminance(f);
					const L2 = getLuminance(b);
					return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
				}
				
				function getTextColor(bgColor) {
					const whiteContrast = getContrast(bgColor, "#ffffff");
					const blackContrast = getContrast(bgColor, "#000000");
				
					return whiteContrast > blackContrast ? "#ffffff" : "#000000";
				}
				
				// Get color name
				function getName(hex) {
					return ntc.name(hex)[1]
				}

				globalPanel.webview.html = getWebviewContent(hex.toUpperCase(), getName(hex), getTextColor(hex))

			}
		}

	};
	setInterval(updateColor, 500)

	context.subscriptions.push(disposable1);
	}

function getWebviewContent(colorhex, colorname, textcolorHB) {
	return `
	<!DOCTYPE html>
	<html>
	<head>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
	.square {
	  	width: 100%;
	  	height: 450px;
	  	background-color: ${colorhex};
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
		margin-botton: 30px;
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