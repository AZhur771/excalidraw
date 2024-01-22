import * as PIXI from "pixi.js";
import { StaticCanvasRenderConfig } from "../../scene/types";
import { AppState, StaticCanvasAppState } from "../../types";
import { COLOR_PALETTE } from "../../colors";

export const prepareWebGLCanvas = ({
  pixi,
  canvas,
  scale,
  theme,
  isExporting,
  viewBackgroundColor,
}: {
  pixi: PIXI.Application;
  canvas: HTMLCanvasElement;
  normalizedWidth: number;
  normalizedHeight: number;
  scale: number;
  theme?: AppState["theme"];
  isExporting?: StaticCanvasRenderConfig["isExporting"];
  viewBackgroundColor?: StaticCanvasAppState["viewBackgroundColor"];
}): {
  gridContainer: PIXI.Container;
  elementsContainer: PIXI.Container;
} => {
  const gridContainer = pixi.stage.getChildAt(0) as PIXI.Container;
  const elementsContainer = pixi.stage.getChildAt(1) as PIXI.Container;

  // Clear grid
  const children = gridContainer.removeChildren();
  for (const child of children) {
    child.destroy();
  }

  if (viewBackgroundColor) {
    pixi.renderer.background.color = viewBackgroundColor;
  } else {
    pixi.renderer.background.color = COLOR_PALETTE.white;
  }

  return {
    gridContainer,
    elementsContainer,
  };
};
