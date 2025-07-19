import { useState, useRef, useEffect, useCallback } from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function IssueNode({ issue, svgRef, onPositionChange, onShowTooltip, onHideTooltip, onUpdateTooltip, onShowContextMenu, color }) {
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const nodeRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  // to differentiate a click from a drag action.
  const wasDragged = useRef(false);

  const getMousePosition = useCallback((evt) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    const clientX = evt.clientX ?? evt.touches?.[0]?.clientX;
    const clientY = evt.clientY ?? evt.touches?.[0]?.clientY;
    return { x: (clientX - CTM.e) / CTM.a, y: (clientY - CTM.f) / CTM.d };
  }, [svgRef]);

  const handleDragStart = useCallback((e) => {
    if (e.button === 2) return;
    // reset drag tracker on mouse down
    wasDragged.current = false;
    const pos = getMousePosition(e);
    const transform = nodeRef.current.getAttribute('transform');
    const parts = /translate\(([^,]+),([^)]+)\)/.exec(transform);
    if (parts) offset.current = { x: pos.x - parseFloat(parts[1]), y: pos.y - parseFloat(parts[2]) };
    setIsDragging(true);
    onHideTooltip();
  }, [getMousePosition, onHideTooltip]);

  useEffect(() => {
    const handleDrag = (e) => {
      if (!isDragging || !svgRef.current) return;
      // if the cursor moves, it's a drag
      wasDragged.current = true;
      const pos = getMousePosition(e);
      const { width, height } = svgRef.current.getBoundingClientRect();
      let newX = Math.max(0, Math.min(pos.x - offset.current.x, width));
      let newY = Math.max(0, Math.min(pos.y - offset.current.y, height));
      nodeRef.current.setAttribute('transform', `translate(${newX}, ${newY})`);
    };
    const handleDragEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (wasDragged.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        const transform = nodeRef.current.getAttribute('transform');
        const parts = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        if (parts) onPositionChange(issue.id, { x: parseFloat(parts[1]) / width, y: 1 - (parseFloat(parts[2]) / height) });
      }
    };
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag); window.addEventListener('mouseup', handleDragEnd);
      return () => { window.removeEventListener('mousemove', handleDrag); window.removeEventListener('mouseup', handleDragEnd); };
    }
  }, [isDragging, getMousePosition, onPositionChange, issue.id, svgRef]);

  const handleClick = () => {
    // open the URL if the node wasn't dragged (might be optimized later)
    if (!wasDragged.current && issue.url) {
      window.open(issue.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMouseEnter = (e) => !isDragging && onShowTooltip(issue, { x: e.clientX, y: e.clientY });
  const handleMouseMove = (e) => !isDragging && onUpdateTooltip({ x: e.clientX, y: e.clientY });
  const handleMouseLeave = () => onHideTooltip();
  const handleContextMenu = (e) => { e.preventDefault(); onShowContextMenu(issue, { x: e.clientX, y: e.clientY }); };

  const { width, height } = svgRef.current ? svgRef.current.getBoundingClientRect() : { width: 0, height: 0 };
  const cx = issue.x * width;
  const cy = (1 - issue.y) * height;

  return (
    <g 
      ref={nodeRef} 
      transform={`translate(${cx}, ${cy})`} 
      onMouseDown={handleDragStart} 
      onContextMenu={handleContextMenu} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave} 
      onMouseMove={handleMouseMove}
      onClick={handleClick} 
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      <circle r="22" fill={color} opacity="0.7" className="transition-transform duration-150" style={{ transform: isDragging ? 'scale(1.1)' : 'scale(1)' }} />
      <circle r="20" fill={color} />
      <text className="fill-white font-bold text-xs pointer-events-none select-none" textAnchor="middle" dy=".3em">{issue.number}</text>
    </g>
  );
}
