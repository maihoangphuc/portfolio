#!/usr/bin/env bash
# Stop hook: pop a Windows MessageBox alert when Claude finishes a task,
# and emit a systemMessage so the same notice shows inside the Claude Code UI.

# Consume stdin (Claude Code pipes hook-input JSON; we don't need its contents).
cat > /dev/null

# Fire the alert in a detached PowerShell process so this hook returns
# immediately — otherwise the MessageBox would block the session until OK.
powershell -NoProfile -Command "Start-Process powershell -WindowStyle Hidden -ArgumentList @('-NoProfile','-Command','Add-Type -AssemblyName System.Windows.Forms | Out-Null; [System.Windows.Forms.MessageBox]::Show(\"Claude finished the current task.\",\"Claude Code\",[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null') | Out-Null" >/dev/null 2>&1

# JSON output → also shows in the Claude UI.
printf '%s\n' '{"systemMessage":"Claude finished the current task."}'
