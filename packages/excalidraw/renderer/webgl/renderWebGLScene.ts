import {
  createPlaceholderEmbeddableLabel,
  isIframeLikeOrItsLabel,
} from "../../element/embeddable";
import {
  isEmbeddableElement,
  isIframeLikeElement,
} from "../../element/typeChecks";
import {
  ExcalidrawElement,
  ExcalidrawFrameLikeElement,
} from "../../element/types";
import {
  elementOverlapsWithFrame,
  getTargetFrame,
  isElementInFrame,
} from "../../frame";
import {
  StaticCanvasRenderConfig,
  StaticWebGLSceneRenderConfig,
} from "../../scene/types";
import { StaticCanvasAppState } from "../../types";
import { throttleRAF } from "../../utils";
import { getNormalizedCanvasDimensions } from "../renderScene";
import { prepareWebGLCanvas } from "./prepareWebGLCanvas";
import { displayObjectCache, renderWebGLElement } from "./renderWebGLElement";
import { renderWebGLGrid } from "./renderWebGLGrid";
import { renderLinkIcon } from "./renderWebGLLink";

const clipWebGLFrame = (
  element: ExcalidrawElement,
  frame: ExcalidrawFrameLikeElement,
  renderConfig: StaticCanvasRenderConfig,
  appState: StaticCanvasAppState,
) => {
  // const objGraphics = displayObjectCache.get(element);
  // const frameGraphics = displayObjectCache.get(frame);
  // console.log(objGraphics, frameGraphics);
  // if (objGraphics && frameGraphics) {
  //   objGraphics.alpha = objGraphics.alpha * frameGraphics.alpha;
  // }
};

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

          // TODO do we need to check isElementInFrame here?
          if (frame && isElementInFrame(element, elements, appState)) {
            clipWebGLFrame(element, frame, renderConfig, appState);
          }
          renderWebGLElement(
            element,
            elementsContainer,
            pixi,
            renderConfig,
            appState,
          );
        } else {
          renderWebGLElement(
            element,
            elementsContainer,
            pixi,
            renderConfig,
            appState,
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
        const render = () => {
          renderWebGLElement(
            element,
            elementsContainer,
            pixi,
            renderConfig,
            appState,
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
              elementsContainer,
              pixi,
              renderConfig,
              appState,
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
            clipWebGLFrame(element, frame, renderConfig, appState);
          }
          render();
        } else {
          render();
        }
      } catch (error: any) {
        console.error(error);
      }
    });

  let drawCount = 0;

  const renderer = pixi.renderer as any;
  const drawElements = renderer.gl.drawElements;
  renderer.gl.drawElements = (...args: any[]) => {
    drawElements.call(renderer.gl, ...args);
    drawCount++;
  };

  pixi.render();

  console.log("drawCalls count", drawCount);
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
