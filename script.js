// DOM要素の取得
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const nextTetrominoDisplay = document.getElementById('next-tetromino');

// ゲームボードの設定
const BOARD_WIDTH = 10; // ボードの幅（列数）
const BOARD_HEIGHT = 20; // ボードの高さ（行数）

// テトリミノの形状 (テトラミノ)
const TETROMINOS = {
    'I': {
        shape: [[1, 1, 1, 1]],
        color: 'cyan'
    },
    'L': {
        shape: [[1, 0, 0], [1, 1, 1]],
        color: 'orange'
    },
    'J': {
        shape: [[0, 0, 1], [1, 1, 1]],
        color: 'blue'
    },
    'O': {
        shape: [[1, 1], [1, 1]],
        color: 'yellow'
    },
    'S': {
        shape: [[0, 1, 1], [1, 1, 0]],
        color: 'green'
    },
    'T': {
        shape: [[0, 1, 0], [1, 1, 1]],
        color: 'purple'
    },
    'Z': {
        shape: [[1, 1, 0], [0, 1, 1]],
        color: 'red'
    }
};

// ゲームの状態
let board = []; // ゲームボードの状態を保持する2次元配列
let currentTetromino = null; // 現在操作中のテトリミノ
let currentPosition = { x: 0, y: 0 }; // 現在のテトリミノの位置
let score = 0; // 現在のスコア
let nextTetromino = null; // 次に出現するテトリミノ

// ゲームボードの初期化
function initializeBoard() {
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_WIDTH; col++) {
            board[row][col] = 0; // 0は空のセルを表す
        }
    }
}

// テトリミノをランダムに選択する関数
function getRandomTetromino() {
    const keys = Object.keys(TETROMINOS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return TETROMINOS[randomKey];
}

// 新しいテトリミノを生成する関数
function spawnNewTetromino() {
    currentTetromino = nextTetromino || getRandomTetromino();
    nextTetromino = getRandomTetromino();
    currentPosition = {
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(currentTetromino.shape[0].length / 2),
        y: 0 // ボードの最上部中央に配置
    };

    // ゲームオーバーのチェック
    if (checkCollision()) {
        // ゲームオーバー処理
        console.log("Game Over");
        alert("ゲームオーバー！ スコア: " + score);
        // TODO: より洗練されたゲームオーバー画面と、明確なゲームループ停止/再開処理を検討
        initializeBoard(); // ボードをリセット
        score = 0; // スコアをリセット
        updateScoreDisplay();
        // TODO: ゲームの再開処理を追加する
    }

    drawNextTetromino();
}

// テトリミノを描画する関数
function drawTetromino() {
    if (!currentTetromino) return;
    const { shape, color } = currentTetromino;
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                const boardX = currentPosition.x + x;
                const boardY = currentPosition.y + y;
                // 描画はボードの内側のみ（テトリミノが生成されて画面上部に見える前の部分は描画しない）
                if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                    const block = document.createElement('div');
                    block.classList.add('block');
                    block.style.backgroundColor = color;
                    block.style.gridColumnStart = boardX + 1;
                    block.style.gridRowStart = boardY + 1;
                    gameBoard.appendChild(block);
                }
            }
        });
    });
}

// ボード全体を描画する関数
function drawBoard() {
    gameBoard.innerHTML = ''; // 既存のブロックをクリア
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) { // 0でない場合は固定されたブロック
                const block = document.createElement('div');
                block.classList.add('block');
                block.style.backgroundColor = value; // 固定されたブロックの色
                block.style.gridColumnStart = x + 1;
                block.style.gridRowStart = y + 1;
                gameBoard.appendChild(block);
            }
        });
    });
}

// 次のテトリミノを描画する関数
function drawNextTetromino() {
    nextTetrominoDisplay.innerHTML = ''; // クリア
    if (!nextTetromino) return;
    const { shape, color } = nextTetromino;
    // プレビュー用にグリッドを作成
    nextTetrominoDisplay.style.display = 'grid';
    const previewSize = Math.max(shape.length, shape[0] ? shape[0].length : 0);
    nextTetrominoDisplay.style.gridTemplateColumns = `repeat(${previewSize}, 1fr)`;
    nextTetrominoDisplay.style.gridTemplateRows = `repeat(${previewSize}, 1fr)`;

    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                const block = document.createElement('div');
                block.classList.add('block');
                block.style.backgroundColor = color;
                // グリッド内の位置を調整
                block.style.gridColumnStart = x + 1;
                block.style.gridRowStart = y + 1;
                nextTetrominoDisplay.appendChild(block);
            }
        });
    });
}


// 衝突検出を行う関数
function checkCollision() {
    if (!currentTetromino) return false;
    const { shape } = currentTetromino;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] === 1) {
                const boardX = currentPosition.x + x;
                const boardY = currentPosition.y + y;

                // ボードの境界チェック
                if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
                    return true; // ボード外
                }
                // 他の固定されたブロックとの衝突チェック
                if (boardY >= 0 && board[boardY] && board[boardY][boardX] !== 0) {
                    return true; // 他のブロックと衝突
                }
            }
        }
    }
    return false; // 衝突なし
}

// テトリミノをボードに固定する関数
function fixTetromino() {
    if (!currentTetromino) return;
    const { shape, color } = currentTetromino;
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                const boardX = currentPosition.x + x;
                const boardY = currentPosition.y + y;
                if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                    board[boardY][boardX] = color; // テトリミノの色でボードを更新
                }
            }
        });
    });
    clearLines();
    spawnNewTetromino(); // 新しいテトリミノを生成
}

// ラインが揃ったかチェックし、揃っていれば消去する関数
function clearLines() {
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // ラインが揃っている
            board.splice(y, 1); // ラインを削除
            board.unshift(new Array(BOARD_WIDTH).fill(0)); // 新しい空のラインを上に追加
            linesCleared++;
            y++; // 同じ行を再度チェックするため
        }
    }
    // スコア更新
    if (linesCleared > 0) {
        score += linesCleared * 100; // 例: 1ライン100点
        updateScoreDisplay();
    }
}

// スコア表示を更新する関数
function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}

// テトリミノを下に移動する関数
function moveDown() {
    currentPosition.y++;
    if (checkCollision()) {
        currentPosition.y--; // 衝突したら元に戻す
        fixTetromino();
        return false; // 固定されたことを示す
    }
    return true; // 移動成功
}

// テトリミノを左右に移動する関数
function moveHorizontal(direction) {
    currentPosition.x += direction;
    if (checkCollision()) {
        currentPosition.x -= direction; // 衝突したら元に戻す
    }
}

// テトリミノを回転する関数
function rotateTetromino() {
    if (!currentTetromino) return;
    const originalShape = currentTetromino.shape;
    const rotatedShape = [];
    for (let y = 0; y < originalShape[0].length; y++) {
        rotatedShape[y] = [];
        for (let x = 0; x < originalShape.length; x++) {
            rotatedShape[y][x] = originalShape[originalShape.length - 1 - x][y];
        }
    }
    currentTetromino.shape = rotatedShape;
    if (checkCollision()) {
        currentTetromino.shape = originalShape; // 衝突したら元に戻す
    }
}

// ゲームループ
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000; // 1秒ごとに落下

function gameLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        moveDown();
        dropCounter = 0;
    }

    drawBoard(); // ボード全体を描画
    drawTetromino(); // 現在のテトリミノを描画

    requestAnimationFrame(gameLoop);
}

// キーボード操作
document.addEventListener('keydown', event => {
    if (!currentTetromino) return;

    switch (event.key) {
        case 'ArrowLeft': // 左移動
            moveHorizontal(-1);
            break;
        case 'ArrowRight': // 右移動
            moveHorizontal(1);
            break;
        case 'ArrowDown': // ソフトドロップ
            if (moveDown()) {
                dropCounter = 0; // ソフトドロップしたらタイマーリセット
            }
            break;
        case 'ArrowUp': // 回転
            rotateTetromino();
            break;
        case ' ': // ハードドロップ (スペースキー)
            while (moveDown()) {
                // 連続して下に移動
            }
            dropCounter = 0; // ハードドロップ後すぐに次のブロック
            break;
    }
    // 再描画 (操作後すぐに反映させるため)
    drawBoard();
    drawTetromino();
});

// ゲーム開始処理
function startGame() {
    initializeBoard();
    score = 0;
    updateScoreDisplay();
    nextTetromino = getRandomTetromino(); // 最初の「次へ」のテトリミノ
    spawnNewTetromino(); // 最初のテトリミノを生成
    drawNextTetromino(); // 最初の「次へ」のテトリミノ表示
    gameLoop();
}

// ゲーム開始
startGame();
