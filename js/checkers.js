let board;
let empty = 0;
let white = -1;
let black = 1;
let player = black;
let multiJump = false;

const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const timeOver = (startTime, timeLimit) => Date.now() - startTime >= timeLimit;

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

    // board = [[0, 0, 0, 0, 0, 0, 0, 0],
    //          [0, 0, 0, 0, 0, 0, 0, 0],
    //          [0, 0, 0, -1, 0, 0, 0, 0],
    //          [0, 0, 0, 0, 0, 0, 0, 0],
    //          [0, 0, 0, 1, 0, 0, 0, 0],
    //          [0, 0, 0, 0, 1, 0, 0, 0],
    //          [0, 0, 0, 0, 0, -2, 0, 0],
    //          [0, 0, 0, 0, 0, 0, 0, 0]];    
}

const fillBoard = () => {

    let squares = [1,3,5,7,8,10,12,14,17,19,21,23,40,42,44,46,49,51,53,55,56,58,60,62];

    let places = document.querySelectorAll('.place');
    let pieces = document.querySelectorAll('.piece');
    let style = window.getComputedStyle(pieces[0]);
    let matrix = new WebKitCSSMatrix(style.transform);

    if (matrix.m41 != 0) return;

    for (let [i, n] of squares.entries()) {

        let rectPiece = pieces[i].getBoundingClientRect();
        let rectPlace = places[n].getBoundingClientRect();
        let offsetLeft =  rectPlace.left - rectPiece.left;
        let offsetTop =  rectPlace.top - rectPiece.top;
        let [r, c] = [Math.trunc(n / 8), n % 8];

        pieces[i].dataset.r = r;
        pieces[i].dataset.c = c;

        pieces[i].style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
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
}

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

const win = (board, player) => {

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (Math.sign(board[r][c]) == -player && (canJump(board, r, c) || canMove(board, r, c))) return false;
        }
    }

    return true;
}

const availableMoves = (board, player) => {

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

const availableJumps = (board, player, r0, c0) => {

    const checkJump = (color,r1, c1, r2, c2) => c1 >= 0 && c1 <= 7 && r1 >= 0 && r1 <= 7 && c2 >= 0 && c2 <= 7 && board[r1][c1] == empty && Math.sign(board[r2][c2]) == -color;

    let jumps = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            let color = Math.sign(board[r][c]);

            if (r0 != null && (r0 != r || c0 != c)) continue;
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

    let jumps = availableJumps(board, player, r, c);
    let moves = jumps.length > 0 ? jumps : availableMoves(board, player);

    return moves[Math.trunc(Math.random() * moves.length)];
}

const eval = (board) => {

    let score = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            score += board[r][c] * player * 10;
        }
    }

    return score;
}

const alphabeta = (board, depth, alpha, beta, maximizingPlayer, startTime, timeLimit, init, r, c, initCol) => {

    let bestMove;

    // if (win(board, -player)) return [null, -1000 * (depth + 1)];
    // if (win(board, player)) return [null, 1000 * (depth + 1)];
    if (win(board, -player)) return [null, -1000];
    if (win(board, player)) return [null, 1000];
    if (depth <= 0 && r == null) return [null, eval(board)];
    if (timeOver(startTime, timeLimit)) return [null, null];

    if (maximizingPlayer) {
        
        let bestScore = -Infinity;
        let jumps = availableJumps(board, player, r, c);
        let moves = jumps.length > 0 ? jumps : availableMoves(board, player);

        if (init) shuffle(moves);
        if (initCol != null) moves = [...new Set([initCol, ...moves].map(JSON.stringify))].map(JSON.parse);

        for (let move of moves) {

            let [r1, c1, r2, c2] = move;
            let tempBoard = board.map(arr => arr.slice());
            let king = makeMove(tempBoard, r1, c1, r2, c2);
            let maximizingPlayer = Math.abs(r2 - r1) == 2 && canJump(tempBoard,r2,c2) && !king;

            if (!maximizingPlayer) r2 = c2 = null;

            [_, score] = alphabeta(tempBoard, depth - 1, alpha, beta, maximizingPlayer, startTime, timeLimit, false, r2, c2, null);

            if (score > bestScore) [bestScore, bestMove] = [score, move];

            alpha = Math.max(alpha, score);

            if (alpha >= beta) break;
        }

        return [bestMove, bestScore];

    } else {

        let bestScore = Infinity;
        let jumps = availableJumps(board, -player, r, c);
        let moves = jumps.length > 0 ? jumps : availableMoves(board, -player);

        if (init) shuffle(moves);
        if (initCol != null) moves = [...new Set([initCol, ...moves].map(JSON.stringify))].map(JSON.parse);
        
        for (let move of moves) {

            let [r1, c1, r2, c2] = move;
            let tempBoard = board.map(arr => arr.slice());
            let king = makeMove(tempBoard, r1, c1, r2, c2);
            let maximizingPlayer = !(Math.abs(r2 - r1) == 2 && canJump(tempBoard, r2, c2) && !king);
            
            if (maximizingPlayer) r2 = c2 = null;

            [_, score] = alphabeta(tempBoard, depth - 1, alpha, beta, maximizingPlayer, startTime, timeLimit, false, r2, c2, null);
    
            if (score < bestScore) [bestScore, bestMove] = [score, move];

            beta = Math.min(beta, score);

            if (beta <= alpha) break;
        }

        return [bestMove, bestScore];
    }
}

const minimax = (board, maxDepth, timeLimit, r, c) => {

    let startTime = Date.now();
    let initCol = null;
    let bestMove, bestScore;
    let depth = 0;

    do {

        depth++;

        let [move, score] = alphabeta(board, depth, -Infinity, Infinity, true, startTime, timeLimit, true, r, c, initCol);

        if (timeOver(startTime, timeLimit)) break;

        bestMove = initCol = move;
        bestScore = score; //

    } while (!timeOver(startTime, timeLimit) && depth < maxDepth && Math.abs(score) != 1000);

    timeOver(startTime, timeLimit) ? console.log(depth - 1) : console.log(depth);

    // timeOver(startTime, timeLimit) ? alert(depth - 1) : alert(depth);

    do {} while (!timeOver(startTime, timeLimit));

    console.log('SCORE: ', bestScore);

    return bestMove;
}

const aiMove = (r = null, c = null) => {

    let timeLimit = 500;
    // let [r1,c1,r2,c2] = randomAI(board, r, c);
    let [r1,c1,r2,c2] = minimax(board, Infinity, timeLimit, r, c);
    // let [r1,c1,r2,c2] = player == black ?  minimax(board, 4, timeLimit, r, c) : minimax(board, Infinity, timeLimit, r, c);
    let king = makeMove(board,r1,c1,r2,c2);

    movePiece(r1,c1,r2,c2);

    if (Math.abs(r2 - r1) == 2 && canJump(board,r2,c2) && !king) {
        setTimeout(aiMove, 600, r2, c2);
        return;
    }

    player = -player;

    setTimeout(enableTouch, 500);

    // setTimeout(aiMove, 500);
}

const movePiece = (r1,c1,r2,c2) => {

    let places = document.querySelectorAll('.place');
    let pieces = document.querySelectorAll('.piece');
    let i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r1 && Number(piece.dataset.c) == c1);
    let piece = pieces[i];
    let style = window.getComputedStyle(piece);
    let matrix = new WebKitCSSMatrix(style.transform);
    let rectPiece = piece.getBoundingClientRect();
    let rectPlace = places[r2 * 8 + c2].getBoundingClientRect();

    piece.dataset.r = r2;
    piece.dataset.c = c2;

    piece.classList.add('move');

    setTimeout(() => {

        if (Math.abs(r2 - r1) == 2) {

            let r = Math.min(r1, r2) + 1;
            let c = Math.min(c1, c2) + 1;
            let i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r && Number(piece.dataset.c) == c);

            // pieces[i].classList.remove('black','white');

            pieces[i].classList.add('removed');

            delete pieces[i].dataset.r;
            delete pieces[i].dataset.c;
        }
    }, 200)

    piece.addEventListener('transitionend', e => {

        let piece = e.currentTarget;

        piece.classList.remove('move');

        if (Math.abs(board[r2][c2]) == 2) piece.classList.add('king');

    }, {once: true});

    piece.style.transform = `translate(${Math.round(matrix.m41 - (rectPiece.left - rectPlace.left))}px, ${Math.round(matrix.m42 - (rectPiece.top - rectPlace.top))}px)`;
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
                setTimeout(aiMove, 600);

                return;
            }

            if (jumpsAvailable(board)) return;

            if (validMove(board, r0,c0,r,c)) {
                squares.forEach(square => square.classList.remove('selected'));
                makeMove(board,r0,c0,r,c);
                movePiece(r0,c0,r,c);
                player = -player;

                disableTouch();
                setTimeout(aiMove, 600);
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
    setBoardSize();1
    initBoard();
    fillBoard();
    enableTouch();
    showBoard();

    // setTimeout(aiMove, 500);
}

window.onload = () => document.fonts.ready.then(init());