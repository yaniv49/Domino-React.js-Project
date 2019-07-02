import React, { Component } from 'react';

class TileSurroundings extends Component {
    constructor() {
        super();
        this.state = {
            isActive: true,
            border: '',
            nearNumber: -1
        };
        this.onPlayerPickPlace = this.onPlayerPickPlace.bind(this);
    }

    onPlayerPickPlace() {
        if (this.props.selectedTile !== undefined) {
            if (this.isValidMove(this.props.selectedTile)) {
                this.setState({ isActive: false });
                this.props.onPlayerPickValidPlace(this.props.location);
            }
        }
    }

    isValidMove(selectedTile) {
        let { nearNumber } = this.props;
        return (selectedTile !== undefined && (nearNumber === selectedTile.x || nearNumber === selectedTile.y)) ? true : false;
    }

    onPlayerSelectTile() {
        if (this.props.selectedTile !== undefined)
            return this.isValidMove(this.props.selectedTile) ? '2px solid green' : '2px solid red';
        else
            return '';
    }

    check() {
        this.props.countTileSurroundings();
        for (let i = 0; i < this.props.playerTiles.length; i++) {
            const playerTile = this.props.playerTiles[i];
            if (this.isValidMove(playerTile)) {
                this.props.addSurroundingStatus(true);
                return;
            }
        }
        this.props.addSurroundingStatus(false);
    }

    render() {
        if (this.state.isActive) {
            this.check();
            return (
                <div
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.onMouseOut}
                    onClick={this.onPlayerPickPlace}
                    style={{
                        gridArea: `${this.props.gridArea}`,
                        border: this.onPlayerSelectTile()
                    }} />
            );
        }
        else
            return '';
    }
}
export default TileSurroundings;