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
		panel.webview.html = getWebviewContent("#FFFFFF", "255, 255, 255", "0, 0, 0, 0", "0, 0, 100", "White", "#000000", "transparent", 2);
		// colorhex, colorrgb, colorcmyk, colorhsb, colorname, textcolorHB, hexbordercolor, cBorderW
		globalPanel = panel
	});
	
	let color_border_on = true
	let color_border_width = 2
	
	let disposable2 = vscode.commands.registerCommand('color-visualizer.color-v-border', function () {

		if (color_border_on == true) {
			color_border_on = false
			color_border_width = 0
		} else if (color_border_on == false) {
			color_border_on = true
			color_border_width = 2
		}
	});

	let loop_time = 1000

	let disposable3 = vscode.commands.registerCommand('color-visualizer.color-v-change-check-time', function () {

		vscode.window.showInputBox({
			prompt: 'Enter the prefered time above (1000 = 1 second)',
		  }).then((input) => {
			const numbers = input;
			loop_time = numbers;
			vscode.window.showInformationMessage(
			  "The time between each loop is set to: " + numbers + " or " + numbers / 1000 + " seconds"
			);
			clearInterval(timer);
			timer = setInterval(updateColor, loop_time);
		});
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

			function findContrast(hex) {
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
					const bordertrans = getContrast(bgColor, "#ffffff");
					const borderblack = getContrast(bgColor, "#000000");
				
					return [whiteContrast > blackContrast ? "#ffffff" : "#000000", borderblack > bordertrans ? "transparent" : "#ffffff"];
				}

				return getTextColor(hex)
			}

			function hexToRgb(hex) {

				function convhexToRgb(hex) {
					// Parse the hexadecimal color code
					let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				
					// If the color code is invalid, return null
					if (!result) return null;
				
					// Otherwise, return the RGB value as an array of numbers
					return [
						parseInt(result[1], 16),
						parseInt(result[2], 16),
						parseInt(result[3], 16)
					];
				}

				function makeRgbString(hex) {
					return convhexToRgb(hex)[0]+", "+convhexToRgb(hex)[1]+", "+convhexToRgb(hex)[2]
				}
			
				return makeRgbString(hex)
			}

			function hexToCmyk(hex) {

				function convhexToCmyk(hex) {
					// Parse the hexadecimal color code
					let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				
					// If the color code is invalid, return null
					if (!result) return null;
				
					// Otherwise, return the RGB value as an array of numbers
					return [
						parseInt(result[1], 16),
						parseInt(result[2], 16),
						parseInt(result[3], 16)
					];
				}

				function floatToInt(x) {
					return (x < 0 ? Math.ceil(x) : Math.floor(x));
				}

				function rgbToCmyk(r, g, b) {
					var c = 1 - (r / 255);
					var m = 1 - (g / 255);
					var y = 1 - (b / 255);
				  
					var k = Math.min(c, m, y);
				  
					if (k == 1) {
					  return [0, 0, 0, 1];
					}
				  
					c = (c - k) / (1 - k);
					m = (m - k) / (1 - k);
					y = (y - k) / (1 - k);

					c = c * 100;
					m = m * 100;
					y = y * 100;
					k = k * 100;

					c = floatToInt(c);
					m = floatToInt(m);
					y = floatToInt(y);
					k = floatToInt(k);
				  
					return [c, m, y, k];
				}

				var r = convhexToCmyk(hex)[0];
				var g = convhexToCmyk(hex)[1];
				var b = convhexToCmyk(hex)[2];

				function makeCmykString(r, g ,b) {
					return rgbToCmyk(r, g, b)[0]+", "+rgbToCmyk(r, g, b)[1]+", "+rgbToCmyk(r, g, b)[2]+", "+rgbToCmyk(r, g, b)[3]
				}

				return makeCmykString(r, g, b)
			}

			function hexToHsb(hex) {
				function convhexToHsb(hex) {
					// Parse the hexadecimal color code
					let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				
					// If the color code is invalid, return null
					if (!result) return null;
				
					// Otherwise, return the RGB value as an array of numbers
					return [
						parseInt(result[1], 16),
						parseInt(result[2], 16),
						parseInt(result[3], 16)
					];
				}

				function floatToInt(x) {
					return (x < 0 ? Math.ceil(x) : Math.floor(x));
				}

				function rgbToHsb(r, g, b) {
					function RGBToHSB(r, g, b) {
						// Normalize RGB values
						r /= 255;
						g /= 255;
						b /= 255;
					  
						// Find the maximum and minimum RGB values
						let max = Math.max(r, g, b);
						let min = Math.min(r, g, b);
					  
						// Initialize HSB values
						let h, s, v = max;
					  
						// Calculate Saturation
						let d = max - min;
						s = max == 0 ? 0 : d / max;
					  
						// Calculate Hue
						if (max == min) {
						  h = 0; // No color, it's a shade of gray
						} else {
						  switch (max) {
							case r:
							  h = (g - b) / d + (g < b ? 6 : 0);
							  break;
							case g:
							  h = (b - r) / d + 2;
							  break;
							case b:
							  h = (r - g) / d + 4;
							  break;
						  }
						  h /= 6;
						}
						
						h = h * 100
						s = s * 100
						v = b * 100
					  
						// Return the HSB values as an object
						return [h, s, v];
					  }
					var h = RGBToHSB(r, g, b)[0];
					var s = RGBToHSB(r, g, b)[1];
					var b = RGBToHSB(r, g, b)[2];

					h = floatToInt(h);
					s = floatToInt(s);
					b = floatToInt(b);

					return [h, s, b];
				}
				return rgbToHsb(convhexToHsb(hex)[0], convhexToHsb(hex)[1], convhexToHsb(hex)[2]);
			}
			
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
				globalPanel.webview.html = getWebviewContent(values[0],values[1],values[2],values[3],values[4],values[5],values[6],values[7])
			}
		} else if (checkSelection() == false) {
			let values = updateConvertion(normalhex)
			globalPanel.webview.html = getWebviewContent(values[0],values[1],values[2],values[3],values[4],values[5],values[6],values[7])
		}
	};
	let timer = setInterval(updateColor, loop_time);

	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	}

function getWebviewContent(colorhex, colorrgb, colorcmyk, colorhsb, colorname, textcolorHB, hexbordercolor, cBorderW) {
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