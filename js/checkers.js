let board;
let empty = 0;
let black = 1;
let white = -1;
let player = black;

const touchScreen = () => matchMedia('(hover: none)').matches;

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

const validMove = (color,r,c,r2,c2) => r2 - r == color * (-1) && Math.abs(c2 - c) == 1;

const validJump = (color,r,c,r2,c2) =>  r2 - r == color * (-1) * 2 && Math.abs(c2 - c) == 2;

const makeMove = (r,c,r2,c2) => {

    board[r2][c2] = board[r][c];
    board[r][c] = 0;
}

const makeJump = (r,c,r2,c2) => {

    board[r2][c2] = board[r][c];
    board[r][c] = 0;
    board[Math.min(r, r2) + 1][Math.min(c, c2) + 1] = 0
}

const movePiece = (r,c,r2,c2) => {

    let pieces = document.querySelectorAll('.piece');
    let color = pieces[r * 8 + c].classList.contains('white') ? 'white' : 'black';
    let opponent = color == 'white' ? 'black' : 'white';

    pieces[r * 8 + c].classList.remove(color);
    pieces[r2 * 8 + c2].classList.add(color);

    if (Math.abs(r2 - r) == 2) {
        pieces[(Math.min(r, r2) + 1) * 8 + Math.min(c, c2) + 1].classList.remove(opponent);
    }
}

const select = (e) => {

    let square = e.currentTarget;
    let squares = document.querySelectorAll('.square');
    let opponent = player == white ? black : white;
    let i = [...squares].indexOf(square);
    let r = Math.trunc(i / 8);
    let c = i % 8;

    switch (board[r][c]) {

        case opponent:
            // squares.forEach(square => square.classList.remove('selected'));
            // return;
        case player: 
            squares.forEach(square => square.classList.remove('selected'));
            square.classList.add('selected');
            return;
        case empty :

            let i = [...squares].findIndex(square => square.classList.contains('selected'));

            if (i == -1) return;

            let r0 = Math.trunc(i / 8);
            let c0 = i % 8;

            if (validMove(board[r0][c0],r0,c0,r,c)) {
                squares.forEach(square => square.classList.remove('selected'));
                makeMove(r0,c0,r,c);
                movePiece(r0,c0,r,c);
            }

            if (validJump(board[r0][c0],r0,c0,r,c)) {
                squares.forEach(square => square.classList.remove('selected'));
                makeJump(r0,c0,r,c);
                movePiece(r0,c0,r,c);
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
}

window.onload = () => document.fonts.ready.then(init());