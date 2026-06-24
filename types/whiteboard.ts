// // types/whiteboard.ts

// export type ToolType =
//   | "select"
//   | "hand"
//   | "pen"
//   | "eraser"
//   | "text"
//   | "rect"
//   | "ellipse"
//   | "triangle"
//   | "diamond"
//   | "star"
//   | "arrow"
//   | "line"
//   | "image"
//   | "sticky"
//   | "frame";

// export type StrokeStyle = "solid" | "dashed" | "dotted";
// export type ArrowHead = "none" | "arrow" | "dot" | "diamond";
// export type FontFamily = "sans" | "serif" | "mono" | "handwriting";
// export type TextAlign = "left" | "center" | "right";
// export type VerticalAlign = "top" | "middle" | "bottom";

// export interface Point {
//   x: number;
//   y: number;
// }

// export interface BoundingBox {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }

// export interface BaseElement {
//   id: string;
//   type: ElementType;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   rotation: number;
//   opacity: number;
//   locked: boolean;
//   groupId?: string;
//   zIndex: number;
//   createdAt: number;
//   updatedAt: number;
//   createdBy: string;
// }

// export type ElementType =
//   | "rect"
//   | "ellipse"
//   | "triangle"
//   | "diamond"
//   | "star"
//   | "line"
//   | "arrow"
//   | "pen"
//   | "text"
//   | "image"
//   | "sticky"
//   | "frame";

// export interface StrokeStyle2 {
//   color: string;
//   width: number;
//   style: StrokeStyle;
//   opacity: number;
// }

// export interface FillStyle {
//   color: string;
//   opacity: number;
//   pattern?: "none" | "hatch" | "cross" | "dots";
// }

// export interface ShapeElement extends BaseElement {
//   type: "rect" | "ellipse" | "triangle" | "diamond" | "star";
//   stroke: StrokeStyle2;
//   fill: FillStyle;
//   cornerRadius?: number;
//   text?: string;
//   fontSize?: number;
//   fontFamily?: FontFamily;
//   textColor?: string;
//   textAlign?: TextAlign;
//   verticalAlign?: VerticalAlign;
// }

// export interface LineElement extends BaseElement {
//   type: "line" | "arrow";
//   points: Point[];
//   stroke: StrokeStyle2;
//   startArrow: ArrowHead;
//   endArrow: ArrowHead;
//   curved: boolean;
// }

// export interface PenElement extends BaseElement {
//   type: "pen";
//   points: Point[];
//   stroke: StrokeStyle2;
//   smoothing: number;
// }

// export interface TextElement extends BaseElement {
//   type: "text";
//   content: string;
//   fontSize: number;
//   fontFamily: FontFamily;
//   fontWeight: "normal" | "bold";
//   fontStyle: "normal" | "italic";
//   color: string;
//   textAlign: TextAlign;
//   lineHeight: number;
//   autoSize: boolean;
// }

// export interface ImageElement extends BaseElement {
//   type: "image";
//   src: string;
//   originalWidth: number;
//   originalHeight: number;
//   objectFit: "contain" | "cover" | "fill";
// }

// export interface StickyElement extends BaseElement {
//   type: "sticky";
//   content: string;
//   color: string;
//   fontSize: number;
//   textColor: string;
// }

// export interface FrameElement extends BaseElement {
//   type: "frame";
//   title: string;
//   stroke: StrokeStyle2;
//   fill: FillStyle;
//   childIds: string[];
// }

// export type WhiteboardElement =
//   | ShapeElement
//   | LineElement
//   | PenElement
//   | TextElement
//   | ImageElement
//   | StickyElement
//   | FrameElement;

// export interface Camera {
//   x: number;
//   y: number;
//   zoom: number;
// }

// export interface SelectionState {
//   selectedIds: Set<string>;
//   isSelecting: boolean;
//   selectionBox?: BoundingBox;
// }

// export interface HistoryEntry {
//   elements: WhiteboardElement[];
//   timestamp: number;
//   description: string;
// }

// export interface WhiteboardState {
//   elements: WhiteboardElement[];
//   camera: Camera;
//   activeTool: ToolType;
//   selection: SelectionState;
//   strokeColor: string;
//   fillColor: string;
//   strokeWidth: number;
//   strokeStyle: StrokeStyle;
//   opacity: number;
//   fontSize: number;
//   fontFamily: FontFamily;
//   textAlign: TextAlign;
//   startArrow: ArrowHead;
//   endArrow: ArrowHead;
//   history: HistoryEntry[];
//   historyIndex: number;
//   isDragging: boolean;
//   isDrawing: boolean;
//   showGrid: boolean;
//   snapToGrid: boolean;
//   gridSize: number;
// }

// export interface Collaborator {
//   userId: string;
//   userName: string;
//   userColor: string;
//   cursor?: Point;
//   activeTool?: ToolType;
//   lastSeen: number;
// }

// export interface WhiteboardRoom {
//   id: string;
//   slug: string;
//   name: string;
//   teamId: string;
//   thumbnailUrl?: string;
//   elements: WhiteboardElement[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// types/whiteboard.ts
export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'rectangle' 
  | 'ellipse' 
  | 'diamond' 
  | 'triangle'
  | 'arrow' 
  | 'line' 
  | 'pen' 
  | 'eraser' 
  | 'text' 
  | 'sticky' 
  | 'image';

export interface Point {
  x: number;
  y: number;
}

export interface WBShape {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  // Tool-specific data
  points?: Point[];        // For pen/freehand
  text?: string;           // For text/sticky
  fontSize?: number;       // For text
  src?: string;            // For images
  startArrow?: boolean;    // For arrows
  endArrow?: boolean;      // For arrows
  roughness?: number;      // Hand-drawn style
}

export interface WBUser {
  id: string;
  name: string;
  color: string;
  cursor?: Point;
  selectedShapeIds?: string[];
}

export interface WBSnapshot {
  shapes: WBShape[];
  version: number;
  timestamp: number;
}

export interface WBAction {
  type: 'add' | 'update' | 'delete' | 'clear';
  shapes: WBShape[];
  userId: string;
  timestamp: number;
}