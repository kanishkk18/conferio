// components/time-tracking/InactivityModal.tsx
import React from 'react';
import { AlertTriangle, Play, Pause, Square } from 'lucide-react';

interface InactivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'continue' | 'stop' | 'pause') => void;
  inactiveMinutes: number;
}

export function InactivityModal({ isOpen, onClose, onAction, inactiveMinutes }: InactivityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="size-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Away for {inactiveMinutes} minutes</h3>
              <p className="text-sm text-gray-500">Your timer has been auto-paused</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            You have been inactive for {inactiveMinutes} minutes. Your timer is currently paused.
            What would you like to do?
          </p>

          <div className="space-y-2">
            <button type="button"
              onClick={() => onAction('continue')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Play className="size-4" />
              Continue Tracking
            </button>

            <div className="flex gap-2">
              <button type="button"
                onClick={() => onAction('pause')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Pause className="size-4" />
                Stay Paused
              </button>

              <button
              type='reset'
                onClick={() => onAction('stop')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                <Square className="size-4" />
                Stop Timer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
