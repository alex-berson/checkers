const showBoard = () => document.body.style.opacity = 1;

const setBoardSize = () => {

    let minSide = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;
    let cssBoardSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 100;
    let boardSize = Math.ceil(minSide * cssBoardSize / size) * size;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const fillBoard = () => {

    let i = 0;
    let places = document.querySelectorAll('.place');
    let pieces = document.querySelectorAll('.piece');
    
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            if (board[r][c] == 0) continue;

            // let color = board[r][c] == black ? 'black' : 'white';

            let color = Math.sign(board[r][c]) == black ? 'black' : 'white'; //

            let rectPiece = pieces[i].getBoundingClientRect();
            let rectPlace = places[r * size + c].getBoundingClientRect();
            let offsetLeft =  rectPlace.left - rectPiece.left;
            let offsetTop =  rectPlace.top - rectPiece.top;

            pieces[i].classList.add(color);

            if (Math.abs(board[r][c]) == 2) pieces[i].classList.add('king'); //

            pieces[i].dataset.r = r;
            pieces[i].dataset.c = c;
            pieces[i].style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;

            i++;
        }
    }
}

const movePiece = (r1,c1,r2,c2) => {

    let places = document.querySelectorAll('.place');
    let pieces = document.querySelectorAll('.piece');
    let i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r1 && Number(piece.dataset.c) == c1);
    let piece = pieces[i];
    let style = window.getComputedStyle(piece);
    let matrix = new DOMMatrix(style.transform);
    let rectPiece = piece.getBoundingClientRect();
    let rectPlace = places[r2 * size + c2].getBoundingClientRect();

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

        let piece = e.currentTarget;

        piece.classList.remove('move', 'zoom');

        if (Math.abs(board[r2][c2]) == 2) piece.classList.add('king');

    }, {once: true});

    let offsetLeft = rectPiece.left - rectPlace.left;
    let offsetTop = rectPiece.top - rectPlace.top;

    piece.style.transform = `translate(${matrix.m41 - offsetLeft}px, ${matrix.m42 - offsetTop}px)`;
}

const blink = (r, c) => {

    let pieces = document.querySelectorAll('.piece');
    i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r && Number(piece.dataset.c) == c);
    
    pieces[i].classList.add('blink');

    pieces[i].addEventListener('animationend', e => {

        let piece = e.currentTarget;

        piece.classList.remove('blink');
                
    }, {once: true});
}

const jumpsAvailable = (board) => {

    let pieces = [];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (Math.sign(board[r][c]) == player && canJump(board, r, c)) {    
                pieces.push([r, c]);
            }
        }
    }

    return pieces;
}

const startMove = (e) => {

    if (document.querySelector('.move-m') != null) return;

    let piece = e.currentTarget;
    let r = Number(piece.dataset.r);
    let c = Number(piece.dataset.c);
    let jumps = jumpsAvailable(board);
    let squares = document.querySelectorAll('.square');

    if (Math.sign(board[r][c]) != player) return;

    if (multiJump) {

        let i = [...squares].findIndex(square => square.classList.contains('selected'));
        let [r1, c1] = [Math.trunc(i / size), i % size];

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

    piece.classList.add('move-m');

    if (e.type == 'touchstart') {

        let n = 0;

        while (e.currentTarget != e.touches[n].target && e.currentTarget != e.touches[n].target.parentElement) n++;

        piece.dataset.x0 = piece.dataset.x = e.touches[n].clientX;
        piece.dataset.y0 = piece.dataset.y = e.touches[n].clientY;

        piece.addEventListener('touchmove', touchMove);
        piece.addEventListener('touchend', endMove);
        piece.addEventListener('touchcancel', endMove);

    } else {

        piece.dataset.x0 = piece.dataset.x = e.clientX
        piece.dataset.y0 = piece.dataset.y = e.clientY

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', endMove);
    }
}

const touchMove = (e) => {

    let n = 0;
    let piece = e.currentTarget;
    let style = window.getComputedStyle(piece);
    let matrix = new DOMMatrix(style.transform);
    
    while (e.currentTarget != e.touches[n].target && e.currentTarget != e.touches[n].target.parentElement) n++;

    let dx = e.touches[n].clientX - piece.dataset.x;
    let dy = e.touches[n].clientY - piece.dataset.y;

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

    piece.dataset.x = e.clientX;
    piece.dataset.y = e.clientY;

    piece.style.transform = `translate(${matrix.m41 + dx}px, ${matrix.m42 + dy}px)`;
}

const destSquares = (piece) => {

    let destinations = [];
    let squares = document.querySelectorAll('.square');
    let rectPiece = piece.getBoundingClientRect();

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
    let r1 = Number(piece.dataset.r);
    let c1 = Number(piece.dataset.c);
    let squares = destSquares(piece);
    let jumps = jumpsAvailable(board);

    disableTouch();

    for (let square of squares) {

        let i = [...squaresEl].indexOf(square);
        let place = square.firstChild;
        let [r2, c2] = [Math.trunc(i / size), i % size];

        if (validJump(board,r1,c1,r2,c2)) {

            let king = makeMove(board,r1,c1,r2,c2);

            piece.dataset.r = r2;
            piece.dataset.c = c2;
            returnPiece(place, r1, c1);

            if (!king && canJump(board,r2,c2)) {
                squaresEl[r2 * size + c2].classList.add('selected');
                multiJump = true;
                enableTouch();
                return;
            }

            multiJump = false;

            if (win(board, player)) {
                disableReset();
                setTimeout(gameOver, 300);
                return;
            }

            player = -player;

            aiTimer = setTimeout(aiMove, 300);

            return;
        }

        if (jumps.length != 0) continue;


        if (validMove(board,r1,c1,r2,c2)) {

            makeMove(board,r1,c1,r2,c2);
            piece.dataset.r = r2;
            piece.dataset.c = c2;
            returnPiece(place);

            if (win(board, player)) {
                disableReset();
                setTimeout(gameOver, 300);
                return;
            }

            player = -player;

            aiTimer = setTimeout(aiMove, 300);

            return;
        }
    }

    returnPiece();
}

const returnPiece = (place = null, r1 = null, c1 = null) => {
    
    let squares = document.querySelectorAll('.square');
    let pieces = document.querySelectorAll('.piece');
    let piece = document.querySelector('.move-m');
    let move;

    if (piece == null) return;

    let r2 = Number(piece.dataset.r);
    let c2 = Number(piece.dataset.c);

    place = place instanceof Event ? null : place;

    move = place == null ? false : true;

    if (place == null && multiJump) squares[r2 * size + c2].classList.add('selected');

    place = place || document.querySelectorAll('.square')[r2 * size + c2].firstChild;
    
    piece.classList.add('return'); 

    let event = new Event('transitionend');
    let style = window.getComputedStyle(piece);
    let matrix = new DOMMatrix(style.transform);
    let rectPiece = piece.getBoundingClientRect();
    let rectPlace = place.getBoundingClientRect();
    let offsetLeft = rectPiece.left - rectPlace.left;
    let offsetTop = rectPiece.top - rectPlace.top;

    piece.removeEventListener('touchmove', touchMove);
    document.removeEventListener('mousemove', mouseMove);

    piece.removeEventListener('touchend', endMove);
    piece.removeEventListener('touchcancel', endMove);
    document.removeEventListener('mouseup', endMove);

    piece.addEventListener('transitionend', e => {

        let piece = e.currentTarget;

        piece.classList.remove('return', 'move-m');

        if (Math.abs(board[r2][c2]) == 2) piece.classList.add('king');
        if (!move) enableTouch();
                    
    }, {once: true});

    piece.style.transform = `translate(${matrix.m41 - offsetLeft}px, ${matrix.m42 - offsetTop}px)`;

    if (offsetLeft == 0 && offsetTop == 0) piece.dispatchEvent(event);

    if (r1 != null && Math.abs(r2 - r1) == 2) {

            let r0 = Math.min(r1, r2) + 1;
            let c0 = Math.min(c1, c2) + 1;
            let i = [...pieces].findIndex(piece => Number(piece.dataset.r) == r0 && Number(piece.dataset.c) == c0);

            pieces[i].addEventListener('transitionend', e => {

                let piece = e.currentTarget;
        
                piece.classList.remove('disappear');
                piece.classList.add('removed');
        
            }, {once: true});

            pieces[i].classList.add('disappear');

            delete pieces[i].dataset.r;
            delete pieces[i].dataset.c;

    }

    if (piece.dataset.x0 == piece.dataset.x && piece.dataset.y0 == piece.dataset.y) {
        squares[r2 * size + c2].classList.add('selected');
    }
}

const selectSquare = (e) => {

    let square = e.currentTarget;
    let squares = document.querySelectorAll('.square');
    let jumps = jumpsAvailable(board);
    let i = [...squares].indexOf(square);
    let [r2, c2] = [Math.trunc(i / size), i % size];

    i = [...squares].findIndex(square => square.classList.contains('selected'));

    if (i == -1) return;

    let [r1, c1] = [Math.trunc(i / size), i % size];

    if (validJump(board,r1,c1,r2,c2)) {
        squares.forEach(square => square.classList.remove('selected'));
        let king = makeMove(board,r1,c1,r2,c2);
        movePiece(r1,c1,r2,c2);

        if (!king && canJump(board,r2,c2)) {
            squares[r2 * size + c2].classList.add('selected');
            multiJump = true;
            return;
        }

        multiJump = false;

        disableTouch();

        if (win(board, player)) {
            disableReset();
            setTimeout(gameOver, 600);
            return;
        }

        player = -player;

        aiTimer = setTimeout(aiMove, 600);

        return;
    }

    if (jumps.length != 0) return;

    if (validMove(board,r1,c1,r2,c2)) {
        squares.forEach(square => square.classList.remove('selected'));
        makeMove(board,r1,c1,r2,c2);
        movePiece(r1,c1,r2,c2);

        disableTouch();

        if (win(board, player)) {
            disableReset();
            setTimeout(gameOver, 600);
            return;
        }

        player = -player;

        aiTimer = setTimeout(aiMove, 600);
    }

}

const enableReset = () => {

    let reset = document.querySelector('.reset');

    reset.addEventListener('touchstart', resetGame);
    reset.addEventListener('mousedown', resetGame);
}

const disableReset = () => {

    let reset = document.querySelector('.reset');

    reset.removeEventListener('touchstart', resetGame);
    reset.removeEventListener('mousedown', resetGame);
}

const enableTouch = () => {

    let pieces = document.querySelectorAll('.piece');
    let squares = document.querySelectorAll('.square');

    pieces.forEach(piece => {
        piece.addEventListener('touchstart', startMove);
        piece.addEventListener('mousedown', startMove);
    });

    squares.forEach(square => {
        square.addEventListener('touchstart', selectSquare);
        square.addEventListener('mousedown', selectSquare);    
    });

    window.addEventListener('orientationchange', returnPiece);
}

const disableTouch = () => {

    let pieces = document.querySelectorAll('.piece');
    let squares = document.querySelectorAll('.square');

    pieces.forEach(piece => {
        piece.removeEventListener('touchstart', startMove);
        piece.removeEventListener('mousedown', startMove);
    });

    squares.forEach(square => {
        square.removeEventListener('touchstart', selectSquare);
        square.removeEventListener('mousedown', selectSquare);    
    });
}

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();

    document.addEventListener('touchstart', preventDefault, {passive: false});
    document.addEventListener('mousedown', preventDefault, {passive: false});
}