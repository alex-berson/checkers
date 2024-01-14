let board;
let empty = 0;
let black = 1;
let white = -1;
let first = player = black;
let multiJump = false;
let moves = []; //
let auto = false; //

const showBoard = () => document.body.style.opacity = 1;

// const touchScreen = () => matchMedia('(hover: none)').matches;

const timeOver = (startTime, timeLimit) => Date.now() - startTime >= timeLimit;

const chebyshevDist = (r1, c1, r2, c2) => Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));

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
    //          [0, 0, 0, 0, 0, -2, 0, 0],
    //          [0, 0, 0, 0, 0, 0, 0, 0],
    //          [0, 0, 0, -2, 0, 0, 0, 0],
    //          [0, 0, 2, 0, 0, 0, 0, 0],
    //          [0, 0, 0, 0, 0, 0, 0, 0],
    //          [0, 0, 0, 0, 0, 0, 0, 0]];
}

const fillBoard = () => {

    let i = 0;
    let places = document.querySelectorAll('.place');
    let pieces = document.querySelectorAll('.piece');
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            if (board[r][c] == 0) continue;

            let color = board[r][c] == black ? 'black' : 'white';
            // let color = Math.sign(board[r][c]) == black ? 'black' : 'white';

            let rectPiece = pieces[i].getBoundingClientRect();
            let rectPlace = places[r * 8 + c].getBoundingClientRect();
            let offsetLeft =  rectPlace.left - rectPiece.left;
            let offsetTop =  rectPlace.top - rectPiece.top;

            pieces[i].classList.add(color);

            // if (Math.abs(board[r][c]) == 2) pieces[i].classList.add('king'); //

            pieces[i].dataset.r = r;
            pieces[i].dataset.c = c;
            pieces[i].style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;

            i++;
        }
    }

    // for (piece of pieces) {
    //     if (!piece.classList.contains('white') && !piece.classList.contains('black')) {
    //         piece.classList.add('removed');
    //     }
    // }
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

//     if (c - 2 >= 0 && r + color * (-2) >= 0 && r + color * (-2) <= 7 && board[r + color * (-2)][c - 2] == empty && Math.sign(board[r + color * (-1)][c - 1]) == -color) return true;
//     if (c + 2 <= 7 && r + color * (-2) >= 0 && r + color * (-2) <= 7 && board[r + color * (-2)][c + 2] == empty && Math.sign(board[r + color * (-1)][c + 1]) == -color) return true;

//     if (Math.abs(board[r][c]) == 1) return false;

//     if (c - 2 >= 0 && r + color * 2 >= 0 && r + color * 2 <= 7 && board[r + color * 2][c - 2] == empty && Math.sign(board[r + color][c - 1]) == -color) return true;
//     if (c + 2 <= 7 && r + color * 2 >= 0 && r + color * 2 <= 7 && board[r + color * 2][c + 2] == empty && Math.sign(board[r + color][c + 1]) == -color) return true;

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

// const jumpsAvailable = (board) => {

//     for (let r = 0; r < 8; r++) {
//         for (let c = 0; c < 8; c++) {
//             if (Math.sign(board[r][c]) == player && canJump(board, r, c)) return true;
//         }
//     }

//     return false;
// }

// const movesAvailable = (board) => {

//     let pieces = [];

//     for (let r = 0; r < 8; r++) {
//         for (let c = 0; c < 8; c++) {
//             if (Math.sign(board[r][c]) == player && canMove(board, r, c)) {    
//                 pieces.push([r, c]);
//             }
//         }
//     }

//     return pieces;
// }

const jumpsAvailable = (board) => {

    let pieces = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (Math.sign(board[r][c]) == player && canJump(board, r, c)) {    
                pieces.push([r, c]);
            }
        }
    }

    return pieces;
}

const validMove = (board,r,c,r2,c2) => {

    let color = board[r][c];

    if (board[r2][c2] != 0 || Math.abs(r2 - r) != 1 || Math.abs(c2 - c) != 1) return false;
    // if (Math.abs(color) == 2) return Math.abs(r2 - r) == 1 && Math.abs(c2 - c) == 1
    
    // return r2 - r == color * (-1) && Math.abs(c2 - c) == 1;

    return Math.abs(color) == 2 ? true : r2 - r == color * (-1) && Math.abs(c2 - c) == 1;
}

const validJump = (board,r,c,r2,c2) =>  {

    let color = board[r][c];

    if (board[r2][c2] != 0 || Math.abs(r2 - r) != 2 || Math.abs(c2 - c) != 2) return false;
    if (Math.sign(board[Math.min(r, r2) + 1][Math.min(c, c2) + 1]) != -Math.sign(color)) return false;
    // if (Math.abs(color) == 2) return Math.abs(r2 - r) == 2 && Math.abs(c2 - c) == 2; 
    // if (Math.abs(color) == 2) return true;
    
    // return r2 - r == color * (-1) * 2 && Math.abs(c2 - c) == 2;

    return Math.abs(color) == 2 ? true : r2 - r == color * (-1) * 2 && Math.abs(c2 - c) == 2;
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
    // let numPlMoves = 0;
    // let numOppMoves = 0;
    let playerPieces = [];
    let opponentPieces = [];
    // let allKings = true;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            if (board[r][c] == 0) continue;

            let sign = Math.sign(board[r][c]) * player;

             // score += board[r][c] * player * 10;

            // if (Math.abs(board[r][c]) == 1) allKings = false;

            // sign > 0 ? numPlMoves++ : numOppMoves++; 

            // if (sign > 0 && Math.abs(board[r][c] == 2)) plMoves.push([r, c]);

            // if (sign < 0 && Math.abs(board[r][c] == 2)) oppMoves.push([r, c]);


            sign > 0 ? playerPieces.push([r, c]) : opponentPieces.push([r, c]); 


            // if (player == 1) {
            //     score += (Math.abs(board[r][c]) * 5 + 5) * sign;
            //     continue;
            // }

            // if (board[r][c] == -1 && r <= 3 || board[r][c] == 1 && r >= 4) score += sign * 5;
            // if (board[r][c] == -1 && r >= 4 || board[r][c] == 1 && r <= 3) score += sign * 7;
            // if (Math.abs(board[r][c]) == 2) score += sign * 10;

            // if (board[r][c] == -1) score += sign * (6 + r) * 100;
            // if (board[r][c] == 1) score += sign * (6 + (7 - r)) * 100;
            // if (Math.abs(board[r][c]) == 2) score += sign * 14 * 100;

            // score += board[r][c] * player * 500;

            if (board[r][c] == -1) score += sign  * 500 + r;
            if (board[r][c] == 1) score += sign * 500 + (7 - r);
            if (Math.abs(board[r][c]) == 2) score += sign * 1000;

            // if (Math.abs(board[r][c]) == 1) score += sign * 500;
            // if (Math.abs(board[r][c]) == 2) score += sign * 750;

            // if (c == 0 && board[r][c] == -1)  score += sign * 4;
            // if (c == 7 && board[r][c] == 1)  score += sign * 4;

            // if (r >= 3 && r <= 4 && c >= 2 && c <= 5) score += sign * 2.5;
            // if (r >= 3 && r <= 4 && (c < 2 || c > 5)) score += sign * 0.5;
        }
    }

    // if (!allKings) return score;

    if (playerPieces.length > 5 && opponentPieces.length > 5) return score;

    // if (numPlMoves > 5 && numOppMoves > 5) return score;

    let distance = 0;

    for (let [r1, c1] of playerPieces) {
        for (let [r2, c2] of opponentPieces) {

            // let [r1, c1] = pieceP;
            // let [r2, c2] = pieceO;

            // if (r1 == r2 && c1 == c2 || Math.abs(board[r1, c1]) == 1 || Math.abs(board[r2, c2]) == 1) continue;

            if (r1 == r2 && c1 == c2) continue;

            distance += chebyshevDist(r1, c1, r2, c2);
        }
    }
 
    // score += plus.length >= minus.length ? -distance : distance;

    score += playerPieces.length >= opponentPieces.length ? -distance : distance;

    return score;
}

const alphabeta = (board, depth, alpha, beta, maximizingPlayer, startTime, timeLimit, init, r, c, initCol) => {

    if (depth <= 0 && r == null) return [null, eval(board)];
    if (timeOver(startTime, timeLimit)) return [null, null];

    if (maximizingPlayer) {
        
        let bestMove, bestScore = -Infinity;
        let jumps = availableJumps(board, player, r, c);
        let moves = jumps.length > 0 ? jumps : availableMoves(board, player);

        if (moves.length == 0) return [null, -1000000];
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

        let bestMove, bestScore = Infinity;
        let jumps = availableJumps(board, -player, r, c);
        let moves = jumps.length > 0 ? jumps : availableMoves(board, -player);

        if (moves.length == 0) return [null, 1000000];
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

    } while (!timeOver(startTime, timeLimit) && depth < maxDepth && Math.abs(bestScore) != 1000000);

    timeOver(startTime, timeLimit) ? console.log(depth - 1) : console.log(depth);

    // timeOver(startTime, timeLimit) ? alert(depth - 1) : alert(depth);

    do {} while (!timeOver(startTime, timeLimit));

    console.log('SCORE: ', bestScore);

    return bestMove;
}

const newGame = () => {

    let squares = document.querySelectorAll('.square');
    let pieces = document.querySelectorAll('.piece');
    let crowns = document.querySelectorAll('.draw img');
            
    // let event = touchScreen() ? 'touchstart' : 'mousedown';

    disableTouch();
    disableDraw();
    // clearHints();

    pieces.forEach(piece => piece.classList.add('disappear'));
    squares.forEach(square => square.classList.remove('selected'));
    // document.querySelector('.board').removeEventListener(event, newGame);
    document.querySelector('.board').removeEventListener('touchstart', newGame);
    document.querySelector('.board').removeEventListener('mousedown', newGame);

    crowns.forEach(crown => {
        crown.classList.remove('zoom-c');
    });

    setTimeout(() => {

        crowns.forEach(crown => crown.classList.remove('removed'));

        pieces.forEach(piece => {
            piece.removeAttribute('style');
            piece.classList.remove('white','black','king','removed');
        });

        [white, black] = [black, white];
        player = black;
        multiJump = false;

        moves = []; //

        initBoard();
        fillBoard();

        setTimeout(() => pieces.forEach(piece => piece.classList.remove('disappear')), 100);

        if (board[7][0] == white) {

            setTimeout(() => {
                aiMove();
                enableDraw();
            }, 600);

            return;
        }

        setTimeout(() => {
            enableTouch();
            enableDraw();
        }, 500);
    }, 600);
}

// const showWinner = () => {

//     let crowns = document.querySelectorAll('.draw img');
//     let sign = first == black ? 1 : -1;
//     crowns[0.5 * player * sign + 0.5].classList.add('removed');
//     crowns.forEach(crown => crown.classList.add('origin', 'zoom-c'));
// }

const gameOver = () => {

    let crowns = document.querySelectorAll('.draw img');
    let sign = first == black ? 1 : -1;
    crowns[0.5 * player * sign + 0.5].classList.add('removed');
    crowns.forEach(crown => crown.classList.add('origin', 'zoom-c'));

    setTimeout(() => {
        document.querySelector('.board').addEventListener('touchstart', newGame);
        document.querySelector('.board').addEventListener('mousedown', newGame);
    }, 500);

    // disableDraw();
}

const aiMove = (r = null, c = null) => {

    console.log(player);

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

    if (win(board, player)) {
        setTimeout(gameOver, 600);
        return;
    }

    player = -player;

    setTimeout(enableTouch, 0);

    if (auto) setTimeout(aiMove, 600); //
}

const movePiece = (r1,c1,r2,c2) => {

    let places = document.querySelectorAll('.place');
    let pieces = document.querySelectorAll('.piece');
    let i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r1 && Number(piece.dataset.c) == c1);
    let piece = pieces[i];
    let style = window.getComputedStyle(piece);
    let matrix = new DOMMatrix(style.transform);
    let rectPiece = piece.getBoundingClientRect();
    let rectPlace = places[r2 * 8 + c2].getBoundingClientRect();

    moves.push([r1,c1,r2,c2]); //

    piece.dataset.r = r2;
    piece.dataset.c = c2;

    piece.classList.add('move');


    if (Math.abs(r2 - r1) == 2) {

        piece.classList.add('zoom');

        setTimeout(() => {

            let r = Math.min(r1, r2) + 1;
            let c = Math.min(c1, c2) + 1;
            let i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r && Number(piece.dataset.c) == c);

            // pieces[i].classList.remove('black','white');

            pieces[i].classList.add('disappear');

            delete pieces[i].dataset.r;
            delete pieces[i].dataset.c;

            pieces[i].addEventListener('transitionend', e => {

                let piece = e.currentTarget;
        
                piece.classList.remove('disappear');
                piece.classList.add('removed');
        
            }, {once: true});

        }, 200)
    }

    piece.addEventListener('transitionend', e => {

        console.log('END');
    

        let piece = e.currentTarget;

        piece.classList.remove('zoom');
        piece.classList.remove('move');

        if (Math.abs(board[r2][c2]) == 2) piece.classList.add('king');

    }, {once: true});

    let offsetLeft = rectPiece.left - rectPlace.left;
    let offsetTop = rectPiece.top - rectPlace.top;

    piece.style.transform = `translate(${matrix.m41 - (offsetLeft)}px, ${matrix.m42 - (offsetTop)}px)`;
}

// const showHints = (board, r, c) => {

//     const checkJump = (r1, c1, r2, c2) => c1 >= 0 && c1 <= 7 && r1 >= 0 && r1 <= 7 && c2 >= 0 && c2 <= 7 && board[r1][c1] == empty && Math.sign(board[r2][c2]) == -player;
//     const checkMove = (r, c) => c >= 0 && c <= 7 && r >= 0 && r <= 7 && board[r][c] == empty;

//     let places = document.querySelectorAll('.hint');    
//     let color = Math.sign(board[r][c]) == black ? 'hint-b' : 'hint-w';
//     let hints = [];

//     if (checkJump(r + player * -2, c - 2, r + player * -1, c - 1)) hints.push([r + player * -2, c - 2]);
//     if (checkJump(r + player * -2, c + 2, r + player * -1, c + 1)) hints.push([r + player * -2, c + 2]);
//     if (Math.abs(board[r][c]) == 2 && checkJump(r + player * 2, c - 2, r + player, c - 1)) hints.push([r + player * 2, c - 2]);
//     if (Math.abs(board[r][c]) == 2 && checkJump(r + player * 2, c + 2, r + player, c + 1)) hints.push([r + player * 2, c + 2]);

//     console.log(hints);

//     if (hints.length != 0) {

//         hints.forEach(square => {

//             let r = square[0];
//             let c = square[1];

//             places[r * 8 + c].classList.add(color);

//         });

//         return;
//     }

//     if (checkMove(r + player * -1, c - 1)) hints.push([r + player * -1, c - 1]);
//     if (checkMove(r + player * -1, c + 1))  hints.push([r + player * -1, c + 1]);
//     if (Math.abs(board[r][c]) == 2 && checkMove(r + player, c - 1)) hints.push([r + player, c - 1]);    
//     if (Math.abs(board[r][c]) == 2 && checkMove(r + player, c + 1)) hints.push([r + player, c + 1]);

//     hints.forEach(square => {

//         let r = square[0];
//         let c = square[1];

//         places[r * 8 + c].classList.add(color);

//     }); 
// }

// const clearHints = () => {

//     let places = document.querySelectorAll('.hint');

//     places.forEach(place => place.classList.remove('hint-w', 'hint-b'));
// }

const blink = (r, c) => {

    let pieces = document.querySelectorAll('.piece');
    i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r && Number(piece.dataset.c) == c);
    
    pieces[i].classList.add('blink');

    pieces[i].addEventListener('animationend', e => {

        let piece = e.currentTarget;

        piece.classList.remove('blink');
                
    }, {once: true});
}

// const select = (e) => {

//     // let square = e.currentTarget ? e.currentTarget : e;
//     let square = e.currentTarget;
//     let squares = document.querySelectorAll('.square');
//     let jumps = jumpsAvailable(board);
//     let opponent = -player;
//     let i = [...squares].indexOf(square);
//     let r = Math.trunc(i / 8);
//     let c = i % 8;

//     switch (Math.sign(board[r][c])) {

//         case opponent:
//             console.log('OPP');
//             // squares.forEach(square => square.classList.remove('selected'));
//             break;

//         case player: 

//             console.log('PL', canMove(board,r,c));

//             if (multiJump) {

//                 let i = [...squares].findIndex(square => square.classList.contains('selected'));
//                 let [r1, c1] = [Math.trunc(i / 8), i % 8];

//                 if (r != r1 || c != c1) blink(r1, c1);
                   
//                 return;
//             }

//             // i = [...squares].findIndex(square => square.classList.contains('selected'));

//             // if (i != - 1 && r == Math.trunc(i / 8) && c == i % 8) {
//             //     squares.forEach(square => square.classList.remove('selected'));
//             //     return;
//             // }

//             if (canJump(board,r,c) || canMove(board,r,c) && jumps.length == 0) {
//                 squares.forEach(square => square.classList.remove('selected'));
//                 square.classList.add('selected');
//                 // clearHints();
//                 // showHints(board, r, c);
//                 return;
//             }

//             if (jumps.length != 0) {

//                 jumps.forEach(piece => {

//                     let [r, c] = piece;

//                     blink(r,c);
//                 });

//                 // return false;
//             }

//             // let moves = movesAvailable(board);

//             // if (moves.length != 0) {

//             //     moves.forEach(piece => {

//             //         let [r, c] = piece;

//             //         blink(r,c);
//             //     });

//             //     return;
//             // }

//             return;

//         case empty:

//             i = [...squares].findIndex(square => square.classList.contains('selected'));

//             if (i == -1) return;

//             let r0 = Math.trunc(i / 8);
//             let c0 = i % 8;

//             if (validJump(board, r0,c0,r,c)) {
//                 squares.forEach(square => square.classList.remove('selected'));
//                 let king = makeMove(board,r0,c0,r,c);
//                 // clearHints();
//                 movePiece(r0,c0,r,c);

//                 console.log(!king, canJump(board,r,c));

//                 if (!king && canJump(board,r,c)) {
//                     squares[r * 8 + c].classList.add('selected');
//                     // showHints(board, r, c);
//                     multiJump = true;
//                     return;
//                 }

//                 multiJump = false;

//                 disableTouch();

//                 if (win(board, player)) {
//                     setTimeout(gameOver, 600);
//                     return;
//                 }

//                 player = -player;

//                 setTimeout(aiMove, 600);

//                 return;
//             }

//             if (jumps.length != 0) return;

//             if (validMove(board, r0,c0,r,c)) {
//                 squares.forEach(square => square.classList.remove('selected'));
//                 makeMove(board,r0,c0,r,c);
//                 // clearHints();
//                 movePiece(r0,c0,r,c);

//                 disableTouch();

//                 if (win(board, player)) {
//                     setTimeout(gameOver, 600);
//                     return;
//                 }

//                 player = -player;

//                 setTimeout(aiMove, 600);
//             }
//     }
// }

const zoom = (piece) => {
    piece.firstChild.classList.add('zoom-m')
}

const removeZoom = (e) => {

    let piece = e.currentTarget;

    piece.firstChild.classList.remove('zoom-m')
}

const startMove = (e) => {

    // console.clear();
    console.log('START 1')


    if (document.querySelector('.move-m') != null) return;

    console.log('START 2')

    let piece = e.currentTarget;
    let r = Number(piece.dataset.r);
    let c = Number(piece.dataset.c);
    let jumps = jumpsAvailable(board);
    let squares = document.querySelectorAll('.square');

    console.log(r, c);

    if (Math.sign(board[r][c]) != player) return;

    if (multiJump) {

        let i = [...squares].findIndex(square => square.classList.contains('selected'));
        let [r1, c1] = [Math.trunc(i / 8), i % 8];

        if (r != r1 || c != c1) {
            blink(r1, c1);
            return;
        }
    }

    if (canMove(board, r, c) && jumps.length != 0 && !canJump(board,r,c)) {

        jumps.forEach(piece => {

            let [r, c] = piece;

            blink(r,c);
        });
    }

    if (!canJump(board, r, c) && (!canMove(board, r, c) || jumps.length != 0 )) return;

    squares.forEach(square => square.classList.remove('selected'));

    // if (!select(squares[r * 8 + c])) return;

    // squares[r * 8 + c].classList.add('selected');

    // zoom(piece);

    piece.classList.add('move-m');

    if (e.type == 'touchstart') {

        let n = 0;

        while (e.currentTarget != e.touches[n].target && e.currentTarget != e.touches[n].target.parentElement) n++;

        piece.dataset.x0 = piece.dataset.x = e.touches[n].clientX;
        piece.dataset.y0 = piece.dataset.y = e.touches[n].clientY;

        // piece.addEventListener('pointermove', mouseMove);

        piece.addEventListener('touchmove', touchMove);
        piece.addEventListener('touchend', endMove);
        piece.addEventListener('touchcancel', endMove);

    } else {

        piece.dataset.x0 = piece.dataset.x = e.clientX
        piece.dataset.y0 = piece.dataset.y = e.clientY

        // document.addEventListener('pointermove', mouseMove);

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', endMove);
    }
}

const touchMove = (e) => {

    let piece = e.currentTarget;
    let style = window.getComputedStyle(piece);
    let matrix = new DOMMatrix(style.transform);
    let n = 0;
    
    while (e.currentTarget != e.touches[n].target && e.currentTarget != e.touches[n].target.parentElement) n++;

    let dx = e.touches[n].clientX - piece.dataset.x;
    let dy = e.touches[n].clientY - piece.dataset.y;

    zoom(piece);

    piece.dataset.x = e.touches[n].clientX;
    piece.dataset.y = e.touches[n].clientY;

    piece.style.transform = `translate(${matrix.m41 + dx}px, ${matrix.m42 + dy}px)`;
}

const mouseMove = (e) => {

    let piece = document.querySelector('.move-m');
    let style = window.getComputedStyle(piece);
    let matrix = new DOMMatrix(style.transform);
    let dx = e.clientX - piece.dataset.x;
    let dy = e.clientY - piece.dataset.y;

    zoom(piece);

    piece.dataset.x = e.clientX;
    piece.dataset.y = e.clientY;

    piece.style.transform = `translate(${matrix.m41 + dx}px, ${matrix.m42 + dy}px)`;
}

const destSquares = (piece) => {

    let destinations = [];
    let squares = document.querySelectorAll('.square');
    let rectPiece = piece.getBoundingClientRect();
    // let ox = rectPiece.left + rectPiece.width / 2;
    // let oy = rectPiece.top + rectPiece.height / 2;

    for (let square of squares) {

        let rectSquare = square.getBoundingClientRect();

        if (rectPiece.right < rectSquare.left || rectPiece.left > rectSquare.right || rectPiece.bottom < rectSquare.top || rectPiece.top > rectSquare.bottom) continue;

        destinations.push(square);
    }

    return destinations;
}

const endMove = () => {

    let squaresEl = document.querySelectorAll('.square');
    let piece = document.querySelector('.move-m');
    let r0 = Number(piece.dataset.r);
    let c0 = Number(piece.dataset.c);
    let squares = destSquares(piece);
    let jumps = jumpsAvailable(board);

    disableTouch();

    for (let square of squares) {

        let i = [...squaresEl].indexOf(square);
        let place = square.firstChild;

        console.log(i);

        let r = Math.trunc(i / 8);
        let c = i % 8;

        if (validJump(board, r0,c0,r,c)) {
            // squaresEl.forEach(square => square.classList.remove('selected'));
            let king = makeMove(board,r0,c0,r,c);
            // clearHints();
            // movePiece(r0,c0,r,c);

            piece.dataset.r = r;
            piece.dataset.c = c;
            returnPiece(place, c0, r0);

            console.log(!king, canJump(board,r,c));

            if (!king && canJump(board,r,c)) {
                squaresEl[r * 8 + c].classList.add('selected');
                // showHints(board, r, c);
                multiJump = true;
                enableTouch();
                return;
            }

            multiJump = false;

            // disableTouch();

            if (win(board, player)) {
                setTimeout(gameOver, 600);
                return;
            }

            player = -player;

            setTimeout(aiMove, 600);

            return;
        }

        if (jumps.length != 0) continue;


        if (validMove(board, r0,c0,r,c)) {

            // squaresEl.forEach(square => square.classList.remove('selected'));
            makeMove(board,r0,c0,r,c);
            // clearHints();
            // movePiece(r0,c0,r,c);
            piece.dataset.r = r;
            piece.dataset.c = c;
            returnPiece(place);

            disableTouch();

            if (win(board, player)) {
                setTimeout(gameOver, 600);
                return;
            }

            player = -player;

            setTimeout(aiMove, 600);

            return;
        }
    }

    returnPiece();
}

const returnPiece = (place = null, c0 = null, r0 = null) => {
        
    let squares = document.querySelectorAll('.square');
    let pieces = document.querySelectorAll('.piece');
    let piece = document.querySelector('.move-m');
    let r = Number(piece.dataset.r);
    let c = Number(piece.dataset.c);

    // if (place == null) place = document.querySelectorAll('.square')[n].firstChild;

    if (place == null) setTimeout(enableTouch, 200);

    if (place == null && multiJump) squares[r * 8 + c].classList.add('selected');


    // let i = [...squares].findIndex(square => square.classList.contains('selected'));
    // let r0 = Math.trunc(i / 8);
    // let c0 = i % 8;

    // if (place) squares.forEach(square => square.classList.remove('selected'));

    place = place || document.querySelectorAll('.square')[r * 8 + c].firstChild;

    // if (place == null) {
    //     place = document.querySelectorAll('.square')[n].firstChild;
    //     peg.classList.add('return');        
    // } else {
    //     peg.classList.add('settle'); 
    // }
    
    piece.classList.add('return'); 

    let event = new Event('transitionend');
    let style = window.getComputedStyle(piece);
    let matrix = new DOMMatrix(style.transform);
    let rectPiece = piece.getBoundingClientRect();
    let rectPlace = place.getBoundingClientRect();

    piece.removeEventListener('touchmove', touchMove);
    document.removeEventListener('mousemove', mouseMove);

    piece.removeEventListener('touchend', endMove);
    piece.removeEventListener('touchcancel', endMove);
    document.removeEventListener('mouseup', endMove);

    piece.style.transform = `translate(${matrix.m41 - (rectPiece.left - rectPlace.left)}px, ${matrix.m42 - (rectPiece.top - rectPlace.top)}px)`;

    if (r0 != null && Math.abs(r - r0) == 2) {

            let r2 = Math.min(r0, r) + 1;
            let c2 = Math.min(c0, c) + 1;
            let i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r2 && Number(piece.dataset.c) == c2);

            // pieces[i].classList.remove('black','white');

            pieces[i].classList.add('disappear');

            delete pieces[i].dataset.r;
            delete pieces[i].dataset.c;

            pieces[i].addEventListener('transitionend', e => {

                let piece = e.currentTarget;
        
                piece.classList.remove('disappear');
                piece.classList.add('removed');
        
            }, {once: true});
    }

    piece.addEventListener('transitionend', e => {

        let piece = e.currentTarget;

        piece.classList.remove('return', 'move-m');

        if (Math.abs(board[r][c]) == 2) piece.classList.add('king');
                    
    }, {once: true});

    if (piece.dataset.x0 == piece.dataset.x && piece.dataset.y0 == piece.dataset.y) {
        piece.dispatchEvent(event);
        squares[r * 8 + c].classList.add('selected');
    }
}

const selectSquare = (e) => {

    let square = e.currentTarget;
    let squares = document.querySelectorAll('.square');
    let jumps = jumpsAvailable(board);
    let i = [...squares].indexOf(square);
    let r = Math.trunc(i / 8);
    let c = i % 8;

    i = [...squares].findIndex(square => square.classList.contains('selected'));

    if (i == -1) return;

    let [r0, c0] = [Math.trunc(i / 8), i % 8];

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

        disableTouch();

        if (win(board, player)) {
            setTimeout(gameOver, 600);
            return;
        }

        player = -player;

        setTimeout(aiMove, 600);

        return;
    }

    if (jumps.length != 0) return;

    if (validMove(board, r0,c0,r,c)) {
        squares.forEach(square => square.classList.remove('selected'));
        makeMove(board,r0,c0,r,c);
        movePiece(r0,c0,r,c);

        disableTouch();

        if (win(board, player)) {
            setTimeout(gameOver, 600);
            return;
        }

        player = -player;

        setTimeout(aiMove, 600);
    }

}

const enableDraw = () => {

    let draw = document.querySelector('.draw');
    // let event = touchScreen() ? 'touchstart' : 'mousedown';

    draw.classList.remove('disable');
    // draw.addEventListener(event, newGame);

    draw.addEventListener('touchstart', newGame);
    draw.addEventListener('mousedown', newGame);
}

const disableDraw = () => {

    let draw = document.querySelector('.draw');
    // let event = touchScreen() ? 'touchstart' : 'mousedown';

    // draw.classList.add('disable');
    // draw.removeEventListener(event, newGame);

    draw.removeEventListener('touchstart', newGame);
    draw.removeEventListener('mousedown', newGame);
}

// const enableTouch = () => {

//     let squares = document.querySelectorAll('.square');
//     // let event = touchScreen() ? 'touchstart' : 'mousedown';

//     // squares.forEach(square => square.addEventListener(event, select));

//     squares.forEach(square => {
//         square.addEventListener('touchstart', select);
//         square.addEventListener('mousedown', select);    
//     });
// }

// const disableTouch = () => {

//     let squares = document.querySelectorAll('.square');
//     // let event = touchScreen() ? 'touchstart' : 'mousedown';

//     // squares.forEach(square => square.removeEventListener(event, select));

//     squares.forEach(square => {
//         square.removeEventListener('touchstart', select);
//         square.removeEventListener('mousedown', select);    
//     });
// }

const enableTouch = () => {

    let pieces = document.querySelectorAll('.piece');
    let squares = document.querySelectorAll('.square');

    pieces.forEach(piece => {
        piece.addEventListener('touchstart', startMove);
        piece.addEventListener('touchend', removeZoom);
        piece.addEventListener('mousedown', startMove);
        piece.addEventListener('mouseup', removeZoom);
    });

    squares.forEach(square => {
        square.addEventListener('touchstart', selectSquare);
        square.addEventListener('mousedown', selectSquare);    
    });
}

const disableTouch = () => {

    let pieces = document.querySelectorAll('.piece');
    let squares = document.querySelectorAll('.square');

    pieces.forEach(piece => {
        piece.removeEventListener('touchstart', startMove);
        piece.removeEventListener('touchend', removeZoom);
        piece.removeEventListener('mousedown', startMove);
        piece.removeEventListener('mouseup', removeZoom);
    });

    squares.forEach(square => {
        square.removeEventListener('touchstart', selectSquare);
        square.removeEventListener('mousedown', selectSquare);    
    });
}

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();
    // let event = touchScreen() ? 'touchstart' : 'mousedown';

    // document.body.addEventListener(event, preventDefault, {passive: false});

    document.addEventListener('touchstart', preventDefault, {passive: false});
    document.addEventListener('mousedown', preventDefault, {passive: false});
}


const crown = () => {

    setTimeout(() => {

        let winner = white;

        let crowns = document.querySelectorAll('.draw img');

        crowns[0.5 * winner + 0.5].classList.add('removed');

        crowns.forEach(crown => crown.classList.add('zoom-c', 'origin'));

        setTimeout(() => {
    
            let crowns = document.querySelectorAll('.draw img');
                
            crowns.forEach(crown => {
                
                crown.classList.remove('zoom-c');

                crown.addEventListener('transitionend', e => {

                    let crown = e.currentTarget;
            
                    crown.classList.remove('removed');
            
                }, {once: true});

            });
    
        }, 1000);

    }, 2000);
}

const init = () => {

    disableTapZoom();
    setBoardSize();
    initBoard();
    fillBoard();
    enableTouch();
    enableDraw();
    showBoard();

    if (auto) setTimeout(aiMove, 600); //

    // setTimeout(aiMove, 600); //

    // crown();
}

window.addEventListener('load', () => document.fonts.ready.then(init));