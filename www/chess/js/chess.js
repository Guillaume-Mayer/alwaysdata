// Namesapce constants
const NS_SVG	= "http://www.w3.org/2000/svg";
const NS_XLINK	= "http://www.w3.org/1999/xlink"

// Sounds
var audioGood = new Audio("mp3/Applause.mp3");
var audioBad = new Audio("mp3/Buzzer.mp3");

// SVG Main element
var svg = document.getElementById("svg");

// Selection singleton (tiles for move)
var selection =  {
	// Tile element (rect)
	tile1: undefined,
	// Piece element (image)
	piece1: undefined,
	// Tile class before selection
	classBefore1: "",
	// Destination tile (rect)
	tile2: undefined,
	// Piece inn destination tile (image)
	piece2: undefined,
	// Tile class before selection
	classBefore2: ""
};

// ON/OFF option flags
var showLegalMoves = true;
var sound = true;

// WhiteOnTop flag
var whiteOnTop = false;

// Store one tile to get his size on transform translations
var tileA1 = document.getElementById("a1");

// Store first piece to put legal move circles just before it
var insertBeforeIndex = svg.childNodes.length;

// Set the flex direction according to current size
var flexRow = (window.innerWidth >= window.innerHeight);
document.getElementById("main").style.flexDirection = flexRow ? "row" : "column";

// Change the flex direction on window resize
window.addEventListener(
	"resize",
	function() {
		if (flexRow != (window.innerWidth >= window.innerHeight)) {
			flexRow = !flexRow;
			document.getElementById("main").style.flexDirection = flexRow ? "row" : "column";
		}
	}
);

// Tile Id from row/col
function tileId(row, col) {
	return LETTERS.charAt(col) + String(row + 1);
}

// Draw an empty board
function addTilesEventListener() {
	var tile;
	for (row = 0; row < 8; row++) {
		for (col = 0; col < 8; col++) {
			tile = document.getElementById(tileId(row, col));
			tile.addEventListener("click", tileClicked);
		}
	}
}
addTilesEventListener();

// Draw a piece
function drawPiece(piece, row, col) {
	var image = document.createElementNS(NS_SVG, "image");
	image.setAttributeNS(NS_XLINK, "xlink:href", "img/" + PIECE_NAMES[piece.piece] + "_" + COLOR_NAMES[piece.color] + ".svg");
	image.setAttribute("x", 12.5*col + "%");
	image.setAttribute("y", 12.5*(7 - row) + "%");
	image.setAttribute("width", "12.5%");
	image.setAttribute("height", "12.5%");
	image.setAttribute("data-color", piece.color);
	image.setAttribute("data-row", row);
	image.setAttribute("data-col", col);
	image.setAttribute("class", "piece");
	image.addEventListener("click", pieceClicked);
	svg.appendChild(image);
	// Remove tile event listener to prevent magnifier on android chrome
	document.getElementById(tileId(row, col)).removeEventListener("click", tileClicked);
}

// Draw all the pieces
function drawPieces() {
	for (row = 0; row < 8; row ++) {
		for (col = 0; col < 8; col ++) {
			if (game.board[row][col]) {
				drawPiece(game.board[row][col], row, col);
			}
		}
	}
}
drawPieces();

// Occurs when a tile is clicked
function tileClicked(event) {
	selectTile(event.target);
}

// Occurs when a piece is clicked
function pieceClicked(event) {
	var row = parseInt(event.target.getAttribute("data-row"));
	var col = parseInt(event.target.getAttribute("data-col"));
	selectTile(document.getElementById(tileId(row, col)), event.target);
}

// Select a tile
function selectTile(tile, piece) {
	if (tile == selection.tile1) {
		// Reset selection on reclick
		resetSelection();
	} else if (piece != undefined && parseInt(piece.getAttribute("data-color")) == game.colorToPlay) {
		// Ok, there is a piece to move here
		resetSelection();
		// Store the tile and his piece
		selection.tile1 = tile;
		selection.piece1 = piece;
		selection.classBefore1 = tile.getAttribute("class");
		//  Add the tile-selected class style
		tile.setAttribute("class", selection.classBefore1 + " tile-selected");
		// Highlight the legal moves
		if (showLegalMoves) showLegalMovesForTile(tile);
	} else if (selection.tile1 != undefined) {
		// Ok the first tile was selected and the second tile is not of the same color
		selection.tile2 = tile;
		selection.piece2 = piece;
		selection.classBefore2 = tile.getAttribute("class");
		//  Add the tile-selected class style
		tile.setAttribute("class", selection.classBefore2 + " tile2-selected");
		// Check 
		var move = checkMove();
		if (move) playMove(move);
		// Reset
		resetSelection();
	}
}

// Reset selection
function resetSelection() {
	hideLegalMoves();
	if (selection.tile1) {
		selection.tile1.setAttribute("class", selection.classBefore1);
		selection.tile1 = undefined;
		selection.piece1 = undefined;
		selection.classBefore1 = "";
		if (selection.tile2) {
			selection.tile2.setAttribute("class", selection.classBefore2);
			selection.tile2 = undefined;
			selection.piece2 = undefined;
			selection.classBefore2 = "";
		}
	}
}

// Reset selection on side clicks
document.getElementById("pan-side1").addEventListener("click", resetSelection);
document.getElementById("pan-side2").addEventListener("click", resetSelection);

// Check if the move is legal
function checkMove() {
	var move = getLegalMove(
		parseInt(selection.tile1.getAttribute("data-row")),
		parseInt(selection.tile1.getAttribute("data-col")),
		parseInt(selection.tile2.getAttribute("data-row")),
		parseInt(selection.tile2.getAttribute("data-col"))
		);
	if (sound) {
		if (move) {
			audioGood.play();
		} else {
			audioBad.play();
		}
	}
	return move;
}

// Play the move
function playMove(move) {
	// Remove captured piece if any
	if (selection.piece2) svg.removeChild(selection.piece2);
	// Get destination coords
	var row2 = parseInt(selection.tile2.getAttribute("data-row"));
	var col2 = parseInt(selection.tile2.getAttribute("data-col"));
	// Move piece (image)
	selection.piece1.setAttribute("x", 12.5*col2 + "%");
	selection.piece1.setAttribute("y", 12.5*(7 - row2) + "%");
	// Change piece coords attributes
	selection.piece1.setAttribute("data-row", row2);
	selection.piece1.setAttribute("data-col", col2);
	// If ahite are on top transformation needs to be updated
	if (whiteOnTop) {
		var w = selection.piece1.width.baseVal.value;
		var h = selection.piece1.height.baseVal.value;
		selection.piece1.setAttribute("transform", "translate(" + (((col2*2)+1) * w) + " " + ((((7 - row2)*2)+1) * h) + ") rotate(180)");
	}
	// Apply move
	play(move);
	// Swap color to play <div>
	document.getElementById("colorToPlay").setAttribute("class", "token " + COLOR_NAMES[game.colorToPlay]);
	// Deals with event listner for chrome android
	selection.tile1.addEventListener("click", tileClicked);
	selection.tile2.removeEventListener("click", tileClicked);
}

// Toggle Show Legal moves ON/OFF
function toggleShowLegalMoves() {
	showLegalMoves = !showLegalMoves;
	document.getElementById("toggleShowLegalMoves").setAttribute("class", "token " + (showLegalMoves ? "ON" : "OFF"));
}
document.getElementById("toggleShowLegalMoves").addEventListener("click", toggleShowLegalMoves);

// Toggle sound ON/OFF
function toggleSound() {
	sound = !sound;
	document.getElementById("toggleSound").setAttribute("class", "token " + (sound ? "ON" : "OFF"));
}
document.getElementById("toggleSound").addEventListener("click", toggleSound);

// Highlight legal moves for tile
function showLegalMovesForTile(tile) {
	var moves = getMovesForTile(game.colorToPlay, parseInt(tile.getAttribute("data-row")), parseInt(tile.getAttribute("data-col")));
	for (m=0; m<moves.length; m++) {
		c = document.createElementNS(NS_SVG, "circle");
		c.setAttribute("cx", String(moves[m].col2*12.5+6.25) + "%");
		c.setAttribute("cy", String((7 - moves[m].row2)*12.5+6.25) + "%");
		if (moves[m].capture) {
			c.setAttribute("r", "4%");
			c.setAttribute("class", "legal red");
		} else {
			c.setAttribute("r", "2%");
			c.setAttribute("class", "legal green");
		}
		svg.insertBefore(c, svg.childNodes[insertBeforeIndex]);
	}
}

// Hide the legal moves highlight circles
function hideLegalMoves() {
	var elements = document.getElementsByClassName("legal");
	while (elements.length > 0) {
		svg.removeChild(elements[0]);
	}
}

// Rotate board to put black at bottom
function rotateBoard() {
	// Swap white on top flag
	whiteOnTop = !whiteOnTop;
	if (whiteOnTop) {
		// Rotate board
		svg.setAttribute("class", "rotate180");
		// Rotate pieces
		updateTransform();
		// Add event listner so the transformation is updated on resize (since it used pixel translation)
		window.addEventListener("resize", updateTransform);
	} else {
		// Remove event listner ...
		window.removeEventListener("resize", updateTransform);
		// Un-rotate board
		svg.setAttribute("class", "");
		// Un-rotate pieces
		var pieces = document.getElementsByClassName("piece");
		for (i=0; i<pieces.length; i++) {
			pieces[i].removeAttribute("transform");
		}
	}
}
document.getElementById("rotateBoard").addEventListener("click", rotateBoard);

// Rotate each piece by 180°
function updateTransform() {
	window.setTimeout( // Without time out window is resized before tiles get their real size
		function() {
			var w = tileA1.width.baseVal.value;
			var h = tileA1.height.baseVal.value;
			var row, col;
			var pieces = document.getElementsByClassName("piece");
			for (i=0; i<pieces.length; i++) {
				row = parseInt(pieces[i].getAttribute("data-row"));
				col = parseInt(pieces[i].getAttribute("data-col"));
				pieces[i].setAttribute("transform", "translate(" + (((col*2)+1) * w) + " " + ((((7 - row)*2)+1) * h) + ") rotate(180)"); // Va comprendre ?
			}
		},
		1
	);
}
