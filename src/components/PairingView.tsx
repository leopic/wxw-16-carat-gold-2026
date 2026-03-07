import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Round2Pairing, PairingSlot } from '../types';
import { t } from '../i18n';
import './PairingView.css';

type Props = {
  winners: string[];
  slots: PairingSlot[];
  onSlotsChange: (slots: PairingSlot[]) => void;
  onConfirm: (pairings: Round2Pairing[]) => void;
};

type DragData = {
  name: string;
  source: 'pool' | { slotIdx: number; position: 'winner1' | 'winner2' };
};

function PoolChip({ name, isSelected, onTap }: { name: string; isSelected: boolean; onTap: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool-${name}`,
    data: { name, source: 'pool' } satisfies DragData,
  });

  return (
    <button
      ref={setNodeRef}
      className={`pool-chip ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onTap}
      {...listeners}
      {...attributes}
    >
      {name}
    </button>
  );
}

function SlotButton({
  name,
  slotIdx,
  position,
  isReady,
  onTap,
}: {
  name: string | null;
  slotIdx: number;
  position: 'winner1' | 'winner2';
  isReady: boolean;
  onTap: () => void;
}) {
  const droppableId = `slot-${slotIdx}-${position}`;

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: droppableId });

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: droppableId,
    data: { name: name!, source: { slotIdx, position } } satisfies DragData,
    disabled: !name,
  });

  return (
    <button
      ref={(node) => { setDropRef(node); setDragRef(node); }}
      className={[
        'slot-btn',
        name ? 'filled' : '',
        isReady ? 'ready' : '',
        isOver ? 'drop-over' : '',
        isDragging ? 'dragging' : '',
      ].filter(Boolean).join(' ')}
      onClick={onTap}
      {...listeners}
      {...attributes}
    >
      {name ?? t('tapToPlace')}
    </button>
  );
}

export function PairingView({ winners, slots, onSlotsChange, onConfirm }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<DragData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const assigned = new Set(
    slots.flatMap((s) => [s.winner1, s.winner2].filter(Boolean))
  );
  const available = winners.filter((w) => !assigned.has(w));

  const handleWinnerTap = (name: string) => {
    if (selected === name) {
      setSelected(null);
      return;
    }
    setSelected(name);
  };

  const handleSlotTap = (slotIdx: number, position: 'winner1' | 'winner2') => {
    const current = slots[slotIdx][position];

    // If slot is filled, remove the wrestler back to pool
    if (current) {
      onSlotsChange(
        slots.map((s, i) => (i === slotIdx ? { ...s, [position]: null } : s))
      );
      return;
    }

    // If a wrestler is selected, place them
    if (selected) {
      onSlotsChange(
        slots.map((s, i) => (i === slotIdx ? { ...s, [position]: selected } : s))
      );
      setSelected(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveData(event.active.data.current as DragData);
    setSelected(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    const data = event.active.data.current as DragData;
    setActiveData(null);

    if (!over || !data) return;

    // Parse drop target: "slot-{idx}-{position}"
    const parts = (over.id as string).split('-');
    if (parts[0] !== 'slot') return;
    const targetIdx = Number(parts[1]);
    const targetPos = parts[2] as 'winner1' | 'winner2';

    // Don't drop on an already-filled slot
    if (slots[targetIdx][targetPos]) return;

    const next = slots.map((s, i) => {
      let updated = { ...s };

      // Clear source slot if dragging from a slot
      if (data.source !== 'pool' && i === data.source.slotIdx) {
        updated = { ...updated, [data.source.position]: null };
      }

      // Place in target
      if (i === targetIdx) {
        updated = { ...updated, [targetPos]: data.name };
      }

      return updated;
    });

    onSlotsChange(next);
  };

  const allFilled = slots.every((s) => s.winner1 && s.winner2);

  const handleConfirm = () => {
    if (!allFilled) return;
    onConfirm(
      slots.map((s) => ({
        winner1: s.winner1!,
        winner2: s.winner2!,
      }))
    );
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="pairing-view">
        <h1 className="pairing-title">{t('pairingTitle')}</h1>
        <p className="pairing-subtitle">{t('pairingSubtitle')}</p>

        <div className="winner-pool">
          {available.map((w) => (
            <PoolChip
              key={w}
              name={w}
              isSelected={selected === w}
              onTap={() => handleWinnerTap(w)}
            />
          ))}
          {available.length === 0 && assigned.size < winners.length && (
            <span className="pool-empty">{t('allPlaced')}</span>
          )}
        </div>

        <div className="pairing-slots">
          {slots.map((slot, i) => (
            <div key={i} className="pairing-slot">
              <div className="slot-header">
                <span className="slot-label">{t('match')} {i + 1}</span>
                {i < 2 && <span className="slot-side left-tag">{t('left')}</span>}
                {i >= 2 && <span className="slot-side right-tag">{t('right')}</span>}
              </div>
              <div className="slot-row">
                <SlotButton
                  name={slot.winner1}
                  slotIdx={i}
                  position="winner1"
                  isReady={!slot.winner1 && !!selected}
                  onTap={() => handleSlotTap(i, 'winner1')}
                />
                <span className="slot-vs">{t('vs')}</span>
                <SlotButton
                  name={slot.winner2}
                  slotIdx={i}
                  position="winner2"
                  isReady={!slot.winner2 && !!selected}
                  onTap={() => handleSlotTap(i, 'winner2')}
                />
              </div>
            </div>
          ))}
        </div>

        <button className="start-btn" onClick={handleConfirm} disabled={!allFilled}>
          {t('revealBrackets')}
        </button>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeData ? (
          <span className="pool-chip drag-overlay">{activeData.name}</span>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
