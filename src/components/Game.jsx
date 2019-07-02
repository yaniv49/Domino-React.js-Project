import React, { Component } from 'react';
import PlayerLayout from './PlayerLayout.jsx';
import Board from './Board.jsx';
import Statistics from './Statistics.jsx';

import DominoStock from '../images/DominoStock.png';
import playerTileBackground from '../images/playerTileBackground.jpg'
import leftArrow from '../images/leftArrow.gif'
import '../styles/Game.css';

class Game extends Component {
    constructor() {
        super();
        this.state = {
            gameStatus: "Start By Picking A Domino",
            stock: [],
            boardTiles: [],
            playerTiles: [],
            surroundingsStatus: [],
            isGameStart: false,
            isGameOver: false,
            isNeedToTakeFromStock: false,
            numberOfUnValidMoves: 0,
            numberOfTileSurrounding: 0,
            selectedTile: undefined,
            // boardDimension: { width: 1120, height: 1120, zoom: 10 },
            boardDimension: { width: 2240, height: 2240, zoom: 10 },
            // statistics
            averageTurnTime: "00:00",
            gameStartTimer: new Date().getTime(),
            gameTime: '00:00',
            numberOfStockPulling: 0,
            numberOfValidMoves: 0,
            playerScore: 0
        };
        this.newGame = this.newGame.bind(this);
        this.nextState = this.nextState.bind(this);
        this.timeElapsed = this.timeElapsed.bind(this);
        this.previousState = this.previousState.bind(this);
        this.onPlayerPickTile = this.onPlayerPickTile.bind(this);
        this.getNewTileFromStock = this.getNewTileFromStock.bind(this);
        this.addSurroundingStatus = this.addSurroundingStatus.bind(this);
        this.countTileSurroundings = this.countTileSurroundings.bind(this);
        this.placeSelectedTileOnBoard = this.placeSelectedTileOnBoard.bind(this);

        this.initGame();
    }

    initGame() {
        localStorage.clear();
        this.initialTiles();
        this.getStartingTiles();
        this.setPlayerScore();
        this.saveCurrentState();
        this.time = window.setInterval(this.timeElapsed, 100);
    }

    initialTiles() {
        for (var i = 0; i <= 6; i++) {
            for (var j = 0; j <= 6 - i; j++) {
                this.state.stock.push({ x: i, y: j + i });
            }
        }
    }

    getStartingTiles() {
        for (let i = 0; i < 6; i++) {
            let x = Math.floor(Math.random() * this.state.stock.length);
            this.state.playerTiles[i] = this.state.stock[x];
            this.state.stock.splice(x, 1);
        };
    }

    setPlayerScore() {
        let score = 0;
        for (let i = 0; i < this.state.playerTiles.length; i++) {
            let tile = this.state.playerTiles[i];
            score += tile.x + tile.y;
        }
        this.state.playerScore = score;
    }

    getNewTileFromStock() {
        if (this.state.isGameOver === false && this.state.isNeedToTakeFromStock === true) {
            if (this.state.stock.length !== 0) {
                let x = Math.floor(Math.random() * this.state.stock.length);

                this.state.playerTiles.push(this.state.stock[x]);
                this.state.stock.splice(x, 1);
                this.setState({
                    playerTiles: this.state.playerTiles,
                });
            }
            this.state.numberOfStockPulling++;
            this.setAverageTurnTime();
            this.saveCurrentState();
        }
    }

    onPlayerPickTile(x, y) {
        if (this.state.isGameOver === false) {
            let playerLayoutIndex = this.getPlayerLayoutIndex(x, y);
            let row = Math.round((this.state.boardDimension.height / this.state.boardDimension.zoom) / 2);
            let column = Math.round((this.state.boardDimension.width / this.state.boardDimension.zoom) / 2);

            if (playerLayoutIndex !== -1) {
                if (this.state.boardTiles.length === 0) {
                    this.state.playerTiles.splice(playerLayoutIndex, 1);
                    let surroundings = [
                        { location: 'left', isActive: true },
                        { location: 'up', isActive: true },
                        { location: 'right', isActive: true },
                        { location: 'down', isActive: true }
                    ]
                    this.state.boardTiles.push({ x, y, row, column, direction: 'right', surroundings });
                    this.setState({
                        playerTiles: this.state.playerTiles,
                        boardTiles: this.state.boardTiles,
                    });
                    this.state.numberOfValidMoves++;
                    this.state.isGameStart = true;
                    this.setAverageTurnTime();
                    this.saveCurrentState();
                }
                else {
                    this.setState({ selectedTile: { x, y } })
                }
            }
        }
    }

    placeSelectedTileOnBoard(row, column, direction, surroundings) {
        let { x, y } = this.state.selectedTile;
        let playerLayoutIndex = this.getPlayerLayoutIndex(x, y);

        this.state.playerTiles.splice(playerLayoutIndex, 1);
        this.state.boardTiles.push({ x, y, row, column, direction, surroundings });
        this.state.selectedTile = undefined;
        this.state.numberOfValidMoves++;
        this.setState({
            playerTiles: this.state.playerTiles,
            boardTiles: this.state.boardTiles,
        })
        this.setAverageTurnTime();
        this.saveCurrentState();
    }

    getPlayerLayoutIndex(x, y) {
        return this.state.playerTiles.findIndex((tile) => {
            return (tile.x === x && tile.y === y);
        });
    }

    timeElapsed() {
        let elapsed = new Date().getTime() - this.state.gameStartTimer;
        let formatted = this.convertTime(elapsed);
        if (this.state.isGameOver === false) {
            this.setState({ gameTime: formatted });
        }
        else {
            this.setState({ gameStatus: this.state.gameStatus });
        }
    }

    convertTime(miliseconds) {
        let totalSeconds = Math.floor(miliseconds / 1000);
        let minutes = this.clockDisplay(Math.floor(totalSeconds / 60), 2);
        let seconds = this.clockDisplay(totalSeconds - minutes * 60, 2);
        return minutes + ':' + seconds;
    }

    clockDisplay(aNumber, aLength) {
        if (aNumber.toString().length >= aLength)
            return aNumber;
        return (Math.pow(10, aLength) + Math.floor(aNumber)).toString().substring(1);
    }

    setAverageTurnTime() {
        let avgTimeInMilliseconds = ((new Date().getTime() - this.state.gameStartTimer) / (this.state.numberOfValidMoves + this.state.numberOfStockPulling));
        var avgTime = this.convertTime(avgTimeInMilliseconds);
        this.state.averageTurnTime = avgTime;
    }

    previousState() {
        let { numberOfValidMoves, numberOfStockPulling } = this.state;
        let currentState = numberOfStockPulling + numberOfValidMoves;
        let state = this.getState(--currentState);
        this.SetState(state)
    }

    nextState() {
        let { numberOfValidMoves, numberOfStockPulling } = this.state;
        let currentState = numberOfStockPulling + numberOfValidMoves;
        let state = this.getState(++currentState);
        this.SetState(state)
    }

    getState(stateNumber) {
        return JSON.parse(localStorage.getItem(`State${stateNumber}`));
    }

    saveCurrentState() {
        let { numberOfValidMoves, numberOfStockPulling } = this.state;
        let stateNumber = numberOfStockPulling + numberOfValidMoves;
        localStorage.setItem(`State${stateNumber}`, JSON.stringify(this.state));
    }

    SetState(state) {
        if (state !== null) {
            this.setState({
                stock: state.stock,
                playerTiles: state.playerTiles,
                boardTiles: state.boardTiles,
                selectedTile: state.selectedTile,
                boardDimension: state.boardDimension,
                surroundingsStatus: state.surroundingsStatus,
                numberOfTileSurrounding: state.numberOfTileSurrounding,
                gameStartTimer: state.gameStartTimer,
                numberOfStockPulling: state.numberOfStockPulling,
                numberOfValidMoves: state.numberOfValidMoves
            });
        }
    }

    newGame() {
        this.state = {
            gameStatus: "Start By Picking A Domino",
            isGameStart: false,
            isGameOver: false,
            isNeedToTakeFromStock: false,
            numberOfUnValidMoves: 0,
            stock: [],
            playerTiles: [],
            boardTiles: [],
            selectedTile: undefined,
            boardDimension: { width: 2240, height: 2240, zoom: 10 },
            // boardDimension: { width: 1120, height: 1120, zoom: 10 },
            surroundingsStatus: [],
            numberOfTileSurrounding: 0,
            averageTurnTime: "00:00",
            gameStartTimer: new Date().getTime(),
            gameTime: '00:00',
            numberOfStockPulling: 0,
            numberOfValidMoves: 0,
            playerScore: 0,
        };

        this.initGame();
        this.setStateForNewGame(this.state);
    }

    setStateForNewGame(state) {
        if (state !== null) {
            this.setState({
                stock: state.stock,
                playerTiles: state.playerTiles,
                boardTiles: state.boardTiles,
                selectedTile: state.selectedTile,
                boardDimension: state.boardDimension,
                surroundingsStatus: state.surroundingsStatus,
                numberOfTileSurrounding: state.numberOfTileSurrounding,
                gameStartTimer: state.gameStartTimer,
                numberOfStockPulling: state.numberOfStockPulling,
                numberOfValidMoves: state.numberOfValidMoves,

                gameStatus: state.gameStatus,
                isGameStart: state.isGameStart,
                averageTurnTime: state.averageTurnTime,
                isGameOver: state.isGameOver,
                isNeedToTakeFromStock: state.isNeedToTakeFromStock,
                numberOfUnValidMoves: state.numberOfUnValidMoves,
                gameTime: state.gameTime,
                playerScore: state.playerScore
            });
        }
    }

    showPrevButton() {
        if (this.state.isGameOver === true)
            return (<button className="button" onClick={this.previousState} >prev</button>);
    }

    showNextButton() {
        if (this.state.isGameOver === true)
            return (<button className="button" onClick={this.nextState} >next</button>);
    }

    showNewGameButton() {
        if (this.state.isGameOver === true)
            return (<button className="button" onClick={this.newGame} >New Game</button>);
    }

    showLeftArrow() {
        if (this.state.isGameOver === false && this.state.isNeedToTakeFromStock === true)
            return (<img className="leftArrow" src={leftArrow} />)
    }

    addSurroundingStatus(status) {
        this.state.surroundingsStatus.push(status);
    }

    countTileSurroundings() {
        this.state.numberOfTileSurrounding++;
    }

    componentDidUpdate() {
        this.state.numberOfUnValidMoves = 0;
        for (let i = 0; i < this.state.surroundingsStatus.length; i++) {
            if (this.state.surroundingsStatus[i] === false) {
                this.state.numberOfUnValidMoves++;
            }
        }

        if (this.state.isGameStart) {
            if (this.state.playerTiles.length === 0) {
                this.state.isGameOver = true;
                this.state.gameStatus = "WIN";
            }
            else if (this.state.numberOfUnValidMoves !== this.state.numberOfTileSurrounding) {
                this.state.isNeedToTakeFromStock = false;
                this.state.gameStatus = "PUT DOMINO ON BOARD";
            }
            else if (this.state.stock.length !== 0) {
                this.state.isNeedToTakeFromStock = true;
                this.state.gameStatus = "TAKE DOMINO FROM STOCK";
            }
            else {
                this.state.isGameOver = true;
                this.state.gameStatus = "Game Over";
            }
        }

        this.state.surroundingsStatus = [];
        this.state.numberOfTileSurrounding = 0;
        this.setPlayerScore();
    }

    render() {
        return (
            <React.Fragment>
                <h1 className="title">{this.state.gameStatus}</h1>
                <h2 id="time">{this.state.gameTime}</h2>
                <div className="gameSection">
                    <Board
                        id="board"
                        boardTiles={this.state.boardTiles}
                        selectedTile={this.state.selectedTile}
                        boardDimension={this.state.boardDimension}
                        playerTiles={this.state.playerTiles}
                        placeSelectedTileOnBoard={this.placeSelectedTileOnBoard}
                        countTileSurroundings={this.countTileSurroundings}
                        addSurroundingStatus={this.addSurroundingStatus}
                    />
                    <div style={{ width: '300px' }}>
                        <Statistics
                            averageTurnTime={this.state.averageTurnTime}
                            numberOfStockPulling={this.state.numberOfStockPulling}
                            moveNumber={this.state.numberOfStockPulling + this.state.numberOfValidMoves}
                            playerScore={this.state.playerScore}
                        />
                        <ul>
                            <li>{this.showPrevButton()}</li>
                            <li>{this.showNewGameButton()}</li>
                            <li>{this.showNextButton()}</li>
                        </ul>

                    </div>
                </div>

                <div className="footer" style={{ backgroundImage: `url(${playerTileBackground})` }}>
                    {this.showLeftArrow()}
                    <PlayerLayout
                        id="playerLayout"
                        selectedTile={this.state.selectedTile}
                        playerTiles={this.state.playerTiles}
                        onPlayerPickTile={this.onPlayerPickTile}
                    />
                </div>
                <img className="dominoStock" src={DominoStock} onClick={this.getNewTileFromStock} />
            </React.Fragment>
        );
    }
}

export default Game;