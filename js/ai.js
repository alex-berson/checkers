const maxScore = 1e6;

const timeOver = (startTime, timeLimit) => Date.now() - startTime >= timeLimit;

const chebyshevDistance = (r1, c1, r2, c2) => Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.trunc(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]]; 
    }

    return array;
}

// const randomAI = (board, r, c) => {

//     let jumps = availableJumps(board, player, r, c);
//     let moves = jumps.length > 0 ? jumps : availableMoves(board, player);

//     return moves[Math.trunc(Math.random() * moves.length)];
// }

const evaluation = (board) => {

    let score = 0;
    let playerPieces = [];
    let opponentPieces = [];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            if (board[r][c] == 0) continue;

            let sign = Math.sign(board[r][c]) * player;

            sign > 0 ? playerPieces.push([r, c]) : opponentPieces.push([r, c]); 

            if (board[r][c] == -1) score += sign  * 500 + r;
            if (board[r][c] == 1) score += sign * 500 + (size - 1 - r);
            if (Math.abs(board[r][c]) == 2) score += sign * 1000;
        }
    }

    if (playerPieces.length > 5 && opponentPieces.length > 5) return score;

    let distance = 0;

    for (let [r1, c1] of playerPieces) {
        for (let [r2, c2] of opponentPieces) {
            
            if (r1 == r2 && c1 == c2) continue;

            distance += chebyshevDistance(r1, c1, r2, c2);
        }
    }
 
    score += playerPieces.length >= opponentPieces.length ? -distance : distance;

    return score;
}

const alphabeta = (board, depth, alpha, beta, maximizingPlayer, startTime, timeLimit, r, c, initMove, firstLevel) => {

    if (depth <= 0 && r == null) return [null, evaluation(board)];
    if (timeOver(startTime, timeLimit)) return [null, null];

    if (maximizingPlayer) {
        
        let bestMove, bestScore = -Infinity;
        let jumps = availableJumps(board, player, r, c);
        let moves = jumps.length > 0 ? jumps : availableMoves(board, player);

        if (moves.length == 0) return [null, -maxScore];
        if (firstLevel) shuffle(moves);
        if (initMove != null) moves = [...new Set([initMove, ...moves].map(JSON.stringify))].map(JSON.parse);

        for (let move of moves) {

            let [r1, c1, r2, c2] = move;
            let tempBoard = board.map(arr => arr.slice());
            let king = makeMove(tempBoard, r1, c1, r2, c2);
            let maximizingPlayer = Math.abs(r2 - r1) == 2 && canJump(tempBoard,r2,c2) && !king;

            if (!maximizingPlayer) r2 = c2 = null;

            [_, score] = alphabeta(tempBoard, depth - 1, alpha, beta, maximizingPlayer, startTime, timeLimit, r2, c2, null, false);

            if (score > bestScore) [bestScore, bestMove] = [score, move];

            alpha = Math.max(alpha, score);

            if (alpha >= beta) break;
        }

        return [bestMove, bestScore];

    } else {

        let bestMove, bestScore = Infinity;
        let jumps = availableJumps(board, -player, r, c);
        let moves = jumps.length > 0 ? jumps : availableMoves(board, -player);

        if (moves.length == 0) return [null, maxScore];
        
        for (let move of moves) {

            let [r1, c1, r2, c2] = move;
            let tempBoard = board.map(arr => arr.slice());
            let king = makeMove(tempBoard, r1, c1, r2, c2);
            let maximizingPlayer = !(Math.abs(r2 - r1) == 2 && canJump(tempBoard, r2, c2) && !king);
            
            if (maximizingPlayer) r2 = c2 = null;

            [_, score] = alphabeta(tempBoard, depth - 1, alpha, beta, maximizingPlayer, startTime, timeLimit, r2, c2, null, false);
    
            if (score < bestScore) [bestScore, bestMove] = [score, move];

            beta = Math.min(beta, score);

            if (beta <= alpha) break;
        }

        return [bestMove, bestScore];
    }
}

const minimax = (board, maxDepth, timeLimit, r, c) => {

    let startTime = Date.now();
    let initMove = null;
    let bestMove, bestScore;
    let depth = 0;

    do {

        depth++;

        let [move, score] = alphabeta(board, depth, -Infinity, Infinity, true, startTime, timeLimit, r, c, initMove, true);

        if (timeOver(startTime, timeLimit)) break;

        bestMove = initMove = move;
        bestScore = score;

    } while (!timeOver(startTime, timeLimit) && depth < maxDepth && Math.abs(bestScore) < maxScore);

    do {} while (!timeOver(startTime, timeLimit));

    return bestMove;
}