// types/excalidraw.d.ts
declare module '@excalidraw/excalidraw' {
  import { ComponentType, RefObject } from 'react';
  
  export interface ExcalidrawImperativeAPI {
    updateScene: (scene: { elements?: any[]; appState?: any }) => void;
    getSceneElements: () => any[];
    getAppState: () => any;
    setActiveTool: (tool: { type: string }) => void;
    zoomTo: (value: number) => void;
    undo: () => void;
    redo: () => void;
    clearCanvas: () => void;
    addFiles: (files: any[]) => void;
    sceneCoordsToViewportCoords: (coords: { x: number; y: number }) => { x: number; y: number };
    setSelectedElements: (ids: string[]) => void;
  }

  export const Excalidraw: ComponentType<{
    excalidrawAPI?: (api: ExcalidrawImperativeAPI) => void;
    initialData?: any;
    onChange?: (elements: any[], appState: any) => void;
    theme?: 'light' | 'dark';
    gridModeEnabled?: boolean;
    viewBackgroundColor?: string;
    UIOptions?: any;
    renderTopLeftUI?: () => JSX.Element | null;
    renderTopRightUI?: () => JSX.Element | null;
  }>;
}

declare module '@excalidraw/excalidraw/types/element/types' {
  export interface ExcalidrawElement {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    [key: string]: any;
  }
}