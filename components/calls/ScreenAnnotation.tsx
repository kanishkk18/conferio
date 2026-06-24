'use client';
import React, { useRef, useState, useCallback } from 'react';
import { X, Pencil, Highlighter, ArrowRight, Type, Trash2 } from 'lucide-react';
import { useCall } from 'contexts/CallContext';

interface AnnotationProps {
  onClose: () => void;
}

type AnnotationTool = 'pen' | 'highlight' | 'arrow' | 'text';

export default function ScreenAnnotation({ onClose }: AnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addAnnotation, annotations, clearAnnotations } = useCall();

  const [tool, setTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState('#ff3b30');
  const [isDrawing, setIsDrawing] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#af52de', '#ffffff'];

  const TOOLS = [
    { id: 'pen' as AnnotationTool, Icon: Pencil },
    { id: 'highlight' as AnnotationTool, Icon: Highlighter },
    { id: 'arrow' as AnnotationTool, Icon: ArrowRight },
    { id: 'text' as AnnotationTool, Icon: Type },
  ];

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getPos(e);
    startX.current = x; startY.current = y;
    lastX.current = x; lastY.current = y;
    setIsDrawing(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e);

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'highlight') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 20;
      ctx.globalAlpha = 0.3;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    lastX.current = x;
    lastY.current = y;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e);

    if (tool === 'arrow') {
      // Draw arrow
      const dx = x - startX.current;
      const dy = y - startY.current;
      const angle = Math.atan2(dy, dx);
      const length = Math.sqrt(dx * dx + dy * dy);

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(startX.current, startY.current);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Arrowhead
      const headLen = Math.min(20, length / 3);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Sync annotation
    addAnnotation({ tool, color, startX: startX.current, startY: startY.current, endX: x, endY: y });
  };

  const clearAll = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearAnnotations();
  };

  return (
    <div className="absolute inset-0 z-30" style={{ pointerEvents: 'none' }} aria-label="Button">
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full"
        style={{
          pointerEvents: 'auto',
          cursor: tool === 'text' ? 'text' : 'crosshair',
          opacity: 1,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />

      {/* Floating toolbar */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-2xl"
        style={{
          background: 'rgba(15,15,20,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'auto',
          backdropFilter: 'blur(10px)',
        }}
       aria-label="Button">
        {/* Tool buttons */}
        {TOOLS.map(({ id, Icon }) => (
          <button type="button"
            key={id}
            onClick={() => setTool(id)}
            className={`p-2 rounded-lg transition-all ${
              tool === id ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <Icon className="size-4" />
          </button>
        ))}

        <div className="w-px h-6 bg-neutral-700 mx-1" aria-label="Button" />

        {/* Colors */}
        {COLORS.map(c => (
          <button type="button"
            key={c}
            onClick={() => setColor(c)}
            className={`size-5 rounded-full border-2 transition-transform hover:scale-125 ${
              color === c ? 'border-white scale-125' : 'border-neutral-600'
            }`}
            style={{ background: c }}
            aria-label="Button"
          />
        ))}

        <div className="w-px h-6 bg-neutral-700 mx-1" aria-label="Button" />

        <button type="button"
          onClick={clearAll}
          className="p-2 rounded-lg text-red-400 hover:bg-red-600/20 transition-colors"
         aria-label="Button">
          <Trash2 className="size-4" />
        </button>

        <button type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
         aria-label="Button">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
