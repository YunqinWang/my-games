import * as d3 from "d3";
import "../css/russian_square.scss";
class RussianSquare {
	svgId: string;
	chartSvg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
	svgWidth = 300;
	svgHeight = 600;
	margins = { top: 10, bottom: 10, left: 10, right: 10 };

	mainWidth = this.svgWidth - this.margins.left - this.margins.right;
	mainHeight = this.svgHeight - this.margins.top - this.margins.bottom;
	gridSize = 20;

	constructor(svgId: string) {
		this.svgId = svgId;
		this.chartSvg = this.createSvg();
		this.drawSvgGrid();
	}

	private createSvg() {
		let chartSvg = d3
			.select(`svg#${this.svgId}`)
			.attr("width", this.svgWidth)
			.attr("height", this.svgHeight);
		return chartSvg;
	}

	private drawSvgGrid() {
		let mainChart = this.chartSvg
			.append("g")
			.attr(
				"transform",
				`translate(${this.margins.left},${this.margins.top})`
			);

		mainChart
			.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", this.mainWidth)
			.attr("height", this.mainHeight)
			.attr("fill", "#D2D2D2");

		let horizontalData = Array(this.mainHeight / this.gridSize)
			.fill(1)
			.map((_, index) => {
				return index * this.gridSize;
			});
		mainChart
			.selectAll(".grid-line-h")
			.data(horizontalData)
			.join(function (enter) {
				return enter.append("line").attr("stroke", "#fff");
			})
			.attr("x1", 0)
			.attr("y1", (d) => d)
			.attr("x2", this.mainWidth)
			.attr("y2", (d) => d);

		let verticalData = Array(this.mainWidth / this.gridSize)
			.fill(1)
			.map((_, index) => {
				return index * this.gridSize;
			});
		mainChart
			.selectAll(".grid-line-v")
			.data(verticalData)
			.join(function (enter) {
				return enter.append("line").attr("stroke", "#fff");
			})
			.attr("x1", (d) => d)
			.attr("y1", 0)
			.attr("x2", (d) => d)
			.attr("y2", this.mainHeight);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	let game = new RussianSquare("russian_sqaure_svg");
});
