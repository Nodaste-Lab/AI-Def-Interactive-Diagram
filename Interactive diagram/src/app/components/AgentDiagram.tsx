import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Info, ExternalLink } from 'lucide-react';
import {
  LAYERS,
  EDGES,
  findLayerForNode,
  findNodeById,
  getConnectedIds,
  isCrossLayerEdge,
  type LayerDef,
} from './diagram-data';
import { DiagramDetailPanel } from './DiagramDetailPanel';

interface RenderedPath {
  d: string;
  label: string;
  labelX: number;
  labelY: number;
  hexColor: string;
  layerId: string;
}

function useContainerSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 1200, height: 800 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

function getBezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const dy = y2 - y1;
  const cp = Math.max(Math.abs(dy) * 0.55, 40);
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${(y1 + cp).toFixed(1)}, ${x2.toFixed(1)} ${(y2 - cp).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

// ─── Layered View ─────────────────────────────────────────────────────────────

interface LayeredViewProps {
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  containerWidth: number;
}

function LayeredView({ selectedId, onSelectId, containerWidth }: LayeredViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [paths, setPaths] = useState<RenderedPath[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const prefersReducedMotion = useReducedMotion();

  const connectedIds = getConnectedIds(selectedId);
  const isMobile = containerWidth < 768;
  const noMotion = { duration: 0 };

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;

    setSvgSize({ w: container.scrollWidth, h: container.scrollHeight });

    if (!selectedId) {
      setPaths([]);
      return;
    }

    const relatedEdges = EDGES.filter(
      (e) => (e.from === selectedId || e.to === selectedId) && isCrossLayerEdge(e)
    );

    const newPaths: RenderedPath[] = [];
    for (const edge of relatedEdges) {
      const fromEl = nodeRefs.current[edge.from];
      const toEl = nodeRefs.current[edge.to];
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const x1 = fromRect.left - cRect.left + fromRect.width / 2;
      const y1 = fromRect.bottom - cRect.top + scrollTop;
      const x2 = toRect.left - cRect.left + toRect.width / 2;
      const y2 = toRect.top - cRect.top + scrollTop;

      const fromLayer = findLayerForNode(edge.from)!;

      newPaths.push({
        d: getBezierPath(x1, y1, x2, y2),
        label: edge.label,
        labelX: (x1 + x2) / 2,
        labelY: (y1 + y2) / 2,
        hexColor: fromLayer.hexColor,
        layerId: fromLayer.id,
      });
    }

    setPaths(newPaths);
  }, [selectedId]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', recalculate);
    window.addEventListener('resize', recalculate);
    return () => {
      container.removeEventListener('scroll', recalculate);
      window.removeEventListener('resize', recalculate);
    };
  }, [recalculate]);

  const handleNodeKeyDown = (nodeId: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectId(nodeId === selectedId ? null : nodeId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="nd-layered-container"
      role="region"
      aria-label="AI architecture diagram — layered view"
      style={{
        flex: isMobile ? undefined : 1,
        overflowY: isMobile ? 'visible' : 'auto',
        position: 'relative',
        padding: isMobile ? '16px 16px' : '28px 36px',
      }}
    >
      {selectedId && (
        <svg
          role="img"
          aria-label={`Showing ${paths.length} connection${paths.length !== 1 ? 's' : ''} from ${findNodeById(selectedId)?.label ?? 'selected node'} to other concepts`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: svgSize.w || '100%',
            height: svgSize.h || '100%',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <defs>
            {LAYERS.map((layer) => (
              <marker
                key={layer.id}
                id={`arrow-${layer.id}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill={layer.hexColor} />
              </marker>
            ))}
          </defs>

          {paths.map((path, i) => (
            <g key={i}>
              <path
                d={path.d}
                fill="none"
                stroke={path.hexColor}
                strokeWidth={6}
                strokeOpacity={0.12}
                strokeLinecap="round"
              />
              <path
                d={path.d}
                fill="none"
                stroke={path.hexColor}
                strokeWidth={2}
                strokeOpacity={0.85}
                strokeLinecap="round"
                markerEnd={`url(#arrow-${path.layerId})`}
                className="nd-flow-line"
              />
              <g transform={`translate(${path.labelX.toFixed(1)}, ${path.labelY.toFixed(1)})`}>
                <rect
                  x={-28} y={-10} width={56} height={20} rx={4}
                  fill="var(--nd-secondary)"
                  stroke={path.hexColor}
                  strokeWidth={1}
                  opacity={0.95}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fill: 'var(--nd-foreground)' }}
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                >
                  {path.label}
                </text>
              </g>
            </g>
          ))}
        </svg>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {LAYERS.map((layer, layerIndex) => (
          <div key={layer.id}>
            <div
              style={{
                borderRadius: 'var(--nd-radius-card)',
                border: '1px solid var(--nd-border)',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div
                className="nd-layer-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: isMobile ? '10px 14px' : '12px 18px',
                  borderBottom: '1px solid var(--nd-border)',
                  borderLeft: `4px solid ${layer.cssColor}`,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, color: 'var(--nd-foreground)', fontSize: isMobile ? '16px' : undefined }}>{layer.label}</h3>
                    <span style={{ color: 'var(--nd-muted-foreground)', fontSize: 'var(--nd-text-sm)' }}>{layer.subtitle}</span>
                  </div>
                </div>
                <div
                  style={{
                    background: `${layer.hexColor}55`,
                    border: `1px solid ${layer.hexColor}88`,
                    borderRadius: 'var(--nd-radius)',
                    padding: '2px 10px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: 'var(--nd-foreground)', fontSize: 'var(--nd-text-sm)' }}>
                    Layer {layerIndex + 1}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: isMobile ? '10px 14px' : '14px 18px',
                }}
              >
                {layer.nodes.map((node) => {
                  const isSelected = selectedId === node.id;
                  const isConnected = connectedIds.has(node.id) && !isSelected;
                  const isDimmed =
                    selectedId !== null && !connectedIds.has(node.id) && !isSelected;

                  return (
                    <motion.div
                      key={node.id}
                      ref={(el) => {
                        nodeRefs.current[node.id] = el;
                      }}
                      role="button"
                      tabIndex={isDimmed ? -1 : 0}
                      aria-pressed={isSelected}
                      aria-hidden={isDimmed || undefined}
                      aria-label={`${node.label} — ${layer.label} layer`}
                      className="nd-node-chip"
                      onClick={() => onSelectId(node.id === selectedId ? null : node.id)}
                      onKeyDown={handleNodeKeyDown(node.id)}
                      onMouseEnter={() => setHoveredId(node.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      animate={{
                        opacity: isDimmed ? 0.35 : 1,
                        scale: isSelected ? 1.03 : 1,
                      }}
                      transition={prefersReducedMotion ? noMotion : { duration: 0.15 }}
                      style={{
                        cursor: 'pointer',
                        borderRadius: 'var(--nd-radius-card)',
                        padding: '9px 13px',
                        minWidth: isMobile ? '110px' : '140px',
                        maxWidth: isMobile ? '180px' : '220px',
                        userSelect: 'none',
                        outline: 'revert',
                        background: isSelected
                          ? `${layer.hexColor}1A`
                          : isConnected
                          ? `${layer.hexColor}0D`
                          : 'var(--nd-secondary)',
                        border: isSelected
                          ? `2px solid ${layer.cssColor}`
                          : isConnected
                          ? `1.5px solid ${layer.hexColor}77`
                          : '1px solid var(--nd-border)',
                        boxShadow: isSelected
                          ? `0 0 0 3px ${layer.hexColor}22, var(--nd-elevation-md)`
                          : hoveredId === node.id
                          ? 'var(--nd-elevation-md)'
                          : 'var(--nd-elevation-sm)',
                        transition: 'background 0.15s, border 0.15s, box-shadow 0.15s',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          marginBottom: node.aliases ? '3px' : '0',
                        }}
                      >
                        <div
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: layer.cssColor,
                            flexShrink: 0,
                            opacity: isSelected || isConnected ? 1 : 0.65,
                          }}
                        />
                        <p
                          style={{
                            margin: 0,
                            fontSize: 'var(--nd-text-sm)',
                            fontWeight: 'var(--nd-font-weight-medium)',
                            color: 'var(--nd-foreground)',
                            lineHeight: 1.3,
                          }}
                        >
                          {node.label}
                        </p>
                      </div>
                      {node.aliases && (
                        <span
                          style={{
                            display: 'block',
                            marginLeft: '14px',
                            color: 'var(--nd-muted-foreground)',
                            fontSize: 'var(--nd-text-sm)',
                            opacity: 0.65,
                          }}
                        >
                          {node.aliases.slice(0, 2).join(' · ')}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {layerIndex < LAYERS.length - 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '5px 0',
                  opacity: 0.22,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <line x1="8" y1="0" x2="8" y2="10" stroke="var(--nd-foreground)" strokeWidth="1.5" />
                  <path
                    d="M 4 7 L 8 12 L 12 7"
                    fill="none"
                    stroke="var(--nd-foreground)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function AgentDiagram() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth, height: containerHeight } = useContainerSize(rootRef);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = containerWidth < 768;
  const isTablet = containerWidth >= 768 && containerWidth < 1024;

  return (
    <div
      ref={rootRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '600px',
        background: 'var(--nd-background)',
        color: 'var(--nd-foreground)',
        overflow: isMobile ? 'auto' : 'hidden',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        borderRadius: 'var(--nd-radius-card)',
      }}
    >
      {/* Header */}
      <header
        className="nd-header"
        style={{
          flexShrink: 0,
          padding: isMobile ? '16px 20px 14px' : '24px 36px 20px',
          borderBottom: '1px solid var(--nd-border)',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '12px' : '24px',
          flexWrap: 'wrap',
        }}
      >
        <div className="nd-header-title" style={{ flex: isMobile || isTablet ? '1 1 100%' : '1', minWidth: 0 }}>
          <h2 style={{ marginBottom: '4px', fontSize: isMobile ? '28px' : undefined }}>Agent Architecture</h2>
          <p style={{ margin: '0 0 8px', color: 'var(--nd-muted-foreground)', fontSize: 'var(--nd-text-sm)', lineHeight: 1.6 }}>
            {isMobile
              ? 'Explore how the building blocks of AI connect and work together. Tap any concept to learn what it does and why it matters.'
              : 'AI has a lot of moving parts. Explore how the building blocks\u2009—\u2009from models and data retrieval to agents and interfaces\u2009—\u2009connect and work together. Select any concept to learn what it does, why it matters, and how to get started.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={13} style={{ color: 'var(--nd-muted-foreground)', flexShrink: 0 }} />
            <p style={{ margin: 0, color: 'var(--nd-muted-foreground)', fontSize: 'var(--nd-text-sm)' }}>
              Tap a node to highlight its connections across layers
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {LAYERS.map((layer) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: layer.cssColor,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: 'var(--nd-foreground)', fontWeight: 'var(--nd-font-weight-medium)', fontSize: 'var(--nd-text-sm)' }}>
                {layer.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <a
          href="https://www.nodaste.com/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="nd-cta-banner"
        >
          <span>
            {isMobile
              ? 'Need help building with AI?'
              : 'Need help building AI into your team\u2019s workflows?'}
          </span>
          <span className="nd-cta-banner-link">
            Contact us <ExternalLink size={12} style={{ flexShrink: 0 }} aria-hidden="true" />
            <span className="nd-sr-only">(opens in a new tab)</span>
          </span>
        </a>
      </header>

      {/* Body -- on mobile the diagram always takes full space; panel is overlaid */}
      <div
        className="nd-body"
        style={{
          flex: isMobile ? 'none' : 1,
          display: isMobile ? 'block' : 'flex',
          overflow: isMobile ? 'visible' : 'hidden',
          flexDirection: isMobile ? undefined : 'row',
        }}
      >
        <div style={{ flex: isMobile ? undefined : 1, display: isMobile ? 'block' : 'flex', overflow: isMobile ? 'visible' : 'hidden' }}>
          <LayeredView selectedId={selectedId} onSelectId={setSelectedId} containerWidth={containerWidth} />
        </div>

        {/* Desktop sidebar -- inside flex flow */}
        {!isMobile && (
          <DiagramDetailPanel
            selectedId={selectedId}
            onSelectId={setSelectedId}
            isMobile={false}
            containerHeight={containerHeight}
          />
        )}
      </div>

      {/* Mobile bottom sheet -- rendered as overlay on top of everything */}
      {isMobile && (
        <DiagramDetailPanel
          selectedId={selectedId}
          onSelectId={setSelectedId}
          isMobile={true}
          containerHeight={containerHeight}
        />
      )}

      {/* Empty state toast */}
      <AnimatePresence>
        {!selectedId && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
            style={{
              position: isMobile ? 'sticky' : 'absolute',
              bottom: '24px',
              ...(isMobile
                ? { width: 'fit-content', marginLeft: 'auto', marginRight: 'auto' }
                : { left: '50%', transform: 'translateX(-50%)' }),
              background: 'var(--nd-secondary)',
              border: '1px solid var(--nd-border)',
              borderRadius: 'var(--nd-radius)',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              zIndex: 50,
              boxShadow: 'var(--nd-elevation-md)',
              whiteSpace: 'nowrap',
            }}
          >
            <Info size={13} style={{ color: 'var(--nd-muted-foreground)', flexShrink: 0 }} />
            <span style={{ color: 'var(--nd-muted-foreground)', fontSize: 'var(--nd-text-sm)' }}>
              Select a node to explore its connections and details
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
