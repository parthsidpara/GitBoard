export default function Tooltip({ tooltip, allLabels }) {
  if (!tooltip.visible || !tooltip.data) return null;

  const issueLabels = Array.isArray(tooltip.data.labels) ? tooltip.data.labels : [];

  const getLabelColor = (labelName) => {
    const label = allLabels.find(l => l.name === labelName);
    return label ? label.color : '#6b7280';
  };

  return (
    <div
      style={{ top: tooltip.position.y + 15, left: tooltip.position.x + 15 }}
      className="absolute bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl z-50 pointer-events-none transition-opacity duration-200"
    >
      <h3 className="font-bold">{`${tooltip.data.number}: ${tooltip.data.title}`}</h3>
      
      {/* Map over the labels array to display all of them */}
      {issueLabels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {issueLabels.map(labelName => (
            <span
              key={labelName}
              style={{ backgroundColor: getLabelColor(labelName) }}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {labelName.toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
