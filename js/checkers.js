let board = [[0, 2, 0, 2, 0, 2, 0, 2],
             [2, 0, 2, 0, 2, 0, 2, 0],
             [0, 2, 0, 2, 0, 2, 0, 2],
             [0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0],
             [1, 0, 1, 0, 1, 0, 1, 0],
             [0, 1, 0, 1, 0, 1, 0, 1],
             [1, 0, 1, 0, 1, 0, 1, 0]];


const evaluate = (board) => {

    let score = 0;

    for(let i = 0; i < board.length; i++) {
        for(let j = 0; j < board[i].length; j++) {
            switch(board[i][j]) {
                case 1: 
                    score += 1;
                    break;
                case 2:
                    score -= 1;
                    break;
                case 3:
                    score += 2;
                    break;
                case 4:
                    score -= 2;
            }
        }
    }

    return score;
}

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size'));
    let boardSize = Math.ceil(minSide * cssBoardSize / 8) * 8;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const init = () => {

    setBoardSize();
}

window.onload = () => document.fonts.ready.then(init());