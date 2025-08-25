
import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

const pageConfigs = [
  {
    key: 'Shop',
    label: 'Shop',
  // icon: ShopIcon,
  background: '/src/assets/Screenshot 2025-08-24 at 16-22-50 Lisa Games.png',
    items: Array.from({ length: 16 }, (_, i) => ({
      id: i,
      label: `Shop Item ${i + 1}`,
      x: 40 + (i % 4) * 120,
      y: 40 + Math.floor(i / 4) * 80,
      width: 100,
      height: 50,
    })),
  },
  {
    key: 'Tasks',
    label: 'Tasks',
  // icon: TasksIcon,
    background: '',
    items: Array.from({ length: 8 }, (_, i) => ({
      id: i,
      label: `Task ${i + 1}`,
      x: 60 + (i % 2) * 220,
      y: 60 + Math.floor(i / 2) * 120,
      width: 180,
      height: 60,
    })),
  },
  // Add more page configs as needed...
];

export default function LayoutEditor() {
  const [page, setPage] = useState(pageConfigs[0].key);
  const config = pageConfigs.find(p => p.key === page) || pageConfigs[0];
  const [items, setItems] = useState(config.items);

  // When page changes, reset items to default for that page
  useEffect(() => {
    setItems(config.items);
  }, [page, config.items]);

  const handleDrag = (idx, e, data) => {
    setItems(items => items.map((item, i) =>
      i === idx ? { ...item, x: data.x, y: data.y } : item
    ));
  };

  const handleResize = (idx, deltaW, deltaH) => {
    setItems(items => items.map((item, i) =>
      i === idx ? { ...item, width: Math.max(40, item.width + deltaW), height: Math.max(30, item.height + deltaH) } : item
    ));
  };

  const exportPositions = () => {
    const out = items.map(({ x, y, width, height }) => ({ x, y, width, height }));
    alert(JSON.stringify(out, null, 2));
  };

  return (
    <div style={{
      width: 600, height: 600, border: '2px solid #888', margin: '40px auto', position: 'relative', background: config.background ? `url(${config.background})` : '#222',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 101 }}>
        <select value={page} onChange={e => setPage(e.target.value)} style={{ fontSize: 16, padding: 4 }}>
          {pageConfigs.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>
      {items.map((item, idx) => (
        <Draggable
          key={item.id}
          position={{ x: item.x, y: item.y }}
          onDrag={(e, data) => handleDrag(idx, e, data)}
        >
          <div
            style={{
              position: 'absolute',
              width: item.width,
              height: item.height,
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid #ff0',
              color: '#111',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'move',
              zIndex: 10,
              userSelect: 'none',
            }}
          >
            {item.label}
            <span
              style={{
                position: 'absolute',
                right: 2, bottom: 2, width: 16, height: 16, background: '#fff', color: '#000', fontSize: 12, cursor: 'nwse-resize', borderRadius: 3, border: '1px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11
              }}
              onMouseDown={e => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const move = (ev) => {
                  handleResize(idx, ev.clientX - startX, ev.clientY - startY);
                };
                const up = () => {
                  window.removeEventListener('mousemove', move);
                  window.removeEventListener('mouseup', up);
                };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
              }}
            >↔️</span>
          </div>
        </Draggable>
      ))}
      <button
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 100, padding: '8px 16px', fontWeight: 700 }}
        onClick={exportPositions}
      >
        Export Positions
      </button>
    </div>
  );
}
