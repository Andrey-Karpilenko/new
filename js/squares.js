'use strict';

const ROMB = {
	size: 9,
	field: [[0, 0, 0, 0, 1, 0, 0, 0, 0],
	[0, 0, 0, 1, 1, 1, 0, 0, 0],
	[0, 0, 1, 1, 1, 1, 1, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[0, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 1, 1, 1, 1, 1, 0, 0],
	[0, 0, 0, 1, 1, 1, 0, 0, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 0]]
}
const CROSS = {
	size: 9,
	field: [[0, 0, 0, 1, 1, 1, 0, 0, 0],
	[0, 0, 0, 1, 1, 1, 0, 0, 0],
	[0, 0, 0, 1, 1, 1, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 1, 1, 1, 0, 0, 0],
	[0, 0, 0, 1, 1, 1, 0, 0, 0],
	[0, 0, 0, 1, 1, 1, 0, 0, 0]]
}
const X_CROSS = {
	size: 9,
	field: [[0, 0, 1, 0, 0, 0, 1, 0, 0],
	[0, 1, 1, 1, 0, 1, 1, 1, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[0, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 1, 1, 1, 1, 1, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 1],
	[0, 1, 1, 1, 0, 1, 1, 1, 0],
	[0, 0, 1, 0, 0, 0, 1, 0, 0]]
}
const COLORS = ['blue', 'red'];

let game;
let settingsForm;
let field = document.getElementById('my-field');
let turnMessage = document.getElementById('current-player');
let tCanvas = document.getElementById('temporary-canvas');
let pCanvas = document.getElementById('permanent-canvas');
let tContext = tCanvas.getContext('2d');
let pContext = pCanvas.getContext('2d');

class Player {
	constructor(name, color) {
		this.name = name; // human , beginner, skillful, advanced
		this.total = 0;
		this.color = color;
		this.scoreOutput = document.getElementById(color + '-results');
		this.totalOutput = document.getElementById(color + '-total');
		this.nameOutput = document.getElementById(color + '-name');
	}

	addScore(score) {
		this.total += score;
		if (score > 0) {
			this.scoreOutput.innerHTML += `<br>+${score} point`;
			if (score != 1) this.scoreOutput.innerHTML += 's';
			this.scoreOutput.innerHTML += '.';
		}
		this.totalOutput.innerHTML = this.total;
	}

	reset() {
		this.total = 0;
		let outputName = this.color.toUpperCase() + "'S:<br>"
		this.totalOutput.innerHTML = 0;
		if (settingsForm.computer.checked && settingsForm.color.value == this.color) {
			this.name = settingsForm.level.value;
			outputName += this.name.toUpperCase();
			this.scoreOutput.innerHTML = "COMPUTER'S MOVES:";
		} else {
			outputName += 'PLAYER ' + (this.color == 'blue' ? 1 : 2);
			this.name = 'human';
			this.scoreOutput.innerHTML = 'PLAYER ' + (this.color == 'blue' ? 1 : 2) + "'S MOVES:";
		}
		this.nameOutput.innerHTML = outputName;
	}

	async move(points) {
		if (this.name == 'human') return;
		field.style.zIndex = -1;// отключить интерфейс c пользователем 
		document.body.style.cursor = 'wait';
		switch (this.name) {
			case 'beginner':
				await pause(1000);
				this.beginnerMove(points);
				break;
			case 'skillful':
				await pause(2000);
				this.skillfulMove(points);
				break;
			case 'advanced':
				await pause(3000);
				this.advancedMove(points);
				break;
		}
		document.body.style.cursor = '';
		field.style.zIndex = 1;// влючить интерфейс с пользователем
	}

	beginnerMove(points) {
		let selected = getRandomInt(points.length);
		points[selected].select();
	}

	skillfulMove(points) {
		let myGoodResult = this.goodMove(points, this.color);
		let hisGoodResult = this.goodMove(points, oppositeTurn(this.color));
		if (myGoodResult.area >= hisGoodResult.area) {
			myGoodResult.point.select();
		} else {
			hisGoodResult.point.select();
		}
	}

	goodMove(points, color) {
		let selectedPoint = points[getRandomInt(points.length)];
		let selectedArea = 0;
		for (let point of points) {
			point.color = color;
			let area = point.calcArea(color);
			if (area > selectedArea) {
				selectedPoint = point;
				selectedArea = area;
			}
			point.color = '';
		}
		return { point: selectedPoint, area: selectedArea };
	}

	advancedMove(points) {

	}
}

class Game {
	constructor() {
		this.squares = new Squares();
		this.players = [new Player('human', 'blue'), new Player('human', 'red')]; //default values
		this.turn = 0;
	}

	clear() {
		let points = field.querySelectorAll('the-point');
		for (let point of points) {
			field.removeChild(point);
		}
	}

	set(size) {
		this.size = size;
		this.scale = 400 / this.size;
		field.width = (this.size + 1) * this.scale;
		field.height = (this.size + 1) * this.scale;
		tCanvas.width = field.clientWidth;
		pCanvas.width = field.clientWidth;
		tCanvas.height = field.clientHeight;
		pCanvas.height = field.clientHeight;
	}

	createPoints() {
		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				let point = new Point(x, y, this.scale);
				field.append(point);
			}
		}
	}

	create(size) {
		this.set(size);
		this.createPoints();
	}

	createUserDefined(size) {
		let figure;
		switch (size) {
			case 'random':
				this.create(8);
				let n = 8 + getRandomInt(9);
				for (let i = 0; i < n; i++) {
					removeRandomPoint();
				}
				return;
			case 'romb':
				figure = ROMB;
				break;
			case 'cross':
				figure = CROSS;
				break;
			case 'x-cross':
				figure = X_CROSS;
				break;
		}
		let s = figure.size;
		this.set(s);
		for (let y = 0; y < s; y++) {
			for (let x = 0; x < s; x++) {
				if (figure.field[y][x])
					field.append(new Point(x, y, this.scale));
			}
		}

		function removeRandomPoint() {
			let points = field.querySelectorAll('the-point');
			field.removeChild(points[getRandomInt(points.length)]);
		}
	}

	reset() {
		this.clear();
		let size = settingsForm.size.value;
		switch (size) {
			case '4':
			case '5':
			case '6':
			case '7':
				this.create(+size);
				break;
			default:
				this.createUserDefined(size);
		}
	}

	createSquares() {
		let points = field.querySelectorAll('the-point');
		this.squares.clear();
		for (let i = 0; i < points.length; i++) {
			let a = points[i];
			for (let j = i + 1; j < points.length; j++) {
				let b = points[j];
				for (let k = i + 1; k < points.length; k++) {
					let c = points[k];
					for (let l = i + 1; l < points.length; l++) {
						let d = points[l];
						let square = new Square(a, b, c, d);
						if (square.isSquare()) {
							this.squares.add(square);
						}
					}
				}
			}
		}
	}

	nextTurn() {
		this.turn++;
		turnMessage.style.color = COLORS[this.turn % 2];
		turnMessage.textContent = COLORS[this.turn % 2] + "'s move";
		let points = field.querySelectorAll('the-point[class="hover"]');
		if (points.length > 0) {
			this.players[this.turn % 2].move(points);
			return;
		}
		turnMessage.style.color = 'grey';
		turnMessage.textContent = 'Game over!';
	}

	playersReset() {
		this.players[0].reset();
		this.players[1].reset();
	}

	start() {
		this.turn = 0;
		this.playersReset()
		turnMessage.style.color = COLORS[this.turn % 2];
		turnMessage.textContent = COLORS[this.turn % 2] + "'s move";
		this.reset();
		this.createSquares();
		this.players[0].move(field.querySelectorAll('the-point'));
	}

	addScore(score) {
		this.players[this.turn % 2].addScore(score);//добавляем очки текущему игроку
	}

	drawCompletedSquares(point, color) {
		let squares = this.squares.getAll(point);
		for (let square of squares) {
			if (square.coloredPoints(color) != 4) continue;
			square.render(pContext, this.scale, 5, color);
		}
	}

	drawSquares(point) {
		if (!settingsForm.show.checked) return;
		let squares = this.squares.getAll(point);
		for (let square of squares) {
			square.draw(tContext, this.scale);
		}
	}
}


main();

function main() {
	customElements.define('the-point', Point);

	settingsForm = document.getElementById('settings');
	// localStorage.clear();// отладка
	let settings = new Settings();
	settings.readLocalStorage();
	let description = document.getElementById('description-dialog');
	let doNotShowDescription = document.getElementById('no-description');
	if (!doNotShowDescription.checked) {
		description.showModal();
	}
	bindEvents();
	game = new Game();
	game.start();


	function bindEvents() {
		const theButton = document.querySelectorAll('button');
		for (const button in theButton) {
			if (theButton.hasOwnProperty.call(theButton, button)) {
				const element = theButton[button];
				switch (element.id) {
					case 'play':
						element.onclick = function () {
							description.close();
						};
						break;
					case 'new-game':
						element.onclick = function () { game.start(); };
						break;
				}
			}
		}
	}
}

function oppositeTurn(owner) {
	if (owner == 'blue') return 'red';
	return 'blue';
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function pause(delay) {
	return new Promise((res) => setTimeout(res, delay));
}

