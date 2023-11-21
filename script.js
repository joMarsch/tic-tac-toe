function createPlayer(playerName, playerSymbol) {
    const name = playerName;
    const symbol = playerSymbol;

    return {
        getName: function () {
            return name;
        },
        getSymbol: function () {
            return symbol;
        },
        playerInfo: function () {
            return `Name: ${name}, Symbol: ${symbol}`;
        }
    };
}

const gameBoard = (function () {
    let board = Array.from(new Array(3), () => new Array(3).fill(" "));

    const getBoard = () => board;

    const addSymbol = (row, column, symbol) => board[row][column] = symbol;

    const toString = () => {
        let boardString = "";
        for (let i = 0; i < board.length; i++) {
            boardString += `${board[i].toString()}\n`
        }
        return boardString;
    };

    const reset = () => {
        board.forEach(row => row.fill(" "));
    }

    return { getBoard, addSymbol, toString, reset };

})();

const gameLogic = (function () {
    const player1 = createPlayer("player1", "x");
    const player2 = createPlayer("player2", "o");
    const board = gameBoard;
    const allowedFields = ["00", "01", "02", "10", "11", "12", "20", "21", "22"];
    
    let availableFields = new Set(allowedFields);
    let activePlayer = player1;
    let isPlayingGame = true;
    let isWinning = false;

    const getIsPlayingGame = () => isPlayingGame;

    const getIsWinning = () => isWinning;

    const getActivePlayer = () => activePlayer;

    const playTurn = (input) => {
        if (isPlayingGame == false) {
            return;
        }

        // Active player move
        const checkedInput = checkPlayerInput(input);

        if(checkedInput == null) {
            return;
        }

        row = parseInt(input[0]);
        column = parseInt(input[1]);

        board.addSymbol(row, column, activePlayer.getSymbol());

        // Check if Winning
        if (checkWinning(row, column)) {
            isPlayingGame = false;
            isWinning = true;
            return;
        }

        //Check if tie
        if (checkTie()) {
            isPlayingGame = false;
            return;
        }

        // Switch active player
        switchActivePlayer();
    }

    const switchActivePlayer = () => {
        if (activePlayer == player1) {
            activePlayer = player2;
        } else {
            activePlayer = player1;
        }
    };

    const checkPlayerInput = (input) => {
        if (availableFields.has(input)) {
            availableFields.delete(input);
            return input;
        }
        return null;
    };

    const checkWinning = (row, column) => {
        // Checks if there is a winning state based on last symbol placement

        const lastSymbol = board.getBoard()[row][column];
        const indexUp = (index, increment) => (index + increment) % 3;
        const indexDown = (index, increment) => (((index - increment) % 3) + 3) % 3;

        let rowWinning = true;
        let columnWinning = true;
        let diagonalWinning = false;

        // Check winning for rows and columns
        for (let i = 1; i < 3; i++) {
            let rowSymbol = board.getBoard()[indexUp(row, i)][column];
            let columnSymbol = board.getBoard()[row][indexUp(column, i)];

            if (lastSymbol !== rowSymbol) {
                rowWinning = false;
            }

            if (lastSymbol !== columnSymbol) {
                columnWinning = false;
            }
        }

        //Check winning for diagonals 
        //First from Top left to bottom right 
        if (row == column) {
            diagonalWinning = true;
            for (let i = 1; i < 3; i++) {
                let diagonalIndex = indexUp(row, i);
                let diagonalSymbol = board.getBoard()[diagonalIndex][diagonalIndex];

                if (lastSymbol !== diagonalSymbol) {
                    diagonalWinning = false;
                }
            }
        }

        //Second from bottom left to top right
        if ((row == 2 && column == 0) || (row == 1 && column == 1) || (row == 0 && column == 2)) {
            diagonalWinning = (lastSymbol === board.getBoard()[indexDown(row, 1)][indexUp(column, 1)])
                && (lastSymbol === board.getBoard()[indexDown(row, 2)][indexUp(column, 2)]);
        }

        return rowWinning || columnWinning || diagonalWinning;
    };

    const checkTie = () => {
        return availableFields.size == 0;
    };

    const restartGame = () => {
        board.reset();
        isPlayingGame = true;
        activePlayer = player1;
        availableFields = new Set(allowedFields);
        isWinning = false;
    }

    return { playTurn, restartGame, getIsPlayingGame, getIsWinning, getActivePlayer };
})();

const displayLogic = (function () {
    const container = document.querySelector(".container");
    const restartButton = document.querySelector("#restart-button");
    const message = document.querySelector("#message");
    const game = gameLogic;
    const board = gameBoard;

    const initializeBoard = () => {
        addFieldsToContainer(container);
        setMessage(displayedMessage());

        restartButton.addEventListener("click", () => {
            container.replaceChildren();
            addFieldsToContainer(container);
            game.restartGame();
            setMessage(displayedMessage());
        });
    };

    const createField = (row, column) => {
        const field = document.createElement("div");

        field.classList.add("field");
        field.dataset.fieldCoordinate = row.toString() + column.toString();

        field.addEventListener("click", () => {
            game.playTurn(field.dataset.fieldCoordinate);
            setMessage(displayedMessage());

            // Display symbol in field via CSS
            field.textContent = board.getBoard()[row][column];
        })

        return field
    };

    const addFieldsToContainer = (container) => {
        for (let row = 0; row < 3; row++) {
            for (let column = 0; column < 3; column++) {
                container.appendChild(createField(row, column));
            }
        }
    };

    const displayedMessage = () => {
        let message;
        let playerSymbol = game.getActivePlayer().getSymbol().toUpperCase();

        if(game.getIsPlayingGame()) {
            message = `It's player ${playerSymbol}'s turn`;
        } else if (game.getIsWinning()) {
            message = `Player ${playerSymbol} won!`;
        } else {
            message = `We have a tie!`;
        }

        return message;
    };

    const setMessage = (newMessage) => {
        message.textContent = newMessage;
    };

    return { initializeBoard };

})();


displayLogic.initializeBoard();