// Socket.io event emitter helper
// This function emits events to clients listening on a specific match room

export function emitMatchEvent(matchId: string, event: string, data: any) {
  if (typeof global !== 'undefined' && (global as any).io) {
    const io = (global as any).io;
    io.to(`match:${matchId}`).emit(event, data);
    io.emit(event, { match_id: matchId, ...data }); // Also broadcast globally for arena viewers
  }
}

export function emitGlobalEvent(event: string, data: any) {
  if (typeof global !== 'undefined' && (global as any).io) {
    const io = (global as any).io;
    io.emit(event, data);
  }
}
