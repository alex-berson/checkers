let board;
let empty = 0;
let black = 1;
let white = -1;
let player = black;
let multiJump = false;

const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.trunc(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]]; 
    }

    return array;
}

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size'));
    let boardSize = Math.ceil(minSide * cssBoardSize / 8) * 8;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const initBoard = () => {

    board = [[0, -1, 0, -1, 0, -1, 0, -1],
             [-1, 0, -1, 0, -1, 0, -1, 0],
             [0, -1, 0, -1, 0, -1, 0, -1],
             [0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0],
             [1, 0, 1, 0, 1, 0, 1, 0],
             [0, 1, 0, 1, 0, 1, 0, 1],
             [1, 0, 1, 0, 1, 0, 1, 0]];
}

const fillBoard = () => {

    let pieces = document.querySelectorAll('.piece');

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] == white) pieces[i * 8 + j].classList.add('white');
            if (board[i][j] == black) pieces[i * 8 + j].classList.add('black');
        }
    }
}

const canMove = (board, r, c) => {

    let color = Math.sign(board[r][c]);

    const checkMove = (r, c) => c >= 0 && c <= 7 && r >= 0 && r <= 7 && board[r][c] == empty;
    
    if (checkMove(r + color * -1, c - 1) || checkMove(r + color * -1, c + 1)) return true;
    if (Math.abs(board[r][c]) == 2 && (checkMove(r + color, c - 1) || checkMove(r + color, c + 1))) return true;

    return false;
}

const canJump = (board, r, c) => {

    let color = Math.sign(board[r][c]);

    const checkJump = (r1, c1, r2, c2) => c1 >= 0 && c1 <= 7 && r1 >= 0 && r1 <= 7 && c2 >= 0 && c2 <= 7 && board[r1][c1] == empty && Math.sign(board[r2][c2]) == -color;

    if (checkJump(r + color * -2, c - 2, r + color * -1, c - 1) || checkJump(r + color * -2, c + 2, r + color * -1, c + 1)) return true;
    if (Math.abs(board[r][c]) == 2 && (checkJump(r + color * 2, c - 2, r + color, c - 1) || checkJump(r + color * 2, c + 2, r + color, c + 1))) return true;

    return false;
}

// const canJump = (board, r, c) => {

//     let color = Math.sign(board[r][c]);

//     if (c - 2 >= 0 && r + color * (-2) >= 0 && r + color * (-2) <= 7 && board[r + color * (-2)][c - 2] == empty && board[r + color * (-1)][c - 1] == -color) return true;
//     if (c + 2 <= 7 && r + color * (-2) >= 0 && r + color * (-2) <= 7 && board[r + color * (-2)][c + 2] == empty && board[r + color * (-1)][c + 1] == -color) return true;

//     if (Math.abs(board[r][c]) == 1) return false;

//     if (c - 2 >= 0 && r + color * 2 >= 0 && r + color * 2 <= 7 && board[r + color * 2][c - 2] == empty && board[r + color][c - 1] == -color) return true;
//     if (c + 2 <= 7 && r + color * 2 >= 0 && r + color * 2 <= 7 && board[r + color * 2][c + 2] == empty && board[r + color][c + 1] == -color) return true;

//     return false;
// }

// const canMove = (board,r,c) => {

//     let color = Math.sign(board[r][c]);

//     if (c - 1 >= 0 && r + color * (-1) >= 0 && r + color * (-1) <= 7 && board[r + color * (-1)][c - 1] == empty) return true;
//     if (c + 1 <= 7 && r + color * (-1) >= 0 && r + color * (-1) <= 7 && board[r + color * (-1)][c + 1] == empty) return true;

//     if (Math.abs(board[r][c]) == 1) return false;

//     if (c - 1 >= 0 && r + color >= 0 && r + color <= 7 && board[r + color][c - 1] == empty) return true;
//     if (c + 1 <= 7 && r + color >= 0 && r + color <= 7 && board[r + color][c + 1] == empty) return true;

//     return false;
// }

const jumpsAvailable = (board) => {

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (Math.sign(board[r][c]) == player && canJump(board, r, c)) return true;
        }
    }

    return false;
}

const validMove = (board,r,c,r2,c2) => {

    let color = board[r][c];

    if (Math.abs(color) == 2) return Math.abs(r2 - r) == 1 && Math.abs(c2 - c) == 1
    
    return r2 - r == color * (-1) && Math.abs(c2 - c) == 1;
};

// const makeMove = (board,r,c,r2,c2) => {

//     board[r2][c2] = board[r][c];
//     board[r][c] = 0;

//     if ((r2 == 0 || r2 == 7) && Math.abs(board[r2][c2]) == 1) board[r2][c2] *= 2;
// }

const validJump = (board,r,c,r2,c2) =>  {

    let color = board[r][c];

    if (Math.sign(board[Math.min(r, r2) + 1][Math.min(c, c2) + 1]) != -Math.sign(color)) return false;
    if (Math.abs(color) == 2) return Math.abs(r2 - r) == 2 && Math.abs(c2 - c) == 2; 
    
    return r2 - r == color * (-1) * 2 && Math.abs(c2 - c) == 2;
}


const makeMove = (board,r,c,r2,c2) => {

    let king = false;
    board[r2][c2] = board[r][c];
    board[r][c] = 0;

    if (Math.abs(r2 - r) == 2) board[Math.min(r, r2) + 1][Math.min(c, c2) + 1] = 0;

    if ((r2 == 0 || r2 == 7) && Math.abs(board[r2][c2]) == 1) {
        board[r2][c2] *= 2;
        king = true;
    }

    return king;
}

const win = (board) => {

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (Math.sign(board[r][c]) == -player && (canJump(board, r, c) || canMove(board, r, c))) return false;
        }
    }

    return true;
}

const availableMoves = (board) => {

    const checkMove = (r, c) => c >= 0 && c <= 7 && r >= 0 && r <= 7 && board[r][c] == empty;

    let moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            let color = Math.sign(board[r][c]);

            if (color != player) continue;
            if (checkMove(r + color * -1, c - 1)) moves.push([r,c,r + color * -1,c - 1]);
            if (checkMove(r + color * -1, c + 1)) moves.push([r,c,r + color * -1,c + 1]);
            if (Math.abs(board[r][c]) != 2) continue;
            if (checkMove(r + color, c - 1)) moves.push([r,c,r + color,c - 1]);
            if (checkMove(r + color, c + 1)) moves.push([r,c,r + color,c + 1]);
        }
    }

    return moves;
}

const availableJumps = (board) => {

    const checkJump = (color,r1, c1, r2, c2) => c1 >= 0 && c1 <= 7 && r1 >= 0 && r1 <= 7 && c2 >= 0 && c2 <= 7 && board[r1][c1] == empty && Math.sign(board[r2][c2]) == -color;

    let jumps = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            let color = Math.sign(board[r][c]);

            if (color != player) continue;
            if (checkJump(color,r + color * -2, c - 2, r + color * -1, c - 1)) jumps.push([r,c,r + color * -2,c - 2]);
            if (checkJump(color,r + color * -2, c + 2, r + color * -1, c + 1)) jumps.push([r,c,r + color * -2,c + 2]);
            if (Math.abs(board[r][c]) != 2) continue;
            if (checkJump(color,r + color * 2, c - 2, r + color, c - 1)) jumps.push([r,c,r + color * 2,c - 2]);
            if (checkJump(color,r + color * 2, c + 2, r + color, c + 1)) jumps.push([r,c,r + color * 2,c + 2]);
        }
    }

    return jumps;
}

const randomAI = (board, r, c) => {

    let jumps = availableJumps(board);
    let moves = jumps.length > 0 ? jumps : availableMoves(board);

    if (r != -1) {

        shuffle(moves);

        for (let move of moves) {
            if (move[0] == r, move[1] == c) return move;
        }
    }

    return moves[Math.trunc(Math.random() * moves.length)];
}

const aiMove = (r = -1, c = -1) => {

    let [r1,c1,r2,c2] = randomAI(board, r, c);

    let king = makeMove(board,r1,c1,r2,c2);

    movePiece(r1,c1,r2,c2);

    if (Math.abs(r2 - r1) == 2 && canJump(board,r2,c2) && !king) {
        setTimeout(aiMove, 500, r2, c2);
        return;
    }

    player = -player;

    enableTouch();
}


const movePiece = (r,c,r2,c2) => {

    let pieces = document.querySelectorAll('.piece');
    let color = pieces[r * 8 + c].classList.contains('white') ? 'white' : 'black';
    let opponent = color == 'white' ? 'black' : 'white';

    pieces[r * 8 + c].classList.remove(color, 'king');
    pieces[r2 * 8 + c2].classList.add(color);

    if (Math.abs(board[r2][c2]) == 2) pieces[r2 * 8 + c2].classList.add('king');

    if (Math.abs(r2 - r) == 2) {
        pieces[(Math.min(r, r2) + 1) * 8 + Math.min(c, c2) + 1].classList.remove(opponent, 'king');
    }
}

const select = (e) => {

    let square = e.currentTarget;
    let squares = document.querySelectorAll('.square');
    let opponent = -player;
    let i = [...squares].indexOf(square);
    let r = Math.trunc(i / 8);
    let c = i % 8;

    switch (Math.sign(board[r][c])) {

        case opponent:
            // squares.forEach(square => square.classList.remove('selected'));
            return;
        case player: 

            if (multiJump) return;

            squares.forEach(square => square.classList.remove('selected'));
            if (canJump(board,r,c) || canMove(board,r,c) && !jumpsAvailable(board)) square.classList.add('selected');
            return;

        case empty:

            i = [...squares].findIndex(square => square.classList.contains('selected'));

            if (i == -1) return;

            let r0 = Math.trunc(i / 8);
            let c0 = i % 8;

            if (validJump(board, r0,c0,r,c)) {
                squares.forEach(square => square.classList.remove('selected'));
                let king = makeMove(board,r0,c0,r,c);
                movePiece(r0,c0,r,c);

                if (!king && canJump(board,r,c)) {
                    squares[r * 8 + c].classList.add('selected');
                    multiJump = true;
                    return;
                }

                multiJump = false;
                player = -player;

                disableTouch();
                setTimeout(aiMove, 500);

                console.log(availableJumps(board));
                console.log(availableMoves(board));

                return;
            }

            if (jumpsAvailable(board)) return;

            if (validMove(board, r0,c0,r,c)) {
                squares.forEach(square => square.classList.remove('selected'));
                makeMove(board,r0,c0,r,c);
                movePiece(r0,c0,r,c);
                player = -player;

                disableTouch();
                setTimeout(aiMove, 500);

                console.log(availableJumps(board));
                console.log(availableMoves(board));
            }
    }
}

const enableTouch = () => {

    let squares = document.querySelectorAll('.square');

    for (let square of squares) {

        let event = touchScreen() ? 'touchstart' : 'mousedown';

        square.addEventListener(event, select);
    }
}

const disableTouch = () => {

    let squares = document.querySelectorAll('.square');

    for (let square of squares) {

        let event = touchScreen() ? 'touchstart' : 'mousedown';

        square.removeEventListener(event, select);
    }
}

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();
    let event = touchScreen() ? 'touchstart' : 'mousedown';

    document.body.addEventListener(event, preventDefault, {passive: false});
}

const init = () => {

    disableTapZoom();
    setBoardSize();
    initBoard();
    fillBoard();
    enableTouch();
    showBoard();

    console.log(availableJumps(board));
    console.log(availableMoves(board));
}

window.onload = () => document.fonts.ready.then(init());