// Piece object
function Piece(color, piece) {
	this.color = color;
	this.piece = piece;
}

// Gane singleton
var game = {
	colorToPlay : WHITE,
	canCastleKingside : [true, true],
	canCastleQueenside : [true, true],
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
	kingRow : [7, 0],
	kingCol : [4, 4],
	twoPushCol : [-1, -1]
};

// Capturable piece
var _capture;

// Move object
function Move(piece, row2, col2, row1, col1, capture, castling) {
	this.piece = piece;
	this.row1 = row1;
	this.col1 = col1;
	this.row2 = row2;
	this.col2 = col2;
	this.capture = capture;
	this.castling = castling;
}

Move.prototype.toStr = function() {
	return PIECE_ALG[this.piece] + LETTERS.charAt(this.col1) + String(this.row1 + 1) + (this.capture ? "x" : "-") + LETTERS.charAt(this.col2) + String(this.row2 + 1);
}

function getLegalMoves(color) {
	var moves = getPseudoLegalMoves(color);
	return moves;
}

function getPseudoLegalMoves(color) {
	var moves = [];
	for (row = 0; row < 8; row++) {
		for (col = 0; col < 8; col++) {
			moves = moves.concat(getMovesForTile(color, row, col));
		}
	}
	return moves;
}

function getMovesForTile(color, row, col) {
	if (!game.board[row][col]) return [];
	if (game.board[row][col].color != color) return [];
	switch (game.board[row][col].piece) {
		case PAWN:
			return getMovesForPawn(color, row, col);
		case ROOK:
			return getMovesForRook(color, row, col, ROOK);
		case BISHOP:
			return getMovesForBishop(color, row, col, BISHOP);
		case KNIGHT:
			return getMovesForKnight(color, row, col);
		case KING:
			return getMovesForKing(color, row, col);
		case QUEEN:
			return getMovesForQueen(color, row, col);
	}
}

function getMovesForPawn(color, row, col) {
	if (color == WHITE) {
		var sens = +1;
		var init_row = (row == 1);
		var prom_row = (row == 6);
		var ep_row = (row == 4);
	} else {
		var sens = -1;
		var init_row = (row == 6);
		var prom_row = (row == 1);
		var ep_row = (row == 3);
	}
	var moves = [];
	// Move one tile
	if (isEmptyTile(row + sens, col)) {
		moves.push(new Move(PAWN, row + sens, col, row, col));
		// Move two tiles
		if (init_row && !game.board[row + 2*sens][col]) {
			moves.push(new Move(PAWN, row + 2*sens, col, row, col))
		}
	}
	// Capture on left
	if (col > 0) {
		if (isCapturableTile(row + sens, col - 1, color)) {
			moves.push(new Move(PAWN, row + sens, col - 1, row, col, _capture));
		}
	}
	// Capture on right
	if (col < 7) {
		if (isCapturableTile(row + sens, col + 1, color)) {
			moves.push(new Move(PAWN, row + sens, col + 1, row, col, _capture));
		}
	}
	return moves;
}

function getMovesForRook(color, row, col, piece) {
	var moves = [];
	// To the left
	for (c = col - 1; c >= 0; c--) {
		if (!game.board[row][c]) {
			moves.push(new Move(piece, row, c, row, col));
		} else if (isCapturableTile(row, c, color)) {
			moves.push(new Move(piece, row, c, row, col, _capture));
			break;
		} else {
			break;
		}
	}
	// To the right
	for (c = col + 1; c < 8; c++) {
		if (!game.board[row][c]) {
			moves.push(new Move(piece, row, c, row, col));
		} else if (isCapturableTile(row, c, color)) {
			moves.push(new Move(piece, row, c, row, col, _capture));
			break;
		} else {
			break;
		}
	}
	// To the top
	for (r = row + 1; r < 8; r++) {
		if (!game.board[r][col]) {
			moves.push(new Move(piece, r, col, row, col));
		} else if (isCapturableTile(r, col, color)) {
			moves.push(new Move(piece, r, col, row, col, _capture));
			break;
		} else {
			break;
		}
	}
	// To the bottom
	for (r = row - 1; r >= 0; r--) {
		if (!game.board[r][col]) {
			moves.push(new Move(piece, r, col, row, col));
		} else if (isCapturableTile(r, col, color)) {
			moves.push(new Move(piece, r, col, row, col, _capture));
			break;
		} else {
			break;
		}
	}
	return moves
}

function getMovesForBishop(color, row, col, piece) {
	var moves = [];
	var r, c;
	// To Top-Right
	r = row + 1;
	c = col + 1;
	while (r < 8 && c < 8) {
		if (!game.board[r][c]) {
			moves.push(new Move(piece, r, c, row, col));
		} else if (isCapturableTile(r, c, color)) {
			moves.push(new Move(piece, r, c, row, col, _capture));
			break;
		} else {
			break;
		}
		r ++;
		c ++;
	}
	// To Top-Left
	r = row + 1;
	c = col - 1;
	while (r < 8 && c >= 0) {
		if (!game.board[r][c]) {
			moves.push(new Move(piece, r, c, row, col));
		} else if (isCapturableTile(r, c, color)) {
			moves.push(new Move(piece, r, c, row, col, _capture));
			break;
		} else {
			break;
		}
		r ++;
		c --;
	}
	// To Bottom-Left
	r = row - 1;
	c = col - 1;
	while (r >= 0 && c >= 0) {
		if (!game.board[r][c]) {
			moves.push(new Move(piece, r, c, row, col));
		} else if (isCapturableTile(r, c, color)) {
			moves.push(new Move(piece, r, c, row, col, _capture));
			break;
		} else {
			break;
		}
		r --;
		c --;
	}
	// To Bottom-Right
	r = row - 1;
	c = col + 1;
	while (r >= 0 && c < 8) {
		if (!game.board[r][c]) {
			moves.push(new Move(piece, r, c, row, col));
		} else if (isCapturableTile(r, c, color)) {
			moves.push(new Move(piece, r, c, row, col, _capture));
			break;
		} else {
			break;
		}
		r --;
		c ++;
	}
	return moves;
}

function getMovesForKnight(color, row, col) {
	var moves = [];
	for (m = 0; m < KNIGHT_MOVES.length; m ++) {
		if (isEmptyTile(row + KNIGHT_MOVES[m][0], col + KNIGHT_MOVES[m][1])) {
			moves.push(new Move(KNIGHT, row + KNIGHT_MOVES[m][0], col + KNIGHT_MOVES[m][1], row, col));
		} else if (isCapturableTile(row + KNIGHT_MOVES[m][0], col + KNIGHT_MOVES[m][1], color)) {
			moves.push(new Move(KNIGHT, row + KNIGHT_MOVES[m][0], col + KNIGHT_MOVES[m][1], row, col, _capture));
		}
	}
	return moves;
}

function getMovesForKing(color, row, col) {
	var moves = []
	for (m = 0; m < KING_MOVES.length; m++) {
		if (isEmptyTile(row + KING_MOVES[m][0], col + KING_MOVES[m][1])) {
			moves.push(new Move(KING, row + KING_MOVES[m][0], col + KING_MOVES[m][1], row, col));
		} else if (isCapturableTile(row + KING_MOVES[m][0], col + KING_MOVES[m][1], color)) {
			moves.push(new Move(KING, row + KING_MOVES[m][0], col + KING_MOVES[m][1], row, col, _capture));
		}
	}
	// Castling
	if (game.canCastleKingside[color]) {
		// King-side castling
		if (!game.board[row][5] && !game.board[row][6]) {
			if (game.board[row][7] && game.board[row][7].piece == ROOK && game.board[row][7].color == color) {
				if (!isAttackedTile(row, 5, color) && !isAttackedTile(row, 6, color)) {
					moves.push(new Move(KING, row, 6, row, 4, undefined, KING));
				}
			}
		}
	}
	if (game.canCastleQueenside[color]) {
		// Queen-side castling
		if (!game.board[row][3] && !game.board[row][2] && !game.board[row][1]) {
			if (game.board[row][0] && game.board[row][0].piece == ROOK && game.board[row][0].color == color) {
				if (!isAttackedTile(row, 3, color) && !isAttackedTile(row, 2, color)) {
					moves.push(new Move(KING, row, 2, row, 4, undefined, QUEEN));
				}
			}
		}
	}
	return moves;
}

function getMovesForQueen(color, row, col) {
	var moves = getMovesForBishop(color, row, col, QUEEN);
	moves = moves.concat(getMovesForRook(color, row, col, QUEEN));
	return moves;
}

function isEmptyTile(row, col) {
	if (row < 0) return false;
	if (col < 0) return false;
	if (row > 7) return false;
	if (col > 7) return false;
	return !game.board[row][col];
}

function isCapturableTile(row, col, color) {
	if (row < 0) return false;
	if (col < 0) return false;
	if (row > 7) return false;
	if (col > 7) return false;
	if (!game.board[row][col]) return false;
	if (game.board[row][col].color == color) return false;
	if (game.board[row][col].piece == KING) return false;
	_capture = game.board[row][col].piece;
	return true;
}

function isAttackedTile(row, col, color) {
	// Check bishop style attacks (including bishop, pawn, king and queen)
	var r, c;
	// - On top-right
	r = row + 1;
	c = col + 1;
	while (r < 8 && c < 8) {
		if (!game.board[r][c]) {
			// Nothing happens
		} else if (isAttackableTile(r, c, color)) {
			if (_capture == BISHOP) {
				return true;
			} else if (_capture == PAWN) {
				if (r == row + 1 && color == WHITE) return true;
			} else if (_capture == KING) {
				if (r == row + 1) return true;
			} else if (_capture == QUEEN) {
				return true;
			}
			break;
		} else {
			break;
		}
		r++;c++;
	}
	// - On top-left
	r = row + 1;
	c = col - 1;
	while (r < 8 && c >= 0) {
		if (!game.board[r][c]) {
			// Nothing happens
		} else if (isAttackableTile(r, c, color)) {
			if (_capture == BISHOP) {
				return true;
			} else if (_capture == PAWN) {
				if (r == row + 1 && color == WHITE) return true;
			} else if (_capture == KING) {
				if (r == row + 1) return true;
			} else if (_capture == QUEEN) {
				return true;
			}
			break;
		} else {
			break;
		}
		r++;c--;
	}
	// - On bottom-left
	r = row - 1;
	c = col - 1;
	while (r >= 0 && c >= 0) {
		if (!game.board[r][c]) {
			// Nothing happens
		} else if (isAttackableTile(r, c, color)) {
			if (_capture == BISHOP) {
				return true;
			} else if (_capture == PAWN) {
				if (r == row - 1 && color == BLACK) return true;
			} else if (_capture == KING) {
				if (r == row - 1) return true;
			} else if (_capture == QUEEN) {
				return true;
			}
			break;
		} else {
			break;
		}
		r--;c--;
	}
	// - On bottom-right
	r = row - 1;
	c = col + 1;
	while (r >= 0 && c < 8) {
		if (!game.board[r][c]) {
			// Nothing happens
		} else if (isAttackableTile(r, c, color)) {
			if (_capture == BISHOP) {
				return true;
			} else if (_capture == PAWN) {
				if (r == row - 1 && color == BLACK) return true;
			} else if (_capture == KING) {
				if (r == row - 1) return true;
			} else if (_capture == QUEEN) {
				return true;
			}
			break;
		} else {
			break;
		}
		r--;c++;
	}
	// Check rook style attacks (including rook, king and queen)
	// - On left
	for (c = col - 1; c >= 0; c--) {
	    if (!game.board[row][c]) {
	        // Nothing happens
	    } else if (isAttackableTile(row, c, color)) {
	        if (_capture == ROOK) {
	            return true;
	        } else if (_capture == KING) {
	            if (c == col - 1) return true;
	        } else if (_capture == QUEEN) {
	            return true;
	        }
	        break;
	    } else {
	        break;
	    }
	}
	// - On right
	for (c = col + 1; c < 8; c++) {
	    if (!game.board[row][c]) {
	        // Nothing happens
	    } else if (isAttackableTile(row, c, color)) {
	        if (_capture == ROOK) {
	            return true;
	        } else if (_capture == KING) {
	            if (c == col + 1) return true;
	        } else if (_capture == QUEEN) {
	            return true;
	        }
	        break;
	    } else {
	        break;
	    }
	}
	// - On top
	for (r = row + 1; r < 8; r++) {
	    if (!game.board[r][col]) {
	        // Nothing happens
	    } else if (isAttackableTile(r, col, color)) {
	        if (_capture == ROOK) {
	            return true;
	        } else if (_capture == KING) {
	            if (r == row + 1) return true;
	        } else if (_capture == QUEEN) {
	            return true;
	        }
	        break;
	    } else {
	        break;
	    }
	}
	// - On bottom
	for (r = row - 1; r >= 0; r--) {
	    if (!game.board[r][col]) {
	        // Nothing happens
	    } else if (isAttackableTile(r, col, color)) {
	        if (_capture == ROOK) {
	            return true;
	        } else if (_capture == KING) {
	            if (r == row - 1) return true;
	        } else if (_capture == QUEEN) {
	            return true;
	        }
	        break;
	    } else {
	        break;
	    }
	}
	// Check knight attack
	for (m = 0; m < KNIGHT_MOVES.length; m++) {
	    if (isCapturableTile(row + KNIGHT_MOVES[m][0], col + KNIGHT_MOVES[m][1], color)) {
	        if (_capture == KNIGHT) return true;
	    }
	}
	return false;
}

function isAttackableTile(row, col, color) {
	if (game.board[row][col].color == color) return false;
	_capture = game.board[row][col].piece;
	return true;
}

function isCheck(color) {
    return isAttackedTile(game.kingRow[color], game.kingCol[color], color);
}

function getLegalMove(row1, col1, row2, col2) {
	var legal = getLegalMoves(game.colorToPlay);
	for (m = 0; m < legal.length; m ++) {
		if (legal[m].row1 == row1 && legal[m].col1 == col1 && legal[m].row2 == row2 && legal[m].col2 == col2) return legal[m];
	}	
}

function play(move) {
	// Get color playing
	color = game.board[move.row1][move.col1].color;
	// Apply the move to the current position
	game.board[move.row2][move.col2] = game.board[move.row1][move.col1];
	game.board[move.row1][move.col1] = undefined;
	// Special moves stuff
	game.twoPushCol[color] = -1;
	switch (move.piece) {
		case KING:
			game.kingRow[color] = move.row2;
			game.kingCol[color] = move.col2;
			game.canCastleKingside[color] = false;
			game.canCastleQueenside[color] = false;
			break;
		case PAWN:
			if ((move.row1 == 1 && move.row2 == 3) || (move.row1 == 6 && move.row2 == 4)) game.twoPushCol[color] = move.col1;
			break;
		case ROOK:
			if (move.col1 == 0) {
				game.canCastleQueenside[color] = false;
			} else if (move.col1 == 7) {
				game.canCastleKingside[color] = false;
			}
			break;
	}
	// Swap color to play
	game.colorToPlay = (1 - game.colorToPlay);
}