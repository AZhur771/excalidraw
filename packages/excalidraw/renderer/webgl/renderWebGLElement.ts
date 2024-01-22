import * as PIXI from "pixi.js";
import { SVGScene } from "@pixi-essentials/svg";
import { SmoothGraphics, DashLineShader } from "@pixi/graphics-smooth";
import {
  ExcalidrawElement,
  ExcalidrawImageElement,
  ExcalidrawTextElement,
  NonDeletedExcalidrawElement,
} from "../../element/types";
import { StaticCanvasRenderConfig } from "../../scene/types";
import { StaticCanvasAppState } from "../../types";
import { ShapeCache } from "../../scene/ShapeCache";
import {
  IMAGE_ERROR_PLACEHOLDER_IMG,
  IMAGE_PLACEHOLDER_IMG,
  pathsStringCache,
} from "../renderElement";
import { sceneCoordsToViewportCoords } from "../../utils";
import {
  isInitializedImageElement,
  isMagicFrameElement,
} from "../../element/typeChecks";
import { FONT_FAMILY, FRAME_STYLE } from "../../constants";
import { Drawable } from "roughjs/bin/core";
import { isPathALoop } from "../../math";

export const displayObjectCache = new WeakMap<
  ExcalidrawElement,
  PIXI.DisplayObject
>();

export const freedrawLoopCache = new WeakMap<
  ExcalidrawElement,
  PIXI.DisplayObject
>();

const DEFAULT_SPRITE_MARGIN = 10;

const getSpriteMargin = (element: ExcalidrawElement) => {
  let factor = 1;

  if (element.roughness) {
    factor += 1;
  }

  if (
    element.type === "arrow" &&
    (element.startArrowhead || element.endArrowhead)
  ) {
    factor += 1;
  }

  if (element.type === "arrow" && element.roundness) {
    factor += 2;
  }

  return factor * DEFAULT_SPRITE_MARGIN;
};

export const clearElementCache = (element: ExcalidrawElement) => {
  const displayObj = displayObjectCache.get(element);
  if (displayObj && !displayObj.destroyed) {
    displayObj.destroy(true);
  }
  displayObjectCache.delete(element);

  const loop = freedrawLoopCache.get(element);
  if (loop && !loop.destroyed) {
    loop.destroy(true);
  }
  freedrawLoopCache.delete(element);
};

const getStrokeStyleShader = (
  strokeStyle: ExcalidrawElement["strokeStyle"],
  strokeWidth: ExcalidrawElement["strokeWidth"],
) => {
  switch (strokeStyle) {
    case "dashed":
      return new DashLineShader({
        dash: 8 * strokeWidth,
        gap: 8 + strokeWidth,
      });
    case "dotted":
      return new DashLineShader({
        dash: 1.5 * strokeWidth,
        gap: 6 + strokeWidth,
      });
    default:
  }
};

const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
svgEl.appendChild(pathEl);

const setFreedrawStrokeColorAndPath = (
  strokeColor: string,
  path: string,
  width: number,
  height: number,
) => {
  svgEl.setAttributeNS("http://www.w3.org/2000/svg", "stroke", strokeColor);
  svgEl.setAttributeNS("http://www.w3.org/2000/svg", "fill", strokeColor);
  svgEl.setAttributeNS(
    "http://www.w3.org/2000/svg",
    "viewport",
    `0 0 ${width} ${height}`,
  );
  pathEl.setAttributeNS(null, "d", path);
};

const renderImagePlaceholder = (
  element: ExcalidrawImageElement,
  container: PIXI.Container,
  elementCoords: { x: number; y: number },
  elementHalfWidth: number,
  elementHalfHeight: number,
  alpha: number,
) => {
  let placeholder = displayObjectCache.get(element) as PIXI.Graphics;
  if (!placeholder) {
    placeholder = new PIXI.Graphics();
    container.addChild(placeholder as PIXI.DisplayObject);
    displayObjectCache.set(element, placeholder as PIXI.DisplayObject);
  } else {
    placeholder.clear();
    const children = placeholder.removeChildren();
    for (const child of children) {
      child.destroy();
    }
  }

  placeholder
    .beginFill("#E7E7E7", alpha)
    .drawRect(
      -elementHalfWidth,
      -elementHalfHeight,
      element.width,
      element.height,
    )
    .endFill();

  const imageMinWidthOrHeight = Math.min(element.width, element.height);
  const size = Math.min(
    imageMinWidthOrHeight,
    Math.min(imageMinWidthOrHeight * 0.4, 100),
  );
  const img =
    element.status === "error"
      ? IMAGE_ERROR_PLACEHOLDER_IMG
      : IMAGE_PLACEHOLDER_IMG;
  const texture = PIXI.Texture.from(img.src);
  const sprite = new PIXI.Sprite(texture);
  sprite.width = size;
  sprite.height = size;
  sprite.anchor.set(0.5);
  placeholder.addChild(sprite as PIXI.DisplayObject);

  placeholder.position.set(
    elementCoords.x + elementHalfWidth,
    elementCoords.y + elementHalfHeight,
  );
  placeholder.rotation = element.angle;
  placeholder.alpha = alpha;
};

const getFontFamily = (fontFamily: ExcalidrawTextElement["fontFamily"]) => {
  switch (fontFamily) {
    case FONT_FAMILY.Virgil:
      return "Virgil";
    case FONT_FAMILY.Helvetica:
      return "Helvetica";
    case FONT_FAMILY.Cascadia:
      return "Cascadia";
    case FONT_FAMILY.Assistant:
      return "Assistant";
  }
};

const _renderSets = (
  sets: Drawable["sets"],
  element: ExcalidrawElement,
  graphics: SmoothGraphics,
  offset: { x: number; y: number },
) => {
  const alpha = element.opacity / 100;
  const isBackgroundTransparent = element.backgroundColor === "transparent";

  for (const set of sets) {
    if (set.type === "fillPath" && !isBackgroundTransparent) {
      graphics.beginFill(
        element.type === "arrow"
          ? element.strokeColor
          : element.backgroundColor,
        alpha,
      );
      for (const { op, data } of set.ops) {
        if (op === "move") {
          graphics.moveTo(data[0] - offset.x, data[1] - offset.y);
        } else if (op === "lineTo") {
          graphics.lineTo(data[0] - offset.x, data[1] - offset.y);
        } else if (op === "bcurveTo") {
          graphics.bezierCurveTo(
            data[0] - offset.x,
            data[1] - offset.y,
            data[2] - offset.x,
            data[3] - offset.y,
            data[4] - offset.x,
            data[5] - offset.y,
          );
        }
      }
      graphics.closePath();
      graphics.endFill();
    } else if (set.type === "fillSketch" && !isBackgroundTransparent) {
      graphics.lineStyle({
        width: element.strokeWidth,
        color: element.backgroundColor,
        alpha,
      });
      for (const { op, data } of set.ops) {
        if (op === "move") {
          graphics.moveTo(data[0] - offset.x, data[1] - offset.y);
        } else if (op === "lineTo") {
          graphics.lineTo(data[0] - offset.x, data[1] - offset.y);
        } else if (op === "bcurveTo") {
          graphics.bezierCurveTo(
            data[0] - offset.x,
            data[1] - offset.y,
            data[2] - offset.x,
            data[3] - offset.y,
            data[4] - offset.x,
            data[5] - offset.y,
          );
        }
      }
    } else if (set.type === "path") {
      graphics.lineStyle({
        color: element.strokeColor,
        width: element.strokeWidth,
        alpha,
        cap: PIXI.LINE_CAP.ROUND,
        join: PIXI.LINE_JOIN.ROUND,
        shader: getStrokeStyleShader(element.strokeStyle, element.strokeWidth),
      });
      for (const { op, data } of set.ops) {
        if (op === "move") {
          graphics.moveTo(data[0] - offset.x, data[1] - offset.y);
        } else if (op === "lineTo") {
          graphics.lineTo(data[0] - offset.x, data[1] - offset.y);
        } else if (op === "bcurveTo") {
          graphics.bezierCurveTo(
            data[0] - offset.x,
            data[1] - offset.y,
            data[2] - offset.x,
            data[3] - offset.y,
            data[4] - offset.x,
            data[5] - offset.y,
          );
        }
      }
    }
  }
};

const _renderSprite = (
  element: ExcalidrawElement,
  renderer: PIXI.IRenderer,
  region?: PIXI.Rectangle,
  offset: { x: number; y: number } = { x: 0, y: 0 },
  cache?: WeakMap<ExcalidrawElement, PIXI.DisplayObject>,
): PIXI.Sprite => {
  const graphics = new SmoothGraphics();

  const shape = ShapeCache.get(element)!;

  if (Array.isArray(shape)) {
    for (const _shape of shape) {
      _renderSets(_shape.sets, element, graphics, offset);
    }
  } else {
    _renderSets(shape.sets, element, graphics, offset);
  }

  const sprite = (cache ?? displayObjectCache).get(element);
  if (sprite && !sprite.destroyed) {
    sprite.destroy(true);
  }

  const texture = renderer.generateTexture(graphics, {
    width: element.width,
    height: element.height,
    region,
  });
  graphics.destroy();

  return new PIXI.Sprite(texture);
};

export const renderWebGLElement = (
  element: NonDeletedExcalidrawElement,
  container: PIXI.Container,
  pixi: PIXI.Application,
  renderConfig: StaticCanvasRenderConfig,
  appState: StaticCanvasAppState,
): void => {
  const elementCoords = sceneCoordsToViewportCoords(
    { sceneX: element.x, sceneY: element.y },
    appState,
  );
  elementCoords.x = elementCoords.x / appState.zoom.value;
  elementCoords.y = elementCoords.y / appState.zoom.value;

  const elementHalfWidth = element.width / 2;
  const elementHalfHeight = element.height / 2;

  const alpha = element.opacity / 100;

  const spriteMargin = getSpriteMargin(element);
  const widthWithMargin = element.width + spriteMargin * 2;
  const heightWithMargin = element.height + spriteMargin * 2;

  switch (element.type) {
    case "frame":
    case "magicframe":
      if (appState.frameRendering.enabled && appState.frameRendering.outline) {
        const lineWidth = FRAME_STYLE.strokeWidth / appState.zoom.value;
        const fillColor = "rgba(0, 0, 200, 0.04)";
        let strokeColor = FRAME_STYLE.strokeColor;

        // TODO change later to only affect AI frames
        if (isMagicFrameElement(element)) {
          strokeColor = appState.theme === "light" ? "#7affd7" : "#1d8264";
        }

        let frame = displayObjectCache.get(element) as PIXI.Graphics;
        if (
          !frame ||
          element.width !== frame.width ||
          element.height !== frame.height ||
          element.idx !== frame.zIndex
        ) {
          frame?.clear();
          frame = new PIXI.Graphics();
          frame.zIndex = element.idx ?? 0;
          frame
            .lineStyle({
              color: strokeColor,
              width: lineWidth,
              cap: PIXI.LINE_CAP.ROUND,
              join: PIXI.LINE_JOIN.ROUND,
              alpha,
            })
            .beginFill(fillColor)
            .drawRoundedRect(
              0,
              0,
              element.width,
              element.height,
              FRAME_STYLE.radius ? FRAME_STYLE.radius / appState.zoom.value : 0,
            )
            .endFill();

          container.addChild(frame as PIXI.DisplayObject);
          displayObjectCache.set(element, frame as PIXI.DisplayObject);
        }

        frame.position.set(elementCoords.x, elementCoords.y);
        frame.height = element.height;
        frame.width = element.width;
      }
      break;
    case "rectangle":
    case "embeddable":
    case "diamond":
    case "ellipse":
      let objSprite = displayObjectCache.get(element) as PIXI.Sprite;
      if (
        !objSprite ||
        widthWithMargin !== objSprite.width ||
        heightWithMargin !== objSprite.height ||
        element.idx !== objSprite.zIndex
      ) {
        ShapeCache.generateElementShape(element, renderConfig);
        objSprite = _renderSprite(
          element,
          pixi.renderer,
          new PIXI.Rectangle(0, 0, widthWithMargin, heightWithMargin),
          {
            x: -spriteMargin,
            y: -spriteMargin,
          },
        );
        objSprite.anchor.set(0.5, 0.5);
        objSprite.zIndex = element.idx ?? 0;
        displayObjectCache.set(element, objSprite as PIXI.DisplayObject);
        container.addChild(objSprite as PIXI.DisplayObject);
      }

      objSprite.position.set(
        elementCoords.x + elementHalfWidth,
        elementCoords.y + elementHalfHeight,
      );
      objSprite.width = widthWithMargin;
      objSprite.height = heightWithMargin;
      objSprite.rotation = element.angle;
      break;
    case "line":
    case "arrow":
      let lineSprite = displayObjectCache.get(element) as PIXI.Sprite & {
        pathHash?: number;
      };

      const lineOffsetX = Math.min(...element.points.map((p) => p[0]));
      const lineOffsetY = Math.min(...element.points.map((p) => p[1]));

      const oldLinePathHash = lineSprite?.pathHash;
      const newLinePathHash = element.points.reduce(
        (acc, [p1, p2]) => acc + p1 + p2,
        0,
      );

      if (
        !lineSprite ||
        widthWithMargin !== lineSprite.width ||
        heightWithMargin !== lineSprite.height ||
        element.idx !== lineSprite.zIndex ||
        newLinePathHash !== oldLinePathHash
      ) {
        ShapeCache.generateElementShape(element, renderConfig);
        lineSprite = _renderSprite(
          element,
          pixi.renderer,
          new PIXI.Rectangle(0, 0, widthWithMargin, heightWithMargin),
          {
            x: lineOffsetX - spriteMargin,
            y: lineOffsetY - spriteMargin,
          },
        );
        lineSprite.zIndex = element.idx ?? 0;
        lineSprite.anchor.set(0.5, 0.5);
        lineSprite.pathHash = newLinePathHash;
        displayObjectCache.set(element, lineSprite as PIXI.DisplayObject);
        container.addChild(lineSprite as PIXI.DisplayObject);
      }

      lineSprite.position.set(
        elementCoords.x + elementHalfWidth + lineOffsetX,
        elementCoords.y + elementHalfHeight + lineOffsetY,
      );
      lineSprite.width = widthWithMargin;
      lineSprite.height = heightWithMargin;
      lineSprite.rotation = element.angle;
      break;
    case "freedraw":
      let freedraw = displayObjectCache.get(element) as SVGScene & {
        pathHash?: number;
      };

      const freedrawOffsetX = Math.min(...element.points.map((p) => p[0]));
      const freedrawOffsetY = Math.min(...element.points.map((p) => p[1]));

      const oldFreedrawPathHash = freedraw?.pathHash;
      const newFreedrawPathHash = element.points.reduce(
        (acc, [p1, p2]) => acc + p1 + p2,
        0,
      );

      let loop = freedrawLoopCache.get(element) as PIXI.Sprite;

      if (
        !freedraw ||
        element.idx !== freedraw.zIndex ||
        oldFreedrawPathHash !== newFreedrawPathHash
      ) {
        ShapeCache.generateElementShape(element, renderConfig);

        if (isPathALoop(element.points)) {
          if (
            !loop ||
            widthWithMargin !== loop.width ||
            heightWithMargin !== loop.height ||
            element.idx !== loop.zIndex ||
            oldFreedrawPathHash !== newFreedrawPathHash
          ) {
            loop = _renderSprite(
              element,
              pixi.renderer,
              new PIXI.Rectangle(0, 0, widthWithMargin, heightWithMargin),
              {
                x: freedrawOffsetX - spriteMargin,
                y: freedrawOffsetY - spriteMargin,
              },
              freedrawLoopCache,
            );
            loop.zIndex = element.idx ?? 0;
            loop.anchor.set(0.5, 0.5);
            freedrawLoopCache.set(element, loop as PIXI.DisplayObject);
            container.addChild(loop as PIXI.DisplayObject);
          }
        }

        const svgPathData = pathsStringCache.get(element)!;

        setFreedrawStrokeColorAndPath(
          element.strokeColor,
          svgPathData,
          element.width,
          element.height,
        );
        freedraw?.destroy();
        freedraw = new SVGScene(svgEl);
        freedraw.zIndex = element.idx ?? 0;
        freedraw.pivot.set(
          elementHalfWidth + freedrawOffsetX,
          elementHalfHeight + freedrawOffsetY,
        );
        freedraw.pathHash = newFreedrawPathHash;
        displayObjectCache.set(element, freedraw);
        container.addChild(freedraw as PIXI.DisplayObject);
      }

      if (loop) {
        loop.position.set(
          elementCoords.x + elementHalfWidth + freedrawOffsetX,
          elementCoords.y + elementHalfHeight + freedrawOffsetY,
        );
        loop.width = widthWithMargin;
        loop.height = heightWithMargin;
        loop.rotation = element.angle;
      }

      freedraw.position.set(
        elementCoords.x + elementHalfWidth + freedrawOffsetX,
        elementCoords.y + elementHalfHeight + freedrawOffsetY,
      );
      freedraw.rotation = element.angle;
      freedraw.alpha = alpha;
      break;
    case "text":
      let text = displayObjectCache.get(element) as PIXI.Text;
      if (!text || element.idx !== text.zIndex) {
        text = new PIXI.Text(element.text, {
          fontFamily: getFontFamily(element.fontFamily),
          fontSize: element.fontSize,
          fill: element.strokeColor,
          align: element.textAlign! as PIXI.TextStyleAlign,
        });
        text.zIndex = element.idx ?? 0;
        container.addChild(text as PIXI.DisplayObject);
        displayObjectCache.set(element, text as PIXI.DisplayObject);
      }

      text.position.set(
        elementCoords.x + elementHalfWidth,
        elementCoords.y + elementHalfHeight - 3,
      );
      text.anchor.set(0.5);
      text.rotation = element.angle;
      text.height = element.height;
      text.width = element.width;
      text.alpha = alpha;
      break;
    case "image":
      const img = isInitializedImageElement(element)
        ? renderConfig.imageCache.get(element.fileId)?.image
        : undefined;
      if (img != null && !(img instanceof Promise)) {
        let sprite = displayObjectCache.get(element) as PIXI.Sprite;
        if (
          !sprite ||
          (element as NonDeletedExcalidrawElement).idx !== sprite.zIndex
        ) {
          const texture = PIXI.Texture.from(img.src);
          sprite?.destroy();
          sprite = new PIXI.Sprite(texture);
          sprite.zIndex = (element as NonDeletedExcalidrawElement).idx ?? 0;
          sprite.anchor.set(0.5);
          displayObjectCache.set(element, sprite as PIXI.DisplayObject);
          container.addChild(sprite as PIXI.DisplayObject);
        }
        sprite.position.set(
          elementCoords.x + elementHalfWidth,
          elementCoords.y + elementHalfHeight,
        );
        sprite.rotation = element.angle;
        sprite.height = element.height;
        sprite.width = element.width;
        sprite.alpha = alpha;
      } else {
        renderImagePlaceholder(
          element,
          container,
          elementCoords,
          elementHalfWidth,
          elementHalfHeight,
          alpha,
        );
      }
      break;
    default:
      // @ts-ignore
      throw new Error(`Unimplemented type ${element.type}`);
  }
};
