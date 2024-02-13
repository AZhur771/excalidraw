import * as PIXI from "pixi.js";
import {
  createPlaceholderEmbeddableLabel,
  isIframeLikeOrItsLabel,
} from "../../element/embeddable";
import {
  isEmbeddableElement,
  isIframeLikeElement,
} from "../../element/typeChecks";
import { ExcalidrawElement } from "../../element/types";
import {
  elementOverlapsWithFrame,
  getTargetFrame,
  isElementInFrame,
} from "../../frame";
import { StaticWebGLSceneRenderConfig } from "../../scene/types";
import { throttleRAF } from "../../utils";
import { getNormalizedCanvasDimensions } from "../renderScene";
import { prepareWebGLCanvas } from "./prepareWebGLCanvas";
import { displayObjectCache, renderWebGLElement } from "./renderWebGLElement";
import { renderWebGLGrid } from "./renderWebGLGrid";
import { renderLinkIcon } from "./renderWebGLLink";

const MIN_RESOLUTION = 0.1;
const MAX_RESOLUTION = 2;

const _renderStaticWebGLScene = ({
  canvas,
  pixi,
  elements,
  visibleElements,
  scale,
  appState,
  renderConfig,
}: StaticWebGLSceneRenderConfig) => {
  if (canvas === null) {
    return;
  }

  const [normalizedWidth, normalizedHeight] = getNormalizedCanvasDimensions(
    canvas,
    scale,
  );

  const { renderGrid = true, isExporting } = renderConfig;

  const groupsToBeAddedToFrame = new Set<string>();

  const resolution = appState.shouldCacheIgnoreZoom
    ? MIN_RESOLUTION
    : Math.min(appState.zoom.value, MAX_RESOLUTION);

  visibleElements.forEach((element) => {
    if (
      element.groupIds.length > 0 &&
      appState.frameToHighlight &&
      appState.selectedElementIds[element.id] &&
      (elementOverlapsWithFrame(element, appState.frameToHighlight) ||
        element.groupIds.find((groupId) => groupsToBeAddedToFrame.has(groupId)))
    ) {
      element.groupIds.forEach((groupId) =>
        groupsToBeAddedToFrame.add(groupId),
      );
    }
  });

  // Prepare webgl canvas
  const { gridContainer, elementsContainer } = prepareWebGLCanvas({
    pixi,
    canvas,
    scale,
    theme: appState.theme,
    normalizedHeight,
    normalizedWidth,
    isExporting,
    viewBackgroundColor: appState.viewBackgroundColor,
  });

  // Zoom
  pixi.stage.scale = {
    x: appState.zoom.value,
    y: appState.zoom.value,
  };

  // Grid
  if (renderGrid && appState.gridSize) {
    renderWebGLGrid(
      gridContainer,
      appState.gridSize,
      appState.scrollX,
      appState.scrollY,
      appState.zoom,
      normalizedWidth / appState.zoom.value,
      normalizedHeight / appState.zoom.value,
    );
  }

  const frameElementMapper = new Map<ExcalidrawElement, ExcalidrawElement[]>();

  const addFrameElement = (
    frame: ExcalidrawElement,
    element: ExcalidrawElement,
  ) => {
    const frameElements = frameElementMapper.get(frame);

    if (frameElements) {
      frameElements.push(element);
    } else {
      frameElementMapper.set(frame, [element]);
    }
  };

  // Paint visible elements
  visibleElements
    .filter((el) => !isIframeLikeOrItsLabel(el))
    .forEach((element) => {
      try {
        const frameId = element.frameId || appState.frameToHighlight?.id;

        if (
          frameId &&
          appState.frameRendering.enabled &&
          appState.frameRendering.clip
        ) {
          const frame = getTargetFrame(element, appState);

          if (frame && isElementInFrame(element, elements, appState)) {
            addFrameElement(frame, element);
            renderWebGLElement(
              element,
              pixi,
              renderConfig,
              appState,
              resolution,
              frameId,
            );
          } else {
            renderWebGLElement(
              element,
              pixi,
              renderConfig,
              appState,
              resolution,
              null,
              elementsContainer,
            );
          }
        } else {
          renderWebGLElement(
            element,
            pixi,
            renderConfig,
            appState,
            resolution,
            null,
            elementsContainer,
          );
        }
        if (!isExporting) {
          renderLinkIcon(element, elementsContainer, appState);
        }
      } catch (error: any) {
        console.error(error);
      }
    });

  // render embeddables on top
  visibleElements
    .filter((el) => isIframeLikeOrItsLabel(el))
    .forEach((element) => {
      try {
        const render = ({
          container,
          frameId,
        }: {
          container?: PIXI.Container;
          frameId: string | null;
        }) => {
          renderWebGLElement(
            element,
            pixi,
            renderConfig,
            appState,
            resolution,
            frameId,
            container,
          );

          if (
            isIframeLikeElement(element) &&
            (isExporting ||
              (isEmbeddableElement(element) && !element.validated)) &&
            element.width &&
            element.height
          ) {
            const label = createPlaceholderEmbeddableLabel(element);
            renderWebGLElement(
              label,
              pixi,
              renderConfig,
              appState,
              resolution,
              null,
              container,
            );
          }
          if (!isExporting) {
            renderLinkIcon(element, elementsContainer, appState);
          }
        };
        // - when exporting the whole canvas, we DO NOT apply clipping
        // - when we are exporting a particular frame, apply clipping
        //   if the containing frame is not selected, apply clipping
        const frameId = element.frameId || appState.frameToHighlight?.id;

        if (
          frameId &&
          appState.frameRendering.enabled &&
          appState.frameRendering.clip
        ) {
          const frame = getTargetFrame(element, appState);

          if (frame && isElementInFrame(element, elements, appState)) {
            addFrameElement(frame, element);
            render({
              frameId,
            });
          } else {
            render({
              container: elementsContainer,
              frameId: null,
            });
          }
        } else {
          render({
            container: elementsContainer,
            frameId: null,
          });
        }
      } catch (error: any) {
        console.error(error);
      }
    });

  frameElementMapper.forEach((elements, frame) => {
    const frameContainer = displayObjectCache.get(frame) as PIXI.Container;
    for (const element of elements) {
      const obj = displayObjectCache.get(element)!;
      obj.position.set(obj.x - frameContainer.x, obj.y - frameContainer.y);
      frameContainer.addChild(obj);
    }
  });

  // let drawCount = 0;

  // const renderer = pixi.renderer as any;
  // const drawElements = renderer.gl.drawElements;
  // renderer.gl.drawElements = (...args: any[]) => {
  //   drawElements.call(renderer.gl, ...args);
  //   drawCount++;
  // };

  pixi.render();

  // console.log("drawCalls count", drawCount);
};

/** throttled to animation framerate */
const renderStaticWebGLSceneThrottled = throttleRAF(
  (config: StaticWebGLSceneRenderConfig) => {
    _renderStaticWebGLScene(config);
  },
  { trailing: true },
);

/**
 * Static webgl scene is the non-ui canvas where we render elements via pixi.js.
 */
export const renderStaticWebGLScene = (
  renderConfig: StaticWebGLSceneRenderConfig,
  throttle?: boolean,
) => {
  if (throttle) {
    renderStaticWebGLSceneThrottled(renderConfig);
    return;
  }

  _renderStaticWebGLScene(renderConfig);
};
