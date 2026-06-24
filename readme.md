https://unvrs-labs-2.piyushsingh123443.workers.dev/new-frames-webp/frame_000001.webp

https://unvrs-labs-2.piyushsingh123443.workers.dev/new-frames-webp/frame_000300.webp

{
  "crons": [
    {
      "path": "/api/cron/send-scheduled-emails",
      "schedule": "*/5 * * * *"
    },
    { "path": "/api/workflows/cron", "schedule": "* * * * *" },
    {
      "path": "/api/cron/voice-reminders",
      "schedule": "*/5 * * * *"
    }

  ]
}