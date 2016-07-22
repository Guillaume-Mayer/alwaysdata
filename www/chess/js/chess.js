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

// Namesapce constants
const NS_SVG	= "http://www.w3.org/2000/svg";
const NS_XLINK	= "http://www.w3.org/1999/xlink"

// Letters to name columns
const LETTERS	= "abcdefgh";

function tileId(row, col) {
	return LETTERS.charAt(col) + String(row + 1);
}

// SVG Main element
var svg = document.getElementById("svg");

// Draw an empty board
function drawBoard() {
	var tile;
	for (row = 0; row < 8; row++) {
		for (col = 0; col < 8; col++) {
			tile = document.createElementNS(NS_SVG, "rect");
			tile.setAttribute("x", String(col*12.5) + "%");
			tile.setAttribute("y", String((7 - row)*12.5) + "%");
			tile.setAttribute("width", "12.5%");
			tile.setAttribute("height", "12.5%");
			tile.setAttribute("id", tileId(row, col));
			tile.setAttribute("class", (row + col) % 2 == 0 ? "tile-w": "tile-b");
			tile.setAttribute("data-row", row);
			tile.setAttribute("data-col", col);
			tile.addEventListener("click", tileClicked);
			svg.appendChild(tile);
		}
	}
}
drawBoard();

// Color constants
const BLACK = 0;
const WHITE = 1;

// Piece constants
const KING		= 0;
const QUEEN		= 1;
const ROOK		= 2;
const BISHOP	= 3;
const KNIGHT	= 4;
const PAWN		= 5;

// Names
const COLOR_NAMES = ["Black", "White"];
const PIECE_NAMES = ["King", "Queen", "Rook", "Bishop", "Knight", "Pawn"];

// Piece object
function Piece(color, piece) {
	this.color = color;
	this.piece = piece;
}


// Gane singleton
var game = {
	colorToPlay : WHITE,
	// Board map
	board : [
		[new Piece(WHITE, ROOK), new Piece(WHITE, KNIGHT), new Piece(WHITE, BISHOP), new Piece(WHITE, QUEEN), new Piece(WHITE, KING), new Piece(WHITE, BISHOP), new Piece(WHITE, KNIGHT), new Piece(WHITE, ROOK)],
		[new Piece(WHITE, PAWN), new Piece(WHITE, PAWN), new Piece(WHITE, PAWN), new Piece(WHITE, PAWN), new Piece(WHITE, PAWN), new Piece(WHITE, PAWN), new Piece(WHITE, PAWN), new Piece(WHITE, PAWN)],
		[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		[undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		[new Piece(BLACK, PAWN), new Piece(BLACK, PAWN), new Piece(BLACK, PAWN), new Piece(BLACK, PAWN), new Piece(BLACK, PAWN), new Piece(BLACK, PAWN), new Piece(BLACK, PAWN), new Piece(BLACK, PAWN)],
		[new Piece(BLACK, ROOK), new Piece(BLACK, KNIGHT), new Piece(BLACK, BISHOP), new Piece(BLACK, QUEEN), new Piece(BLACK, KING), new Piece(BLACK, BISHOP), new Piece(BLACK, KNIGHT), new Piece(BLACK, ROOK)]
	],
};

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
	image.addEventListener("click", pieceClicked);
	svg.appendChild(image);
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

// Select a tile
function selectTile(tile, piece) {
	if (piece != undefined && parseInt(piece.getAttribute("data-color")) == game.colorToPlay) {
		// Ok, there is a piece to move here
		resetSelection();
		// Store the tile and his piece
		selection.tile1 = tile;
		selection.piece1 = piece;
		selection.classBefore1 = tile.getAttribute("class");
		//  Add the tile-selected class style
		tile.setAttribute("class", selection.classBefore1 + " tile-selected");
	} else if (selection.tile1 != undefined) {
		// Ok the first tile was selected and the second tile is not of the same color
		selection.tile2 = tile;
		selection.piece2 = piece;
		selection.classBefore2 = tile.getAttribute("class");
		//  Add the tile-selected class style
		tile.setAttribute("class", selection.classBefore2 + " tile2-selected");
		// Check 
		if (checkMove()) playMove();
		// Reset
		resetSelection();
	}
}

// Reset selection
function resetSelection() {
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
document.getElementById("pan-side1").addEventListener("click", resetSelection, true);
document.getElementById("pan-side2").addEventListener("click", resetSelection, true);

// Sounds
var audioGood = new Audio("mp3/Applause.mp3");
var audioBad = new Audio("mp3/Buzzer.mp3");

// Check if the move is legal
function checkMove() {
	var audio;
	var ok = confirm("Are you sure ?");
	if (ok) {
		audioGood.play();
	} else {
		audioBad.play();
	}
	return ok
}

// Play the move
function playMove() {
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
	// Swap color to play
	game.colorToPlay = !game.colorToPlay;
}