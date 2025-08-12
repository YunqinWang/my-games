import * as d3 from "d3";
import "../css/russian_square.scss";
import { random, String } from "lodash";

class RussianSquareBlock {
	row = 0;
	col = 0;
	static allBlocks: Map<number, RussianSquareBlock> = new Map();

	fillBlock: number[][];
	top: number[];
	bottom: number[];
	block: number[][];
	frequency: number;
	color = "#000";

	id: number;
	constructor(
		fillBlock: number[][],
		frequency: number = 0.5, // [0,1]
		id: number | undefined = undefined
	) {
		this.fillBlock = fillBlock;

		fillBlock.forEach((f) => {
			if (f[1] + 1 > this.col) this.col = f[1] + 1;
			if (f[0] + 1 > this.row) this.row = f[0] + 1;
		});
		this.block = Array.from({ length: this.row }, () =>
			Array(this.col).fill(0)
		);
		this.top = Array(this.col).fill(this.row + 1);
		this.bottom = Array(this.col).fill(0);

		fillBlock.forEach((f) => {
			this.block[f[0]][f[1]] = 1;
			let curBottom = this.bottom[f[1]];
			if (curBottom < f[0] + 1) {
				this.bottom[f[1]] = f[0] + 1;
			}
			let curTop = this.top[f[1]];
			if (curTop > f[0]) {
				this.top[f[1]] = f[0];
			}
		});

		this.frequency = frequency;

		if (id == undefined) {
			id = RussianSquareBlock.allBlocks.size;
		}
		RussianSquareBlock.allBlocks.set(id, this);
		this.id = id;
	}

	logBlock() {
		// this.block.forEach((_r, index) => {
		// 	let r = _r.join("").replaceAll("0", " ");
		// 	console.log([index, ...r].join(""));
		// });

		// let dashline = Array(RussianSquareBlock.col).fill("-");
		// console.log(dashline.join(""));

		// let gridH = dashline.map((_, i) => i);
		// console.log(gridH.join(""));
		console.log(this.block);
		console.log("bottom", this.bottom);
	}

	static prepareBlocks() {
		new RussianSquareBlock([
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
		]);

		new RussianSquareBlock([
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 0],
			[2, 0],
			[3, 0],
		]);

		new RussianSquareBlock([
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		]);

		new RussianSquareBlock([
			[0, 1],
			[1, 1],
			[2, 0],
			[2, 1],
			[2, 2],
		]);
	}

	static getRandomBlock() {
		let blockId = random(0, RussianSquareBlock.allBlocks.size - 1, false);
		let block = RussianSquareBlock.allBlocks.get(blockId);
		return block;
	}

	findBlockBottomRow() {
		// x
		// x x x
		// x
		// bottom[3,2,2]
		let bottomRow = -1;
		let bottomCol = -1;
		this.bottom.forEach((colBottom, i) => {
			if (colBottom > bottomRow) {
				bottomRow = colBottom;
				bottomCol = i;
			}
		});
		return [bottomRow, bottomCol];
	}
}

class RussianSquareGame {
	divId: string;

	svgId: string;
	chartSvg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
	svgWidth = 300;
	svgHeight = 600;
	margins = { top: 10, bottom: 10, left: 10, right: 10 };

	mainWidth = this.svgWidth - this.margins.left - this.margins.right;
	mainHeight = this.svgHeight - this.margins.top - this.margins.bottom;
	gridSize = 20;

	col = this.mainWidth / this.gridSize;
	row = this.mainHeight / this.gridSize;
	floor = Array(this.col).fill(this.row);

	gameBoard = Array.from({ length: this.row }, () => Array(this.col).fill(0));

	constructor(divId: string, svgId: string) {
		this.divId = divId;

		this.svgId = svgId;
		this.chartSvg = this.createSvg();
		this.drawSvgGrid();
		this.appendButtons();
	}

	private createSvg() {
		let chartSvg = d3
			.select(`svg#${this.svgId}`)
			.attr("width", this.svgWidth)
			.attr("height", this.svgHeight);
		return chartSvg;
	}

	private appendButtons() {
		let div = d3.select(`#${this.divId}`);
		div.append("button")
			.text("Start!")
			.on("click", async () => {
				const iterator = this.startGame();
			});
	}

	private drawSvgGrid() {
		let mainChart = this.chartSvg
			.append("g")
			.attr(
				"transform",
				`translate(${this.margins.left},${this.margins.top})`
			);

		const back = mainChart.append("g");
		back.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", this.mainWidth)
			.attr("height", this.mainHeight)
			.attr("fill", "#D2D2D2");

		let horizontalData = Array(this.row)
			.fill(1)
			.map((_, index) => {
				return index * this.gridSize;
			});
		back.selectAll(".grid-line-h")
			.data(horizontalData)
			.join(function (enter) {
				return enter.append("line").attr("stroke", "#fff");
			})
			.attr("x1", 0)
			.attr("y1", (d) => d)
			.attr("x2", this.mainWidth)
			.attr("y2", (d) => d);
		back.selectAll(".grid-line-h-text")
			.data(Array(this.row + 1).fill(1))
			.join(function (enter) {
				return enter.append("text").text((d, i) => i);
			})
			.attr("font-size", "10px")
			.attr("x", -10)
			.attr("y", (d, i) => i * this.gridSize);

		let verticalData = Array(this.col)
			.fill(1)
			.map((_, index) => {
				return index * this.gridSize;
			});
		back.selectAll(".grid-line-v")
			.data(verticalData)
			.join(function (enter) {
				return enter.append("line").attr("stroke", "#fff");
			})
			.attr("x1", (d) => d)
			.attr("y1", 0)
			.attr("x2", (d) => d)
			.attr("y2", this.mainHeight);

		mainChart.append("g").attr("id", "blockG");
	}

	private maxBlocks = 2;
	private dropTime = 100;
	async startGame() {
		console.log("startGame");

		let game = this;
		let g = this.chartSvg.select("#blockG");
		let endGame = false;

		let blockCount = 0;

		while (!endGame && blockCount <= this.maxBlocks) {
			console.log("==blockCount==", blockCount);
			blockCount += 1;

			let block = RussianSquareBlock.getRandomBlock();
			if (block == undefined) return;
			block.logBlock();

			let { leftCol, moveToRow, ymove } = this.getBlockPosition(block);

			let tmpBlocks = [...block.fillBlock];
			while (ymove + block.row != moveToRow + 1) {
				ymove += 1;
				const t = g.transition().duration(this.dropTime);
				const blockUpdate = g
					.selectAll(".moving-block")
					.data(tmpBlocks)
					.call((update) =>
						update
							.transition(t)
							.attr(
								"transform",
								`translate(${leftCol * this.gridSize},${
									ymove * this.gridSize
								})`
							)
					);

				const blockEnter = blockUpdate
					.enter()
					.append("rect")
					.attr("fill", "green")
					.attr("class", "moving-block")
					.attr("x", (d) => d[1] * game.gridSize)
					.attr("y", (d) => d[0] * game.gridSize)
					.attr("width", (d) => game.gridSize)
					.attr("height", (d) => game.gridSize)
					.call((enter) =>
						enter.attr(
							"transform",
							`translate(${leftCol * this.gridSize},${
								ymove * this.gridSize
							})`
						)
					);

				const blockExit = blockUpdate
					.exit()
					.attr("fill", "brown")
					.call((exit) => exit.attr("class", "settled-block"));

				if (ymove + block.row == moveToRow) {
					tmpBlocks = [];
					this.addBlockToGameState(block, moveToRow, leftCol);
					console.log("==landed==");
				}
				await new Promise((resolve) =>
					setTimeout(resolve, this.dropTime)
				);
			}

			if (moveToRow - block.row < 0) {
				endGame = true;
			}
		}
	}

	getBlockPosition(block: RussianSquareBlock) {
		let leftCol = random(0, block.col, false);
		let floorSec = this.floor.slice(leftCol, leftCol + block.col);

		//which col contacts
		let minFloor = this.row;
		let contactCol = -1;

		console.log("floorSec", floorSec);
		console.log("block.bottom", block.bottom);

		for (let i = 0; i < block.col; i++) {
			let success = true;
			let floor = floorSec[i];
			let bottom = block.bottom[i];

			for (let j = 0; j < block.col; j++) {
				let f = floorSec[j];
				let b = block.bottom[j];
				if (f < floor - bottom + b) {
					success = false;
				}
			}
			console.log("i success", i, success);

			if (success && minFloor >= floor) {
				floor = minFloor;
				contactCol = i;
			}
		}

		let [bottomRow, bottomCol] = block.findBlockBottomRow();
		console.log("bottomCol", bottomCol);
		let moveToRow =
			floorSec[contactCol] +
			(block.bottom[bottomCol] - block.bottom[contactCol]);
		console.log("leftCol", leftCol);
		console.log("contactCol", contactCol);
		console.log("moveToRow", moveToRow);
		console.log("block.bottom", block.bottom);
		console.log("block.top", block.top);

		return {
			leftCol: leftCol,
			moveToRow: moveToRow,
			ymove: -block.row,
			contactCol: contactCol,
		};
	}

	addBlockToGameState(
		block: RussianSquareBlock,
		bottomRow: number,
		leftCol: number
	) {
		let delta = bottomRow - block.row;
		block.fillBlock.forEach((fb) => {
			this.gameBoard[delta + fb[0]][leftCol + fb[1]];
		});

		for (let i = leftCol; i < leftCol + block.col; i++) {
			this.floor[i] = bottomRow - (block.row - block.top[i - leftCol]);
		}
		console.log("this.floor", this.floor);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	RussianSquareBlock.prepareBlocks();
	let game = new RussianSquareGame(
		"russian_sqaure_div",
		"russian_sqaure_svg"
	);
});
