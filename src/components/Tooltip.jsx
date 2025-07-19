export default function Tooltip({ tooltip, color }) {
  if (!tooltip.visible || !tooltip.data) return null;

  return (
    <div
      style={{ top: tooltip.position.y + 15, left: tooltip.position.x + 15 }}
      className="absolute bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl z-50 pointer-events-none transition-opacity duration-200"
    >
      <h3 className="font-bold">{`${tooltip.data.number}: ${tooltip.data.title}`}</h3>
      <div className="mt-1">
        <span
          style={{ backgroundColor: color, color: '#fff' }}
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
        >
          {tooltip.data.label.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
