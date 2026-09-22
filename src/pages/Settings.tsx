import { useState } from 'react'
import { requestNotificationPermission } from '../notifications/notifications'
import { useSettings } from '../storage/useSettings'
import type { Settings as SettingsModel } from '../storage/storage'

function SettingsForm({
  settings,
  updateSettings,
}: {
  settings: SettingsModel
  updateSettings: (next: SettingsModel) => Promise<void>
}) {
  const [timeInput, setTimeInput] = useState(settings.morningNotificationTime)
  const [thresholdInput, setThresholdInput] = useState(String(settings.superOverdueDays))

  async function handleMorningReminderToggle(enabled: boolean) {
    if (enabled) {
      await requestNotificationPermission()
    }
    await updateSettings({ ...settings, morningNotificationEnabled: enabled })
  }

  function handleTimeChange(time: string) {
    setTimeInput(time)
    updateSettings({ ...settings, morningNotificationTime: time })
  }

  function handleThresholdChange(raw: string) {
    setThresholdInput(raw)
    const days = Number.parseInt(raw, 10)
    if (Number.isNaN(days)) return
    updateSettings({ ...settings, superOverdueDays: days })
  }

  return (
    <>
      <div className="settings__field">
        <label>
          <input
            type="checkbox"
            checked={settings.morningNotificationEnabled}
            onChange={(event) => handleMorningReminderToggle(event.target.checked)}
          />
          Morning reminder
        </label>
        <p className="settings__hint">
          A daily browser notification summarising anything more than {settings.superOverdueDays} days overdue.
        </p>
      </div>

      <div className="settings__field">
        <label htmlFor="morning-reminder-time">Time</label>
        <input
          id="morning-reminder-time"
          type="time"
          value={timeInput}
          onChange={(event) => handleTimeChange(event.target.value)}
        />
      </div>

      <div className="settings__field">
        <label htmlFor="super-overdue-threshold">Super overdue threshold</label>
        <input
          id="super-overdue-threshold"
          type="number"
          min={1}
          value={thresholdInput}
          onChange={(event) => handleThresholdChange(event.target.value)}
        />
        <span> days</span>
      </div>
    </>
  )
}

export function Settings() {
  const { settings, isLoaded, updateSettings } = useSettings()

  return (
    <section>
      <h1>Settings</h1>
      {isLoaded && <SettingsForm settings={settings} updateSettings={updateSettings} />}
    </section>
  )
}
