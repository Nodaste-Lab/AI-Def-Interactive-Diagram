import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, AlertTriangle, Lightbulb, ExternalLink, Zap, ChevronRight } from 'lucide-react';
import {
  EDGES,
  findLayerForNode,
  findNodeById,
  type LayerDef,
  type NodeDef,
} from './diagram-data';

// ─── Shared content sections (used by both desktop and mobile) ───────────────

function DifficultyTag({ level }: { level: NodeDef['difficulty'] }) {
  const labels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
  return (
    <span className="nd-difficulty-tag" data-level={level}>
      {labels[level]}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: 'var(--nd-muted)',
        fontSize: 'var(--nd-text-sm)',
        fontWeight: 'var(--nd-font-weight-medium)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        display: 'block',
      }}
    >
      {children}
    </span>
  );
}

function PanelContent({
  selectedNode,
  selectedLayer,
  onSelectId,
}: {
  selectedNode: NodeDef;
  selectedLayer: LayerDef;
  onSelectId: (id: string | null) => void;
}) {
  const outgoingEdges = EDGES.filter((e) => e.from === selectedNode.id);
  const incomingEdges = EDGES.filter((e) => e.to === selectedNode.id);

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Difficulty */}
      <DifficultyTag level={selectedNode.difficulty} />

      {/* Description */}
      <p style={{ margin: 0, color: 'var(--nd-muted-foreground)', lineHeight: 1.65 }}>
        {selectedNode.description}
      </p>

      {/* Why It Matters */}
      <div className="nd-why-it-matters">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Zap size={13} style={{ color: 'var(--nd-primary)', flexShrink: 0 }} />
          <SectionLabel>Why it matters</SectionLabel>
        </div>
        <p style={{ margin: 0, color: 'var(--nd-foreground)', lineHeight: 1.6, fontSize: 'var(--nd-text-sm)' }}>
          {selectedNode.whyItMatters}
        </p>
      </div>

      {/* Aliases */}
      {selectedNode.aliases && selectedNode.aliases.length > 0 && (
        <div>
          <SectionLabel>Also known as</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {selectedNode.aliases.map((alias) => (
              <span key={alias} className="nd-example-chip">{alias}</span>
            ))}
          </div>
        </div>
      )}

      {/* Real-World Examples */}
      {selectedNode.examples.length > 0 && (
        <div>
          <SectionLabel>Real-world examples</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {selectedNode.examples.map((ex) => (
              <span key={ex} className="nd-example-chip">{ex}</span>
            ))}
          </div>
        </div>
      )}

      {/* Common Misconception */}
      {selectedNode.misconception && (
        <div className="nd-misconception">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <AlertTriangle size={13} style={{ color: 'var(--nd-difficulty-intermediate)', flexShrink: 0 }} />
            <SectionLabel>Common misconception</SectionLabel>
          </div>
          <p style={{ margin: 0, color: 'var(--nd-foreground)', lineHeight: 1.6, fontSize: 'var(--nd-text-sm)' }}>
            {selectedNode.misconception}
          </p>
        </div>
      )}

      {/* Getting Started */}
      {selectedNode.gettingStarted && (
        <div className="nd-getting-started">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Lightbulb size={13} style={{ color: 'var(--nd-chart-3)', flexShrink: 0 }} />
            <SectionLabel>Getting started</SectionLabel>
          </div>
          <p style={{ margin: 0, color: 'var(--nd-foreground)', lineHeight: 1.6, fontSize: 'var(--nd-text-sm)' }}>
            {selectedNode.gettingStarted}
          </p>
        </div>
      )}

      {/* Outgoing connections */}
      {outgoingEdges.length > 0 && (
        <div>
          <SectionLabel>Connects to</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {outgoingEdges.map((edge) => {
              const targetNode = findNodeById(edge.to);
              const targetLayer = findLayerForNode(edge.to);
              if (!targetNode) return null;
              return (
                <ConnectionCard
                  key={edge.to}
                  node={targetNode}
                  layer={targetLayer}
                  relationLabel={edge.label}
                  direction="out"
                  onClick={() => onSelectId(edge.to)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Incoming connections */}
      {incomingEdges.length > 0 && (
        <div>
          <SectionLabel>Receives from</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {incomingEdges.map((edge) => {
              const sourceNode = findNodeById(edge.from);
              const sourceLayer = findLayerForNode(edge.from);
              if (!sourceNode) return null;
              return (
                <ConnectionCard
                  key={edge.from}
                  node={sourceNode}
                  layer={sourceLayer}
                  relationLabel={edge.label}
                  direction="in"
                  onClick={() => onSelectId(edge.from)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Resource Links */}
      {selectedNode.resources && selectedNode.resources.length > 0 && (
        <div>
          <SectionLabel>Learn more</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {selectedNode.resources.map((res) => (
              <a
                key={res.url}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nd-resource-link"
              >
                <ExternalLink size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                <span style={{ fontSize: 'var(--nd-text-sm)' }}>{res.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Panel header (shared) ───────────────────────────────────────────────────

function PanelHeader({
  selectedNode,
  selectedLayer,
  onClose,
}: {
  selectedNode: NodeDef;
  selectedLayer: LayerDef;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--nd-border)',
        position: 'sticky',
        top: 0,
        background: 'var(--nd-secondary)',
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: `${selectedLayer.hexColor}55`,
            border: `1px solid ${selectedLayer.hexColor}88`,
            borderRadius: 'var(--nd-radius)',
            padding: '3px 10px',
          }}
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: selectedLayer.cssColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: 'var(--nd-foreground)',
              fontWeight: 'var(--nd-font-weight-medium)',
              fontSize: 'var(--nd-text-sm)',
            }}
          >
            {selectedLayer.label}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close detail panel"
          style={{
            background: 'transparent',
            border: '1px solid var(--nd-border)',
            borderRadius: 'var(--nd-radius)',
            cursor: 'pointer',
            color: 'var(--nd-muted-foreground)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>

      <h3 style={{ margin: 0, color: 'var(--nd-foreground)' }}>
        {selectedNode.label}
      </h3>
    </div>
  );
}

// ─── Desktop sidebar ─────────────────────────────────────────────────────────

function DesktopSidebar({
  selectedNode,
  selectedLayer,
  onSelectId,
}: {
  selectedNode: NodeDef;
  selectedLayer: LayerDef;
  onSelectId: (id: string | null) => void;
}) {
  return (
    <motion.div
      key="panel"
      aria-live="polite"
      aria-label={`Details for ${selectedNode.label}`}
      className="nd-detail-panel"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        width: '320px',
        flexShrink: 0,
        background: 'var(--nd-secondary)',
        borderLeft: '1px solid var(--nd-border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <PanelHeader
        selectedNode={selectedNode}
        selectedLayer={selectedLayer}
        onClose={() => onSelectId(null)}
      />
      <PanelContent
        selectedNode={selectedNode}
        selectedLayer={selectedLayer}
        onSelectId={onSelectId}
      />
    </motion.div>
  );
}

// ─── Mobile floating info button ──────────────────────────────────────────────

function MobileInfoFab({
  selectedNode,
  selectedLayer,
  onOpen,
}: {
  selectedNode: NodeDef;
  selectedLayer: LayerDef;
  onOpen: () => void;
}) {
  return (
    <motion.button
      className="nd-mobile-fab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onOpen}
      aria-label={`Learn more about ${selectedNode.label}`}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: selectedLayer.cssColor,
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1, textAlign: 'left' }}>
        Learn about <strong>{selectedNode.label}</strong>
      </span>
      <ChevronRight size={16} style={{ flexShrink: 0, opacity: 0.7 }} />
    </motion.button>
  );
}

// ─── Mobile detail modal (~75% height) ───────────────────────────────────────

function MobileDetailModal({
  selectedNode,
  selectedLayer,
  onSelectId,
  onClose,
}: {
  selectedNode: NodeDef;
  selectedLayer: LayerDef;
  onSelectId: (id: string | null) => void;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        className="nd-mobile-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <motion.div
        className="nd-mobile-modal"
        aria-live="polite"
        aria-label={`Details for ${selectedNode.label}`}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      >
        <div className="nd-mobile-modal-content">
          <PanelHeader
            selectedNode={selectedNode}
            selectedLayer={selectedLayer}
            onClose={onClose}
          />
          <PanelContent
            selectedNode={selectedNode}
            selectedLayer={selectedLayer}
            onSelectId={(id) => {
              onSelectId(id);
            }}
          />
        </div>
      </motion.div>
    </>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface DiagramDetailPanelProps {
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  isMobile: boolean;
  containerHeight: number;
}

export function DiagramDetailPanel({ selectedId, onSelectId, isMobile }: DiagramDetailPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedNode = selectedId ? findNodeById(selectedId) : null;
  const selectedLayer = selectedId ? findLayerForNode(selectedId) : null;

  useEffect(() => {
    setIsModalOpen(false);
  }, [selectedId]);

  if (isMobile) {
    return (
      <>
        {/* Floating pill button -- visible whenever a node is selected */}
        <AnimatePresence>
          {selectedNode && selectedLayer && !isModalOpen && (
            <MobileInfoFab
              key={`fab-${selectedId}`}
              selectedNode={selectedNode}
              selectedLayer={selectedLayer}
              onOpen={() => setIsModalOpen(true)}
            />
          )}
        </AnimatePresence>

        {/* 75% modal overlay -- appears when user taps the FAB */}
        <AnimatePresence>
          {selectedNode && selectedLayer && isModalOpen && (
            <MobileDetailModal
              key="mobile-modal"
              selectedNode={selectedNode}
              selectedLayer={selectedLayer}
              onSelectId={(id) => {
                onSelectId(id);
                if (!id) setIsModalOpen(false);
              }}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <AnimatePresence>
      {selectedNode && selectedLayer && (
        <DesktopSidebar
          key="desktop-sidebar"
          selectedNode={selectedNode}
          selectedLayer={selectedLayer}
          onSelectId={onSelectId}
        />
      )}
    </AnimatePresence>
  );
}

// ─── Connection card sub-component ───────────────────────────────────────────

interface ConnectionCardProps {
  node: NodeDef;
  layer: LayerDef | undefined;
  relationLabel: string;
  direction: 'in' | 'out';
  onClick: () => void;
}

function ConnectionCard({ node, layer, relationLabel, direction, onClick }: ConnectionCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${direction === 'out' ? 'Connects to' : 'Receives from'} ${node.label} via ${relationLabel}`}
      style={{
        background: hovered ? 'var(--nd-background)' : 'rgba(255,255,255,0.03)',
        border: '1px solid var(--nd-border)',
        borderRadius: 'var(--nd-radius)',
        padding: '9px 12px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        display: 'block',
        transition: 'background 0.12s',
        color: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
        {direction === 'in' ? (
          <ArrowLeft size={11} style={{ color: layer?.cssColor || 'var(--nd-muted)', flexShrink: 0 }} />
        ) : (
          <ArrowRight size={11} style={{ color: layer?.cssColor || 'var(--nd-muted)', flexShrink: 0 }} />
        )}
        <span style={{ color: 'var(--nd-muted-foreground)', fontSize: 'var(--nd-text-sm)', opacity: 0.8 }}>
          {relationLabel}
        </span>
      </div>
      <div style={{ paddingLeft: '17px' }}>
        <p
          style={{
            margin: 0,
            color: 'var(--nd-foreground)',
            fontSize: 'var(--nd-text-sm)',
            fontWeight: 'var(--nd-font-weight-medium)',
            lineHeight: 1.3,
          }}
        >
          {node.label}
        </p>
        {layer && (
          <span style={{ color: 'var(--nd-muted-foreground)', fontSize: 'var(--nd-text-sm)', opacity: 0.85 }}>
            {layer.label}
          </span>
        )}
      </div>
    </button>
  );
}
