import * as PIXI from "pixi.js";
import { SVGScene } from "@pixi-essentials/svg";
import {
  SmoothGraphics,
  DashLineShader,
  LINE_SCALE_MODE,
} from "@pixi/graphics-smooth";
import {
  ExcalidrawElement,
  ExcalidrawImageElement,
  ExcalidrawTextElement,
  NonDeletedExcalidrawElement,
} from "../../element/types";
import { StaticCanvasRenderConfig } from "../../scene/types";
import { StaticCanvasAppState, Zoom } from "../../types";
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
import { fastRound, isPathALoop } from "../../math";
import { getElementBoundsWithZeroRotation } from "../../element/bounds";
import { getBoundTextElement } from "../../element/textElement";

export const displayObjectCache = new WeakMap<
  ExcalidrawElement,
  PIXI.DisplayObject
>();

export const freedrawLoopCache = new WeakMap<
  ExcalidrawElement,
  PIXI.DisplayObject
>();

const maskCache = new WeakMap<ExcalidrawElement, PIXI.Sprite>();
const frameCache = new WeakMap<ExcalidrawElement, PIXI.Sprite>();

const generateReverseMaskFilter = () => {
  return new PIXI.SpriteMaskFilter(
    undefined,
    `
  varying vec2 vMaskCoord;
  varying vec2 vTextureCoord;
  
  uniform sampler2D uSampler;
  uniform sampler2D mask;
  uniform float alpha;
  uniform float npmAlpha;
  uniform vec4 maskClamp;
  
  void main(void)
  {
    float clip = step(3.5,
    step(maskClamp.x, vMaskCoord.x) +
    step(maskClamp.y, vMaskCoord.y) +
    step(vMaskCoord.x, maskClamp.z) +
    step(vMaskCoord.y, maskClamp.w));
  
    vec4 original = texture2D(uSampler, vTextureCoord);
    vec4 masky = texture2D(mask, vMaskCoord);
    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);
  
    original *= 1.0 - (alphaMul * masky.r * alpha * clip);
  
    gl_FragColor = original;
  }
  `,
  );
};

const DEFAULT_SPRITE_MARGIN = 10;

export const clearElementCache = (element: ExcalidrawElement) => {
  const displayObj = displayObjectCache.get(element);
  if (displayObj && !displayObj.destroyed) {
    displayObj.destroy(true);
  }
  displayObjectCache.delete(element);

  const mask = maskCache.get(element);
  if (mask && !mask.destroyed) {
    mask.destroy(true);
  }
  maskCache.delete(element);

  const frame = frameCache.get(element);
  if (frame && !frame.destroyed) {
    frame.destroy(true);
  }
  frameCache.delete(element);

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
  dimensions: {
    x: number;
    y: number;
    width: number;
    height: number;
    halfWidth: number;
    halfHeight: number;
  },
  alpha: number,
  container?: PIXI.Container,
) => {
  let placeholder = displayObjectCache.get(element) as PIXI.Graphics;
  if (!placeholder) {
    placeholder = new PIXI.Graphics();
    displayObjectCache.set(element, placeholder as PIXI.DisplayObject);
    container?.addChild(placeholder as PIXI.DisplayObject);
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
      -dimensions.halfWidth,
      -dimensions.halfHeight,
      dimensions.width,
      dimensions.height,
    )
    .endFill();

  const imageMinWidthOrHeight = Math.min(dimensions.width, dimensions.height);
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
    dimensions.x + dimensions.halfWidth,
    dimensions.y + dimensions.halfHeight,
  );
  placeholder.rotation = element.angle;
  placeholder.alpha = alpha;
  placeholder.mask = null;
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
  const isBackgroundTransparent =
    element.backgroundColor === "transparent" && element.type !== "arrow";

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
        scaleMode: LINE_SCALE_MODE.NORMAL,
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
  resolution?: number,
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
    resolution,
  });
  graphics.destroy();

  return new PIXI.Sprite(texture);
};

export const generateArrowTextInverseMask = (
  textElement: ExcalidrawElement,
  arrow: ExcalidrawElement,
  dimensions: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  appState: {
    shouldCacheIgnoreZoom: boolean;
  },
  container?: PIXI.Container,
) => {
  let mask = maskCache.get(textElement);
  if (!mask) {
    mask = new PIXI.Sprite(PIXI.Texture.WHITE);
    maskCache.set(textElement, mask);
    container?.addChild(mask as PIXI.DisplayObject);
  }
  mask.width = dimensions.width;
  mask.height = dimensions.height;
  mask.position.set(dimensions.x, dimensions.y);
  const sprite = displayObjectCache.get(arrow)!;
  if (appState.shouldCacheIgnoreZoom) {
    mask.visible = false;
    sprite.filters = [];
  } else {
    mask.visible = true;
    const filter = generateReverseMaskFilter();
    filter.maskSprite = mask;
    sprite.filters = [filter];
  }
};

export const generateFrameMask = (
  frame: ExcalidrawElement,
  renderer: PIXI.IRenderer,
  dimensions: {
    x: number;
    y: number;
    width: number;
    height: number;
    halfWidth: number;
    halfHeight: number;
    stokeWidth: number;
  },
  container: PIXI.Container & { resolution?: number },
) => {
  const graphics = new PIXI.Graphics();

  const width = dimensions.width - 2 * dimensions.stokeWidth;
  const height = dimensions.height - 2 * dimensions.stokeWidth;

  graphics
    .beginFill("#ffffff")
    .drawRoundedRect(
      dimensions.stokeWidth,
      dimensions.stokeWidth,
      width,
      height,
      FRAME_STYLE.radius
        ? FRAME_STYLE.radius / (container.resolution ?? 0.1)
        : 0,
    )
    .endFill();

  const texture = renderer.generateTexture(graphics, {
    width,
    height,
    resolution: container.resolution,
  });
  graphics.destroy();

  const mask = new PIXI.Sprite(texture);
  mask.anchor.set(0.5, 0.5);

  maskCache.set(frame, mask);
  container.addChild(mask as PIXI.DisplayObject);

  container.mask = mask;
};

const shouldRegenerateSprite = (
  sprite:
    | (PIXI.Sprite & { resolution?: number; frameId?: string | null })
    | undefined,
  element: ExcalidrawElement & { idx?: number },
  newSpriteDims: { width: number; height: number },
  resolution: number,
  frameId: string | null,
) => {
  return (
    !sprite ||
    sprite.frameId !== frameId ||
    sprite.resolution !== resolution ||
    fastRound(newSpriteDims.width) !== fastRound(sprite.width) ||
    fastRound(newSpriteDims.height) !== fastRound(sprite.height) ||
    element.idx !== sprite.zIndex
  );
};

const getViewportCoord = (
  element: { x: number; y: number },
  appState: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
  },
) => {
  const elementCoords = sceneCoordsToViewportCoords(
    { sceneX: element.x, sceneY: element.y },
    appState,
  );
  elementCoords.x = elementCoords.x / appState.zoom.value;
  elementCoords.y = elementCoords.y / appState.zoom.value;

  return elementCoords;
};

export const getDimensions = (
  element: ExcalidrawElement,
  appState: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
  },
): number[] => {
  const bounds = getElementBoundsWithZeroRotation(element);
  const elementCoords = getViewportCoord(
    {
      x: bounds[0],
      y: bounds[1],
    },
    appState,
  );
  const width = bounds[2] - bounds[0];
  const height = bounds[3] - bounds[1];

  return [
    elementCoords.x,
    elementCoords.y,
    width,
    height,
    width / 2,
    height / 2,
    width + 2 * DEFAULT_SPRITE_MARGIN,
    height + 2 * DEFAULT_SPRITE_MARGIN,
  ];
};

export const renderWebGLElement = (
  element: NonDeletedExcalidrawElement,
  pixi: PIXI.Application,
  renderConfig: StaticCanvasRenderConfig,
  appState: StaticCanvasAppState,
  resolution: number,
  frameId: string | null,
  container?: PIXI.Container,
): void => {
  const [
    x,
    y,
    width,
    height,
    halfWidth,
    halfHeight,
    widthWithMargin,
    heightWithMargin,
  ] = getDimensions(element, appState);

  const alpha = element.opacity / 100;

  switch (element.type) {
    case "frame":
    case "magicframe":
      if (appState.frameRendering.enabled && appState.frameRendering.outline) {
        let displayObj = displayObjectCache.get(element) as PIXI.Sprite & {
          resolution?: number;
          frameId?: string | null;
        };

        let frame = frameCache.get(element);

        if (
          shouldRegenerateSprite(
            displayObj,
            element,
            {
              width: widthWithMargin,
              height: heightWithMargin,
            },
            resolution,
            frameId,
          ) ||
          !frame
        ) {
          const lineWidth = FRAME_STYLE.strokeWidth / resolution;

          const fillColor = "rgba(0, 0, 200, 0.04)";
          let strokeColor = FRAME_STYLE.strokeColor;

          // TODO change later to only affect AI frames
          if (isMagicFrameElement(element)) {
            strokeColor = appState.theme === "light" ? "#7affd7" : "#1d8264";
          }

          displayObj?.destroy();
          frame?.destroy();

          const graphics = new PIXI.Graphics();
          graphics
            .lineStyle({
              color: strokeColor,
              width: lineWidth,
              cap: PIXI.LINE_CAP.ROUND,
              join: PIXI.LINE_JOIN.ROUND,
              alpha,
            })
            .beginFill(fillColor)
            .drawRoundedRect(
              DEFAULT_SPRITE_MARGIN,
              DEFAULT_SPRITE_MARGIN,
              width,
              height,
              FRAME_STYLE.radius ? FRAME_STYLE.radius / resolution : 0,
            )
            .endFill();

          const texture = pixi.renderer.generateTexture(graphics, {
            width: element.width,
            height: element.height,
            region: new PIXI.Rectangle(0, 0, widthWithMargin, heightWithMargin),
            resolution,
          });
          graphics.destroy();

          displayObj = new PIXI.Sprite(texture);
          displayObj.anchor.set(0.5, 0.5);
          displayObj.zIndex = element.idx ?? 0;
          displayObj.resolution = resolution;
          displayObj.frameId = null;

          frame = new PIXI.Sprite(texture);
          frame.anchor.set(0.5, 0.5);
          frame.zIndex = element.idx ?? 0;

          displayObjectCache.set(element, displayObj as PIXI.DisplayObject);
          container?.addChild(displayObj as PIXI.DisplayObject);

          frameCache.set(element, frame);
          container?.addChild(frame as PIXI.DisplayObject);

          generateFrameMask(
            element,
            pixi.renderer,
            {
              x,
              y,
              width,
              height,
              halfHeight,
              halfWidth,
              stokeWidth: lineWidth,
            },
            displayObj,
          );
        }

        displayObj.position.set(x + halfWidth, y + halfHeight);
        displayObj.width = widthWithMargin;
        displayObj.height = heightWithMargin;

        frame.position.set(x + halfWidth, y + halfHeight);
        frame.width = widthWithMargin;
        frame.height = heightWithMargin;
      }
      break;
    case "rectangle":
    case "embeddable":
    case "diamond":
    case "ellipse":
      {
        let displayObj = displayObjectCache.get(element) as PIXI.Sprite & {
          resolution?: number;
          frameId?: string | null;
        };
        if (
          shouldRegenerateSprite(
            displayObj,
            element,
            {
              width: widthWithMargin,
              height: heightWithMargin,
            },
            resolution,
            frameId,
          )
        ) {
          ShapeCache.generateElementShape(element, renderConfig);
          displayObj = _renderSprite(
            element,
            pixi.renderer,
            new PIXI.Rectangle(0, 0, widthWithMargin, heightWithMargin),
            resolution,
            {
              x: -DEFAULT_SPRITE_MARGIN,
              y: -DEFAULT_SPRITE_MARGIN,
            },
          );
          displayObj.anchor.set(0.5, 0.5);
          displayObj.zIndex = element.idx ?? 0;
          displayObj.resolution = resolution;
          displayObj.frameId = frameId;
          displayObjectCache.set(element, displayObj as PIXI.DisplayObject);
          container?.addChild(displayObj as PIXI.DisplayObject);
        }
        displayObj.position.set(x + halfWidth, y + halfHeight);
        displayObj.width = widthWithMargin;
        displayObj.height = heightWithMargin;
        displayObj.rotation = element.angle;
        displayObj.mask = null;
      }
      break;
    case "line":
    case "arrow":
      {
        let displayObj = displayObjectCache.get(element) as PIXI.Sprite & {
          pathHash?: number;
          resolution?: number;
          frameId?: string | null;
        };

        const oldPathHash = displayObj?.pathHash;
        const newPathHash = element.points.reduce(
          (acc, [p1, p2]) => acc + p1 + p2,
          0,
        );

        if (
          shouldRegenerateSprite(
            displayObj,
            element,
            {
              width: widthWithMargin,
              height: heightWithMargin,
            },
            resolution,
            frameId,
          ) ||
          newPathHash !== oldPathHash
        ) {
          ShapeCache.generateElementShape(element, renderConfig);

          const elementCoords = getViewportCoord(element, appState);
          const offsetX = x - elementCoords.x;
          const offsetY = y - elementCoords.y;

          displayObj = _renderSprite(
            element,
            pixi.renderer,
            new PIXI.Rectangle(0, 0, widthWithMargin, heightWithMargin),
            resolution,
            {
              x: offsetX - DEFAULT_SPRITE_MARGIN,
              y: offsetY - DEFAULT_SPRITE_MARGIN,
            },
          );
          displayObj.anchor.set(0.5, 0.5);
          displayObj.zIndex = element.idx ?? 0;
          displayObj.resolution = resolution;
          displayObj.frameId = frameId;
          displayObj.pathHash = newPathHash;
          displayObjectCache.set(element, displayObj as PIXI.DisplayObject);
          container?.addChild(displayObj as PIXI.DisplayObject);
        }

        displayObj.position.set(x + halfWidth, y + halfHeight);
        displayObj.width = widthWithMargin;
        displayObj.height = heightWithMargin;
        displayObj.rotation = element.angle;
        displayObj.mask = null;
        displayObj.filters = [];

        const boundTextElement = getBoundTextElement(element);
        if (boundTextElement) {
          const [x, y, width, height] = getDimensions(
            boundTextElement,
            appState,
          );

          generateArrowTextInverseMask(
            boundTextElement,
            element,
            {
              x: x - DEFAULT_SPRITE_MARGIN / 2,
              y: y - DEFAULT_SPRITE_MARGIN / 2,
              width: width + DEFAULT_SPRITE_MARGIN,
              height: height + DEFAULT_SPRITE_MARGIN,
            },
            appState,
            container,
          );
        }
      }
      break;
    case "freedraw":
      {
        let displayObj = displayObjectCache.get(element) as SVGScene & {
          pathHash?: number;
          resolution?: number;
          frameId?: string | null;
        };

        let loop = freedrawLoopCache.get(element) as PIXI.Sprite & {
          resolution?: number;
          frameId?: string | null;
        };

        const oldPathHash = displayObj?.pathHash;
        const newPathHash = element.points.reduce(
          (acc, [p1, p2]) => acc + p1 + p2,
          0,
        );

        if (
          !displayObj ||
          displayObj.resolution !== resolution ||
          element.idx !== displayObj.zIndex ||
          oldPathHash !== newPathHash
        ) {
          ShapeCache.generateElementShape(element, renderConfig);

          const elementCoords = getViewportCoord(element, appState);
          const offsetX = x - elementCoords.x;
          const offsetY = y - elementCoords.y;

          if (isPathALoop(element.points)) {
            if (
              shouldRegenerateSprite(
                loop,
                element,
                {
                  width: widthWithMargin,
                  height: heightWithMargin,
                },
                resolution,
                frameId,
              ) ||
              oldPathHash !== newPathHash
            ) {
              loop = _renderSprite(
                element,
                pixi.renderer,
                new PIXI.Rectangle(0, 0, widthWithMargin, heightWithMargin),
                resolution,
                {
                  x: offsetX - DEFAULT_SPRITE_MARGIN,
                  y: offsetY - DEFAULT_SPRITE_MARGIN,
                },
                freedrawLoopCache,
              );
              loop.anchor.set(0.5, 0.5);
              loop.zIndex = element.idx ?? 0;
              loop.resolution = resolution;
              loop.frameId = frameId;
              freedrawLoopCache.set(element, loop as PIXI.DisplayObject);
              container?.addChild(loop as PIXI.DisplayObject);
            }
          }

          const svgPathData = pathsStringCache.get(element)!;

          setFreedrawStrokeColorAndPath(
            element.strokeColor,
            svgPathData,
            width,
            height,
          );
          displayObj?.destroy();
          displayObj = new SVGScene(svgEl);
          displayObj.pivot.set(halfWidth + offsetX, halfHeight + offsetY);
          displayObj.zIndex = element.idx ?? 0;
          displayObj.resolution = resolution;
          displayObj.frameId = frameId;
          displayObj.pathHash = newPathHash;
          displayObjectCache.set(element, displayObj as PIXI.DisplayObject);
          container?.addChild(displayObj as PIXI.DisplayObject);
        }

        if (loop) {
          loop.position.set(x + halfWidth, y + halfHeight);
          loop.width = widthWithMargin;
          loop.height = heightWithMargin;
          loop.rotation = element.angle;
        }

        displayObj.position.set(x + halfWidth, y + halfHeight);
        displayObj.rotation = element.angle;
        displayObj.alpha = alpha;
        displayObj.mask = null;
      }
      break;
    case "text":
      {
        let displayObj = displayObjectCache.get(element) as PIXI.Text & {
          resolution?: number;
          frameId?: string | null;
        };
        if (
          shouldRegenerateSprite(
            displayObj,
            element,
            {
              width,
              height,
            },
            resolution,
            frameId,
          )
        ) {
          displayObj?.destroy();
          displayObj = new PIXI.Text(element.text, {
            fontFamily: getFontFamily(element.fontFamily),
            fontSize: element.fontSize,
            fill: element.strokeColor,
            align: element.textAlign! as PIXI.TextStyleAlign,
            padding: DEFAULT_SPRITE_MARGIN * 4,
            textBaseline: "bottom",
          });
          displayObj.zIndex = element.idx ?? 0;
          displayObj.resolution = resolution;
          displayObj.frameId = frameId;
          displayObjectCache.set(element, displayObj as PIXI.DisplayObject);
          container?.addChild(displayObj as PIXI.DisplayObject);
        }

        displayObj.position.set(x + halfWidth, y + halfHeight);
        displayObj.anchor.set(0.5, 0.45);
        displayObj.rotation = element.angle;
        displayObj.height = height;
        displayObj.width = width;
        displayObj.alpha = alpha;
        displayObj.mask = null;
      }
      break;
    case "image":
      {
        const img = isInitializedImageElement(element)
          ? renderConfig.imageCache.get(element.fileId)?.image
          : undefined;
        if (img != null && !(img instanceof Promise)) {
          let displayObj = displayObjectCache.get(element) as PIXI.Sprite & {
            frameId?: string | null;
          };
          if (
            !displayObj ||
            displayObj.frameId !== frameId ||
            displayObj.zIndex !== (element as NonDeletedExcalidrawElement).idx
          ) {
            const texture = PIXI.Texture.from(img.src);
            displayObj?.destroy();
            displayObj = new PIXI.Sprite(texture);
            displayObj.anchor.set(0.5);
            displayObj.zIndex =
              (element as NonDeletedExcalidrawElement).idx ?? 0;
            displayObj.frameId = frameId;
            displayObjectCache.set(element, displayObj as PIXI.DisplayObject);
            container?.addChild(displayObj as PIXI.DisplayObject);
          }
          displayObj.position.set(x + halfWidth, y + halfHeight);
          displayObj.rotation = element.angle;
          displayObj.height = height;
          displayObj.width = width;
          displayObj.alpha = alpha;
          displayObj.mask = null;
        } else {
          renderImagePlaceholder(
            element,
            {
              x,
              y,
              width,
              height,
              halfWidth,
              halfHeight,
            },
            alpha,
            container,
          );
        }
      }
      break;
    default:
      // @ts-ignore
      throw new Error(`Unimplemented type ${element.type}`);
  }
};
