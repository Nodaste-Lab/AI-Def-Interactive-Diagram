import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { LAYERS, EDGES, findLayerForNode, findNodeById, getConnectedIds, type LayerDef } from './diagram-data';

const VW = 960;
const VH = 900;
const CX = VW / 2;
const CY = VH / 2;
const RING_R = 340;
const ARC_INNER = 368;
const ARC_OUTER = 386;
const HUB_R = 108;
const NODE_W = 128;
const NODE_H = 38;
const LAYER_GAP_DEG = 7;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  return {
    x: cx + r * Math.cos(toRad(angleDeg)),
    y: cy + r * Math.sin(toRad(angleDeg)),
  };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

interface NodePosition {
  nodeId: string;
  layerId: string;
  x: number;
  y: number;
  angleDeg: number;
  layer: LayerDef;
}

interface LayerArc {
  layerId: string;
  hexColor: string;
  cssColor: string;
  startDeg: number;
  endDeg: number;
  midDeg: number;
  labelX: number;
  labelY: number;
  label: string;
}

function computeLayout(): { positions: NodePosition[]; layerArcs: LayerArc[] } {
  const totalNodes = LAYERS.reduce((s, l) => s + l.nodes.length, 0);
  const numLayers = LAYERS.length;
  const totalArc = 360 - numLayers * LAYER_GAP_DEG;
  const degPerNode = totalArc / totalNodes;

  const positions: NodePosition[] = [];
  const layerArcs: LayerArc[] = [];

  let currentDeg = -90;

  for (const layer of LAYERS) {
    const layerStartDeg = currentDeg;

    for (const node of layer.nodes) {
      const angleDeg = currentDeg + degPerNode / 2;
      const { x, y } = polarToXY(CX, CY, RING_R, angleDeg);
      positions.push({ nodeId: node.id, layerId: layer.id, x, y, angleDeg, layer });
      currentDeg += degPerNode;
    }

    const layerEndDeg = currentDeg;
    const midDeg = (layerStartDeg + layerEndDeg) / 2;
    const labelPos = polarToXY(CX, CY, ARC_OUTER + 22, midDeg);

    layerArcs.push({
      layerId: layer.id,
      hexColor: layer.hexColor,
      cssColor: layer.cssColor,
      startDeg: layerStartDeg,
      endDeg: layerEndDeg,
      midDeg,
      labelX: labelPos.x,
      labelY: labelPos.y,
      label: layer.label,
    });

    currentDeg += LAYER_GAP_DEG;
  }

  return { positions, layerArcs };
}

interface SpokeLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hexColor: string;
  label: string;
  layerId: string;
  isActive: boolean;
  isFaint: boolean;
}

function SpokeLine({ x1, y1, x2, y2, hexColor, label, layerId, isActive, isFaint }: SpokeLineProps) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  if (isFaint) {
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={hexColor}
        strokeWidth={1}
        strokeOpacity={0.08}
      />
    );
  }

  if (!isActive) return null;

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={hexColor}
        strokeWidth={8}
        strokeOpacity={0.1}
        strokeLinecap="round"
      />
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={hexColor}
        strokeWidth={2}
        strokeOpacity={0.9}
        strokeLinecap="round"
        strokeDasharray="7 4"
        className="nd-spoke-line"
        markerEnd={`url(#arrowSpoke-${layerId})`}
      />
      <g transform={`translate(${mx.toFixed(1)}, ${my.toFixed(1)})`}>
        <rect x={-26} y={-10} width={52} height={20} rx={4} fill="#1d1c2a" stroke={hexColor} strokeWidth={1} opacity={0.96} />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: 'var(--nd-foreground)' }}
          fontSize="10"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
        >
          {label}
        </text>
      </g>
    </g>
  );
}

interface HubSpokeViewProps {
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}

export function HubSpokeView({ selectedId, onSelectId }: HubSpokeViewProps) {
  const { positions, layerArcs } = useMemo(computeLayout, []);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const connectedIds = useMemo(() => getConnectedIds(selectedId), [selectedId]);

  const selectedNode = selectedId ? findNodeById(selectedId) : null;
  const selectedLayer = selectedId ? findLayerForNode(selectedId) : null;

  const edgesToDraw = useMemo(() => {
    return EDGES.map((edge) => {
      const fromPos = positions.find((p) => p.nodeId === edge.from);
      const toPos = positions.find((p) => p.nodeId === edge.to);
      const fromLayer = findLayerForNode(edge.from);
      if (!fromPos || !toPos || !fromLayer) return null;

      const isActive =
        selectedId !== null &&
        (edge.from === selectedId || edge.to === selectedId);

      return {
        edge,
        fromPos,
        toPos,
        fromLayer,
        isActive,
        isFaint: selectedId === null,
      };
    }).filter(Boolean) as {
      edge: typeof EDGES[number];
      fromPos: NodePosition;
      toPos: NodePosition;
      fromLayer: LayerDef;
      isActive: boolean;
      isFaint: boolean;
    }[];
  }, [positions, selectedId]);

  const handleNodeKeyDown = (nodeId: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectId(nodeId === selectedId ? null : nodeId);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px',
      }}
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        role="img"
        aria-label="Agent architecture hub and spoke diagram"
        style={{ width: '100%', height: '100%', maxHeight: 'calc(100vh - 120px)' }}
      >
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {LAYERS.map((layer) => (
            <marker
              key={layer.id}
              id={`arrowSpoke-${layer.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={layer.hexColor} />
            </marker>
          ))}
        </defs>

        <circle
          cx={CX} cy={CY} r={RING_R}
          fill="none"
          stroke="var(--nd-border)"
          strokeWidth={1}
          strokeOpacity={0.3}
          strokeDasharray="3 6"
        />

        {layerArcs.map((arc) => (
          <g key={arc.layerId}>
            <path
              d={arcPath(CX, CY, ARC_INNER, arc.startDeg + 1, arc.endDeg - 1)}
              fill="none"
              stroke={arc.hexColor}
              strokeWidth={ARC_OUTER - ARC_INNER}
              strokeOpacity={selectedId
                ? (connectedIds.has(arc.layerId) ? 0.35 : 0.12)
                : 0.25}
              strokeLinecap="round"
              style={{ transition: 'stroke-opacity 0.2s' }}
            />
          </g>
        ))}

        {edgesToDraw.map(({ edge, fromPos, toPos, fromLayer, isActive, isFaint }) => (
          <SpokeLine
            key={`${edge.from}-${edge.to}`}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            hexColor={fromLayer.hexColor}
            label={edge.label}
            layerId={fromLayer.id}
            isActive={isActive}
            isFaint={isFaint}
          />
        ))}

        {positions.map(({ nodeId, layer, x, y }) => {
          const isSelected = nodeId === selectedId;
          const isConnected = connectedIds.has(nodeId) && !isSelected;
          const isDimmed = selectedId !== null && !connectedIds.has(nodeId);
          const isHovered = hoveredId === nodeId;
          const node = findNodeById(nodeId)!;

          const bgOpacity = isSelected ? 0.22 : isConnected ? 0.14 : 0.06;
          const strokeOpacity = isSelected ? 0.9 : isConnected ? 0.55 : isDimmed ? 0.15 : 0.3;
          const strokeWidth = isSelected ? 2 : 1;

          return (
            <g
              key={nodeId}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${node.label} — ${layer.label} layer`}
              style={{
                cursor: 'pointer',
                opacity: isDimmed ? 0.3 : 1,
                transition: 'opacity 0.2s',
                outline: 'none',
              }}
              onClick={() => onSelectId(nodeId === selectedId ? null : nodeId)}
              onKeyDown={handleNodeKeyDown(nodeId)}
              onMouseEnter={() => setHoveredId(nodeId)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(nodeId)}
              onBlur={() => setHoveredId(null)}
            >
              {(isSelected || isHovered) && (
                <rect
                  x={x - NODE_W / 2 - 4}
                  y={y - NODE_H / 2 - 4}
                  width={NODE_W + 8}
                  height={NODE_H + 8}
                  rx={12}
                  fill={layer.hexColor}
                  fillOpacity={0.12}
                />
              )}

              <rect
                x={x - NODE_W / 2}
                y={y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={8}
                fill={layer.hexColor}
                fillOpacity={bgOpacity}
                stroke={layer.hexColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
              />

              <circle
                cx={x - NODE_W / 2 + 14}
                cy={y}
                r={4}
                fill={layer.hexColor}
                fillOpacity={isSelected || isConnected ? 1 : 0.6}
              />

              <foreignObject
                x={x - NODE_W / 2 + 24}
                y={y - NODE_H / 2}
                width={NODE_W - 28}
                height={NODE_H}
                style={{ overflow: 'visible' }}
              >
                <div
                  style={{
                    height: `${NODE_H}px`,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '11px',
                      fontWeight: 'var(--nd-font-weight-medium)',
                      color: 'var(--nd-foreground)',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {node.label}
                  </p>
                </div>
              </foreignObject>
            </g>
          );
        })}

        {layerArcs.map((arc) => {
          const angle = arc.midDeg;
          const isRight = Math.cos(toRad(angle)) > 0.2;
          const isLeft = Math.cos(toRad(angle)) < -0.2;
          const anchor = isRight ? 'start' : isLeft ? 'end' : 'middle';
          const labelR = ARC_OUTER + 28;
          const lpos = polarToXY(CX, CY, labelR, angle);

          return (
            <text
              key={arc.layerId}
              x={lpos.x}
              y={lpos.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
              fontSize="11"
              fontWeight="600"
              style={{ fill: 'var(--nd-foreground)', opacity: 0.6 }}
            >
              {arc.label}
            </text>
          );
        })}

        {/* Center Hub */}
        <circle cx={CX} cy={CY} r={HUB_R + 16} fill="url(#hubGlow)" />
        <circle
          cx={CX}
          cy={CY}
          r={HUB_R}
          fill="var(--nd-secondary)"
          stroke={selectedLayer ? selectedLayer.hexColor : 'var(--nd-border)'}
          strokeWidth={selectedLayer ? 2 : 1}
          strokeOpacity={selectedLayer ? 0.8 : 0.4}
          style={{ transition: 'stroke 0.25s' }}
        />

        {selectedNode && selectedLayer ? (
          <AnimatePresence mode="wait">
            <g key={selectedId}>
              <rect
                x={CX - 52}
                y={CY - HUB_R + 22}
                width={104}
                height={22}
                rx={6}
                fill={selectedLayer.hexColor}
                fillOpacity={0.3}
                stroke={selectedLayer.hexColor}
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              <text
                x={CX}
                y={CY - HUB_R + 33}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                fontWeight="600"
                style={{ fill: 'var(--nd-foreground)' }}
              >
                {selectedLayer.label.toUpperCase()}
              </text>

              <foreignObject
                x={CX - HUB_R + 14}
                y={CY - 28}
                width={(HUB_R - 14) * 2}
                height={56}
              >
                <div
                  style={{
                    width: '100%',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      textAlign: 'center',
                      color: 'var(--nd-foreground)',
                      lineHeight: 1.3,
                    }}
                  >
                    {selectedNode.label}
                  </h4>
                </div>
              </foreignObject>

              <text
                x={CX}
                y={CY + HUB_R - 24}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                style={{ fill: 'var(--nd-muted-foreground)' }}
              >
                {connectedIds.size - 1} connection{connectedIds.size !== 2 ? 's' : ''}
              </text>
            </g>
          </AnimatePresence>
        ) : (
          <g>
            <text
              x={CX}
              y={CY - 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
              fontSize="13"
              fontWeight="600"
              style={{ fill: 'var(--nd-foreground)' }}
            >
              Agent
            </text>
            <text
              x={CX}
              y={CY + 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
              fontSize="13"
              fontWeight="600"
              style={{ fill: 'var(--nd-foreground)' }}
            >
              Architecture
            </text>
            <text
              x={CX}
              y={CY + 32}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
              fontSize="10"
              style={{ fill: 'var(--nd-muted-foreground)' }}
            >
              click a node
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
