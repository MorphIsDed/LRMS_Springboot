import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const floors = [
  {
    floor: 3,
    rooms: [
      { id: 301, type: 'suite', status: 'occupied' },
      { id: 302, type: 'double', status: 'available' },
      { id: 303, type: 'double', status: 'available' },
      { id: 304, type: 'suite', status: 'maintenance' },
    ],
  },
  {
    floor: 2,
    rooms: [
      { id: 201, type: 'single', status: 'occupied' },
      { id: 202, type: 'single', status: 'occupied' },
      { id: 203, type: 'double', status: 'available' },
      { id: 204, type: 'double', status: 'occupied' },
    ],
  },
  {
    floor: 1,
    rooms: [
      { id: 101, type: 'deluxe', status: 'available' },
      { id: 102, type: 'deluxe', status: 'occupied' },
      { id: 103, type: 'single', status: 'available' },
      { id: 104, type: 'single', status: 'available' },
    ],
  },
];

const statusColors: { [key: string]: string } = {
  available: 'bg-gray-200/50 border-gray-300/60 text-gray-400',
  occupied: 'bg-blue-500/70 border-blue-600/80 text-white',
  maintenance: 'bg-amber-400/70 border-amber-500/80 text-amber-900',
};

export const IsometricMap = () => {
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; type: string; status: string } | null>(null);

  return (
    <div className="w-full h-full flex items-center justify-center perspective-[1200px]">
      <motion.div 
        className="transform-style-3d rotate-x-[60deg] rotate-z-[-45deg] scale-[0.8]"
        initial={{ opacity: 0, scale: 0.7, y: 100 }}
        animate={{ opacity: 1, scale: 0.8, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="relative">
          {floors.map((floor, index) => (
            <motion.div
              key={floor.floor}
              className="absolute transform-style-3d"
              style={{ transform: `translateZ(${index * 100}px)` }}
              initial={{ opacity: 0, z: index * 100 + 50 }}
              animate={{ opacity: 1, z: index * 100 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
            >
              <div className="grid grid-cols-2 gap-4">
                {floor.rooms.map((room) => (
                  <RoomCube key={room.id} room={room} onSelect={setSelectedRoom} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRoom(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-80"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold">Room {selectedRoom.id}</h3>
              <p className="text-sm text-gray-500 capitalize">{selectedRoom.type}</p>
              <div className={`mt-4 px-3 py-1 rounded-full inline-block text-xs font-medium ${statusColors[selectedRoom.status]}`}>
                {selectedRoom.status.toUpperCase()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RoomCube = ({ room, onSelect }: { room: any; onSelect: (room: any) => void }) => {
  const colorClass = statusColors[room.status];
  const isOccupied = room.status === 'occupied';

  return (
    <motion.div
      className="relative w-24 h-24 transform-style-3d cursor-pointer group"
      whileHover={{ scale: 1.1, z: 10 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => onSelect(room)}
    >
      {/* Top Face */}
      <div className={`absolute w-full h-full transform rotate-x-[-90deg] translate-z-[12px] ${colorClass} flex items-center justify-center`}>
        <span className="font-bold text-lg">{room.id}</span>
        {isOccupied && <div className="absolute inset-0 bg-blue-400/50 animate-pulse" />}
      </div>
      {/* Front Face */}
      <div className={`absolute w-full h-6 transform translate-z-[12px] -translate-y-3 ${colorClass.replace('bg-', 'bg-gradient-to-t from-').replace('/70', '/20 to-transparent')} border-none`} />
    </motion.div>
  );
};
