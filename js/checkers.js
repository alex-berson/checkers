let board;
let size = 8;
let empty = 0;
let black = 1;
let white = -1;
let player = black;
let first = player;
let multiJump = false;
let aiTimer;

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

const validMove = (board,r1,c1,r2,c2) => {

    let color = board[r1][c1];

    if (board[r2][c2] != 0 || Math.abs(r2 - r1) != 1 || Math.abs(c2 - c1) != 1) return false;
    
    return Math.abs(color) == 2 ? true : r2 - r1 == color * (-1) && Math.abs(c2 - c1) == 1;
}

const validJump = (board,r1,c1,r2,c2) =>  {

    let color = board[r1][c1];

    if (board[r2][c2] != 0 || Math.abs(r2 - r1) != 2 || Math.abs(c2 - c1) != 2) return false;
    if (Math.sign(board[Math.min(r1, r2) + 1][Math.min(c1, c2) + 1]) != -Math.sign(color)) return false;

    return Math.abs(color) == 2 ? true : r2 - r1 == color * (-1) * 2 && Math.abs(c2 - c1) == 2;
}

const canMove = (board, r, c) => {

    let color = Math.sign(board[r][c]);

    const checkMove = (r, c) => r >= 0 && r < size && c >= 0 && c < size && board[r][c] == empty;
    
    if (checkMove(r + color * -1, c - 1) || checkMove(r + color * -1, c + 1)) return true;
    if (Math.abs(board[r][c]) == 2 && (checkMove(r + color, c - 1) || checkMove(r + color, c + 1))) return true;

    return false;
}

const canJump = (board, r, c) => {

    let color = Math.sign(board[r][c]);

    const checkJump = (r1, c1, r2, c2) => r1 >= 0 && r1 < size && c1 >= 0 && c1 < size && c2 >= 0 && c2 < size && board[r1][c1] == empty && Math.sign(board[r2][c2]) == -color;

    if (checkJump(r + color * -2, c - 2, r + color * -1, c - 1) || checkJump(r + color * -2, c + 2, r + color * -1, c + 1)) return true;
    if (Math.abs(board[r][c]) == 2 && (checkJump(r + color * 2, c - 2, r + color, c - 1) || checkJump(r + color * 2, c + 2, r + color, c + 1))) return true;

    return false;
}

const availableMoves = (board, player) => {

    const checkMove = (r, c) => c >= 0 && c < size && r >= 0 && r < size && board[r][c] == empty;

    let moves = [];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

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

const availableJumps = (board, player, r1, c1) => {

    const checkJump = (color,r2, c2, r0, c0) => c2 >= 0 && c2 < size && r2 >= 0 && r2 < size && c0 >= 0 && c0 < size && board[r2][c2] == empty && Math.sign(board[r0][c0]) == -color;

    let jumps = [];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            let color = Math.sign(board[r][c]);

            if (r1 != null && (r1 != r || c1 != c)) continue;
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

const makeMove = (board,r1,c1,r2,c2) => {

    let king = false;

    board[r2][c2] = board[r1][c1];
    board[r1][c1] = 0;

    if (Math.abs(r2 - r1) == 2) board[Math.min(r1, r2) + 1][Math.min(c1, c2) + 1] = 0;

    if ((r2 == 0 || r2 == size - 1) && Math.abs(board[r2][c2]) == 1) {
        board[r2][c2] *= 2;
        king = true;
    }

    return king;
}

const win = (board, player) => {

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (Math.sign(board[r][c]) == -player && (canJump(board, r, c) || canMove(board, r, c))) return false;
        }
    }

    return true;
}

const aiMove = (r = null, c = null) => {

    let timeLimit = 500;
    let [r1,c1,r2,c2] = minimax(board, Infinity, timeLimit, r, c);
    let king = makeMove(board,r1,c1,r2,c2);

    movePiece(r1,c1,r2,c2);

    if (Math.abs(r2 - r1) == 2 && canJump(board,r2,c2) && !king) {
        aiTimer = setTimeout(aiMove, 600, r2, c2);
        return;
    }

    if (win(board, player)) {
        disableReset();
        setTimeout(gameOver, 600);
        return;
    }

    player = -player;

    enableTouch();
}

const newGame = () => {

    let squares = document.querySelectorAll('.square');
    let pieces = document.querySelectorAll('.piece');
    let crowns = document.querySelectorAll('.crown');
            
    clearTimeout(aiTimer);
    disableReset();
    disableTouch();

    pieces.forEach(piece => piece.classList.add('disappear'));
    squares.forEach(square => square.classList.remove('selected'));

    document.querySelector('.board').removeEventListener('touchstart', newGame);
    document.querySelector('.board').removeEventListener('mousedown', newGame);

    crowns.forEach(crown => crown.classList.remove('zoom-crown'));

    setTimeout(() => {

        crowns.forEach(crown => crown.classList.remove('removed'));

        pieces.forEach(piece => {
            piece.removeAttribute('style');
            piece.classList.remove('white','black','king','removed');
        });

        [white, black] = [black, white];
        player = black;
        multiJump = false;

        initBoard(false);
        fillBoard();

        pieces.forEach(piece => piece.classList.remove('disappear'));

        if (board[size - 1][0] == white) {

            setTimeout(() => {
                aiMove();
                enableReset();
            }, 600);

            return;
        }

        setTimeout(() => {
            enableTouch();
            enableReset();
        }, 500);
    }, 600);
}

const resetGame = () => {

    let move = document.querySelector('.move-m');
    let timeOut = move == null ? 0 : 250;

    disableTouch();
    disableReset();
    returnPiece();
    setTimeout(newGame, timeOut);
}

const gameOver = () => {

    let crowns = document.querySelectorAll('.crown');
    let sign = first == black ? 1 : -1;

    crowns = [...crowns].filter(crown => window.getComputedStyle(crown).display != 'none');

    crowns[0.5 * player * sign + 0.5].classList.add('removed');
    crowns.forEach(crown => crown.classList.add('origin', 'zoom-crown'));

    setTimeout(() => {
        enableReset();
        document.querySelector('.board').addEventListener('touchstart', newGame);
        document.querySelector('.board').addEventListener('mousedown', newGame);
    }, 500);
}

const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
}

const init = () => {

    registerServiceWorker();
    disableTapZoom();
    setBoardSize();
    initBoard();
    fillBoard();
    enableTouch();
    enableReset();
    showBoard();
}

window.addEventListener('load', () => document.fonts.ready.then(init));