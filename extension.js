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

	var globalPanel

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable1 = vscode.commands.registerCommand('color-visualizer.start', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Opend window successfully!');

		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'colorVis', // Identifies the type of the webview. Used internally
			'Color Visualizer', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{} // Webview options. More on these later.
		  );
		// And set its HTML content
		panel.webview.html = getWebviewContent("#FFFFFF", "White", "#000000");
		globalPanel = panel
	});

	function updateColor() {

		function checkSelection() {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
			  return false;
			}
		  
			const selection = editor.selection;
			if (selection.isEmpty) {
			  return false;
			}
		  
			return true;
		  }

		if (checkSelection) {
			const editor = vscode.window.activeTextEditor;
			const selectedText = editor.selection;
			const text = editor.document.getText(selectedText);
		
			function isHexColor (hextext) {
				let text = String(hextext)
				let result = text.includes("#");
				let lenght = text.length;
				return [result, lenght];
			}

			var isHexList = isHexColor(text);

			let isHex = isHexList[0]
			let hexlenght = isHexList[1]

			if (isHex == true && hexlenght == 7) {

				// get contrast of color

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

				function getName(hex) {
					return ntc.name(hex)[1]
				}

				//function hexToRGB (hex) {
				//	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				//	return result ? {
				//		R: parseInt(result[1], 16),
				//		G: parseInt(result[2], 16),
				//		B: parseInt(result[3], 16)
				//	} : null;
				//}

				//function hexToCMYK (hex) {
				//	var computedC = 0;
				//	var computedM = 0;
				//	var computedY = 0;
				//	var computedK = 0;
				//
				//	var r = hexToRGB(hex).R
				//	var g = hexToRGB(hex).G
				//	var b = hexToRGB(hex).B
				//
				//	// BLACK
				//	if (r==0 && g==0 && b==0) {
				//	computedK = 1;
				//	return [0,0,0,1];
				//	}
				//
				//	computedC = 1 - (r/255);
				//	computedM = 1 - (g/255);
				//	computedY = 1 - (b/255);
				//
				//	var minCMY = Math.min(computedC,Math.min(computedM,computedY));
				//
				//	computedC = (computedC - minCMY) / (1 - minCMY) ;
				//	computedM = (computedM - minCMY) / (1 - minCMY) ;
				//	computedY = (computedY - minCMY) / (1 - minCMY) ;
				//	computedK = minCMY;
				//
				//	return [Math.round(computedC*100),Math.round(computedM*100),Math.round(computedY*100),Math.round(computedK*100)];
				//}

				if (text != "") {
					var hex = text

					//var R = hexToRGB(hex).R
					//var G = hexToRGB(hex).G
					//var B = hexToRGB(hex).B

					globalPanel.webview.html = getWebviewContent(hex, getName(hex), getTextColor(hex)

					//R,
					//G,
					//B,

					//hexToCMYK(hex)[0],
					//hexToCMYK(hex)[1],
					//hexToCMYK(hex)[2],
					//hexToCMYK(hex)[3]
					)
				};
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
		margin: 0;
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