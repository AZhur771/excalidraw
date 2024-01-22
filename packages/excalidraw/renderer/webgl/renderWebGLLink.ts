import * as PIXI from "pixi.js";
import {
  ExcalidrawElement,
  NonDeletedExcalidrawElement,
} from "../../element/types";
import { StaticCanvasAppState } from "../../types";
import { sceneCoordsToViewportCoords } from "../../utils";
import {
  EXTERNAL_LINK_IMG,
  getLinkHandleFromCoords,
} from "../../element/Hyperlink";
import { getElementAbsoluteCoords } from "../../element";

const linkTexture = PIXI.Texture.from(EXTERNAL_LINK_IMG);

const linkCache = new WeakMap<
  ExcalidrawElement,
  PIXI.Sprite & { zoom: number }
>();

export const renderLinkIcon = (
  element: NonDeletedExcalidrawElement,
  container: PIXI.Container,
  appState: StaticCanvasAppState,
) => {
  if (element.link && !appState.selectedElementIds[element.id]) {
    const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
    const [x, y, width, height] = getLinkHandleFromCoords(
      [x1, y1, x2, y2],
      element.angle,
      appState,
    );

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const centerX = x + halfWidth;
    const centerY = y + halfHeight;

    const elementCoords = sceneCoordsToViewportCoords(
      { sceneX: centerX, sceneY: centerY },
      appState,
    );

    elementCoords.x = elementCoords.x / appState.zoom.value;
    elementCoords.y = elementCoords.y / appState.zoom.value;

    let link = linkCache.get(element);
    if (!link) {
      link = new PIXI.Sprite(linkTexture) as PIXI.Sprite & { zoom: number };
      link.zoom = appState.zoom.value;
      link.anchor.set(0.5, 0.5);
      container.addChild(link as PIXI.DisplayObject);
      linkCache.set(element, link);
    }

    link.position.set(elementCoords.x, elementCoords.y);
    link.width = height;
    link.height = width;
    link.rotation = element.angle;
    link.visible = true;
    link.renderable = true;
  } else {
    const link = linkCache.get(element);

    if (link) {
      link.visible = false;
      link.renderable = false;
    }
  }
};
