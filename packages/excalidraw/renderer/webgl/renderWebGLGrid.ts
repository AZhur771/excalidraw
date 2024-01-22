import * as PIXI from "pixi.js";
import { SmoothGraphics, DashLineShader } from "@pixi/graphics-smooth";
import { Zoom } from "../../types";
import { GridLineColor } from "../../scene/types";

export const renderWebGLGrid = (
  container: PIXI.Container,
  gridSize: number,
  scrollX: number,
  scrollY: number,
  zoom: Zoom,
  width: number,
  height: number,
) => {
  const BOLD_LINE_FREQUENCY = 5;

  const offsetX =
    -Math.round(zoom.value / gridSize) * gridSize + (scrollX % gridSize);
  const offsetY =
    -Math.round(zoom.value / gridSize) * gridSize + (scrollY % gridSize);

  const lineWidth = Math.min(1 / zoom.value, 1);

  const spaceWidth = 1 / zoom.value;

  const shader = new DashLineShader({
    dash: lineWidth * 3,
    gap: spaceWidth + (lineWidth + spaceWidth),
  });

  for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
    const isBold =
      Math.round(x - scrollX) % (BOLD_LINE_FREQUENCY * gridSize) === 0;
    const line = new SmoothGraphics();
    line.position.set(x, offsetY - gridSize);
    line
      .lineStyle({
        width: lineWidth,
        color: isBold ? GridLineColor.Bold : GridLineColor.Regular,
        shader: isBold ? undefined : shader,
      })
      .moveTo(0, 0)
      .lineTo(0, offsetY + height + gridSize * 2);
    container.addChild(line as PIXI.DisplayObject);
  }

  for (let y = offsetY; y < offsetY + height + gridSize * 2; y += gridSize) {
    const isBold =
      Math.round(y - scrollY) % (BOLD_LINE_FREQUENCY * gridSize) === 0;
    const line = new SmoothGraphics();
    line.position.set(offsetX - gridSize, y);
    line
      .lineStyle({
        width: lineWidth,
        color: isBold ? GridLineColor.Bold : GridLineColor.Regular,
        shader: isBold ? undefined : shader,
      })
      .moveTo(0, 0)
      .lineTo(offsetX + width + gridSize * 2, 0);
    container.addChild(line as PIXI.DisplayObject);
  }
};
