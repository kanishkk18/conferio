'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Pencil, Eraser, Square, Circle, Minus, Type,
  Trash2, Download, X, Palette, ChevronDown
} from 'lucide-react';
import { useCall } from 'contexts/CallContext';

type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'line' | 'text';

interface DrawElement {
  id: string;
  tool: Tool;
  points?: number[];
  x?: number; y?: number; w?: number; h?: number;
  color: string;
  strokeWidth: number;
  text?: string;
}

interface WhiteboardProps {
  onClose: () => void;
}

const COLORS = ['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
const STROKE_WIDTHS = [2, 4, 8, 16];

export default function Whiteboard({ onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { whiteboardElements, updateWhiteboard } = useCall();

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);

  const startX = useRef(0);
  const startY = useRef(0);

  // Redraw canvas from elements
  const redrawCanvas = useCallback((elems: DrawElement[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elems.forEach(el => {
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.tool === 'pen' && el.points) {
        ctx.beginPath();
        ctx.moveTo(el.points[0], el.points[1]);
        for (let i = 2; i < el.points.length; i += 2) {
          ctx.lineTo(el.points[i], el.points[i + 1]);
        }
        ctx.stroke();
      } else if (el.tool === 'eraser' && el.points) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.moveTo(el.points[0], el.points[1]);
        for (let i = 2; i < el.points.length; i += 2) {
          ctx.lineTo(el.points[i], el.points[i + 1]);
        }
        ctx.lineWidth = el.strokeWidth * 3;
        ctx.stroke();
        ctx.restore();
      } else if (el.tool === 'rect' && el.x !== undefined) {
        ctx.strokeRect(el.x!, el.y!, el.w!, el.h!);
      } else if (el.tool === 'circle' && el.x !== undefined) {
        ctx.beginPath();
        ctx.ellipse(el.x! + el.w! / 2, el.y! + el.h! / 2, Math.abs(el.w! / 2), Math.abs(el.h! / 2), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.tool === 'line' && el.points) {
        ctx.beginPath();
        ctx.moveTo(el.points[0], el.points[1]);
        ctx.lineTo(el.points[2], el.points[3]);
        ctx.stroke();
      } else if (el.tool === 'text' && el.x !== undefined) {
        ctx.fillStyle = el.color;
        ctx.font = `${el.strokeWidth * 4}px Inter, sans-serif`;
        ctx.fillText(el.text || '', el.x!, el.y!);
      }
    });
  }, []);

  useEffect(() => {
    redrawCanvas(elements);
  }, [elements, redrawCanvas]);

  // Sync from remote
  useEffect(() => {
    if (whiteboardElements?.length) {
      setElements(whiteboardElements);
      redrawCanvas(whiteboardElements);
    }
  }, [whiteboardElements, redrawCanvas]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e);
    startX.current = x;
    startY.current = y;
    setIsDrawing(true);

    const newEl: DrawElement = {
      id: Date.now().toString(),
      tool,
      color,
      strokeWidth,
      points: (tool === 'pen' || tool === 'eraser') ? [x, y] : undefined,
      x: (tool === 'line') ? undefined : x,
      y: (tool === 'line') ? undefined : y,
      w: 0, h: 0,
    };

    setCurrentElement(newEl);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;
    const { x, y } = getPos(e);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    if (tool === 'pen' || tool === 'eraser') {
      const updated = {
        ...currentElement,
        points: [...(currentElement.points || []), x, y],
      };
      setCurrentElement(updated);

      // Live draw
      ctx.strokeStyle = tool === 'eraser' ? '#000000' : color;
      ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
      ctx.lineCap = 'round';
      if (tool === 'eraser') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
      }
      ctx.beginPath();
      const pts = updated.points!;
      ctx.moveTo(pts[pts.length - 4] || pts[0], pts[pts.length - 3] || pts[1]);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (tool === 'eraser') ctx.restore();
    } else {
      const w = x - startX.current;
      const h = y - startY.current;
      setCurrentElement(prev => prev ? { ...prev, w, h, x: startX.current, y: startY.current } : null);
      redrawCanvas(elements);

      // Preview shape
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      if (tool === 'rect') ctx.strokeRect(startX.current, startY.current, w, h);
      else if (tool === 'circle') {
        ctx.beginPath();
        ctx.ellipse(startX.current + w / 2, startY.current + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startX.current, startY.current);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);

    const { x, y } = getPos(e);
    const finalEl = tool === 'line'
      ? { ...currentElement, points: [startX.current, startY.current, x, y] }
      : currentElement;

    const newElements = [...elements, finalEl];
    setElements(newElements);
    setCurrentElement(null);
    updateWhiteboard(newElements);
  };

  const clearCanvas = () => {
    setElements([]);
    updateWhiteboard([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const TOOLS = [
    { id: 'pen' as Tool, Icon: Pencil, label: 'Pen' },
    { id: 'eraser' as Tool, Icon: Eraser, label: 'Eraser' },
    { id: 'rect' as Tool, Icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, Icon: Circle, label: 'Circle' },
    { id: 'line' as Tool, Icon: Minus, label: 'Line' },
    { id: 'text' as Tool, Icon: Type, label: 'Text' },
  ];

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" aria-label="Button">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-5xl h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/80 border-b border-neutral-800" aria-label="Button">
          <div className="flex items-center gap-2" aria-label="Button">
            {/* Tools */}
            <div className="flex items-center gap-1 bg-neutral-800 rounded-xl p-1" aria-label="Button">
              {TOOLS.map(({ id, Icon, label }) => (
                <button type="button"
                  key={id}
                  onClick={() => setTool(id)}
                  title={label}
                  className={`p-2 rounded-lg transition-all ${
                    tool === id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>

            {/* Color */}
            <div className="relative" aria-label="Button">
              <button type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 bg-neutral-800 rounded-xl px-3 py-2 hover:bg-neutral-700 transition-colors"
              >
                <div className="size-5 rounded-full border-2 border-neutral-600" style={{ background: color }} aria-label="Button" />
                <ChevronDown className="size-3 text-neutral-400" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-700 grid grid-cols-4 gap-2 z-10" aria-label="Button">
                  {COLORS.map(c => (
                    <button type="button"
                      key={c}
                      onClick={() => { setColor(c); setShowColorPicker(false); }}
                      className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        color === c ? 'border-white scale-110' : 'border-neutral-600'
                      }`}
                      style={{ background: c }}
                      aria-label="Button"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Stroke width */}
            <div className="flex items-center gap-1.5 bg-neutral-800 rounded-xl px-3 py-2" aria-label="Button">
              {STROKE_WIDTHS.map(w => (
                <button type="button"
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`rounded-full transition-all ${strokeWidth === w ? 'bg-blue-500' : 'bg-neutral-600 hover:bg-neutral-500'}`}
                  style={{ width: Math.max(8, w * 2), height: Math.max(8, w * 2) }}
                  aria-label="Button"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2" aria-label="Button">
            <button type="button"
              onClick={downloadCanvas}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 text-sm transition-colors"
             aria-label="Button">
              <Download className="size-4" /> Save
            </button>
            <button type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-xl text-red-400 text-sm transition-colors"
             aria-label="Button">
              <Trash2 className="size-4" /> Clear
            </button>
            <button type="button"
              onClick={onClose}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-400 hover:text-white transition-colors"
             aria-label="Button">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-neutral-950" aria-label="Button">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { if (isDrawing) onMouseUp({} as any); }}
            className="w-full h-full"
            style={{
              cursor: tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair',
              touchAction: 'none',
            }}
          />
          {/* Grid background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          aria-label="Button"/>
        </div>
      </motion.div>
    </div>
  );
}
