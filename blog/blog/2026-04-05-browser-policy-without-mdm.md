---
slug: browser-policy-without-mdm
title: "How to Enforce Browser Policies Without a MDM"
authors: [jaxvn]
tags: [browser-policy, chrome, edge, windows, powershell, security]
date: 2026-04-05
---

Most Vietnamese SMBs don't have Intune or SCCM. They have a mix of domain-joined PCs, workgroup machines, and sometimes both on the same floor. But you can still enforce consistent browser policies across all of them — using nothing but registry keys and a PowerShell script.

<!-- truncate -->

## Why Browser Policy Matters

Your browser is the #1 attack surface for most office workers. Phishing links, malicious extensions, HTTP sites that look legitimate — all of these land in the browser first.

The good news: Chrome and Edge both respect Windows Registry policies. You don't need a full MDM to lock them down. You just need the right registry keys and a way to deploy them.

## How It Works

Both Chrome and Edge read from:

```
HKLM\SOFTWARE\Policies\Google\Chrome\
HKLM\SOFTWARE\Policies\Microsoft\Edge\
```

Any value you write there overrides the browser's default behavior — and the user can't change it from the Settings UI. It's enforced silently, survives browser updates, and works identically whether the machine is on a domain or not.

## 15 Policies Worth Deploying

Here's what I recommend as a baseline for any organization:

| Policy | What it does | Risk level without it |
|--------|-------------|----------------------|
| `HomepageLocation` | Force internal portal as homepage | Low — UX only |
| `DefaultSearchProviderEnabled` | Lock default search engine | Medium — data leakage |
| `SafeBrowsingEnabled` | Enable phishing/malware protection | High |
| `PasswordManagerEnabled` | Disable built-in password manager | High (if using enterprise password manager) |
| `ExtensionInstallBlocklist` | Block all extensions by default | High |
| `ExtensionInstallAllowlist` | Whitelist approved extensions | Required with blocklist |
| `SSLErrorOverrideAllowed` | Prevent users bypassing SSL errors | High |
| `IncognitoModeAvailability` | Disable incognito/InPrivate | Medium |
| `AutofillCreditCardEnabled` | Disable credit card autofill | Medium |
| `AutofillAddressEnabled` | Disable address autofill | Low |
| `TranslateEnabled` | Control Google Translate | Low |
| `DeveloperToolsAvailability` | Restrict DevTools | Medium (prevents JS injection) |
| `SyncDisabled` | Disable browser account sync | High (data residency) |
| `BrowserSignin` | Control sign-in behavior | High |
| `MetricsReportingEnabled` | Control telemetry | Low — compliance only |

## Deploying via PowerShell

Each policy maps to a single registry value. A basic Set script looks like this:

```powershell
#Requires -RunAsAdministrator

function Ensure-RegistryPath {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -Path $Path -Force | Out-Null
    }
}

$ChromePath = "HKLM:\SOFTWARE\Policies\Google\Chrome"
$EdgePath   = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"

Ensure-RegistryPath $ChromePath
Ensure-RegistryPath $EdgePath

# Enable Safe Browsing
Set-ItemProperty -Path $ChromePath -Name "SafeBrowsingEnabled" -Value 1 -Type DWord
Set-ItemProperty -Path $EdgePath   -Name "SmartScreenEnabled"  -Value 1 -Type DWord
```

And every Set script should have a matching Remove script that cleans up the keys:

```powershell
#Requires -RunAsAdministrator

$ChromePath = "HKLM:\SOFTWARE\Policies\Google\Chrome"
$EdgePath   = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"

Remove-ItemProperty -Path $ChromePath -Name "SafeBrowsingEnabled" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path $EdgePath   -Name "SmartScreenEnabled"  -ErrorAction SilentlyContinue
```

This is the Set/Remove pattern — for every policy you deploy, you have a clean rollback path.

## Deploy via Action1

If you're using Action1 (free up to 200 endpoints — the right choice for Vietnamese SMBs), deployment is straightforward:

1. Upload the `.ps1` to Action1 → Scripts
2. Create a Policy, target by OU or tag
3. Set scheduled enforcement (weekly re-run to catch new machines)

The scripts run as SYSTEM with elevation, so no UAC prompts, no user interaction.

## Skip GPO If You Can

GPO works, but it has friction: you need a DC, you need the ADMX templates imported, and workgroup machines are excluded entirely. Registry-based PowerShell scripts work everywhere — domain, workgroup, Azure AD joined, hybrid. Same behavior, zero dependencies.

The only thing GPO gives you that scripts don't is real-time enforcement on policy change. For most SMBs, a weekly re-run schedule covers that gap.

## Use the Generator

Rather than writing these scripts by hand, I built a tool that generates ready-to-deploy Set and Remove `.ps1` scripts for all 15 policies above:

**[Browser Policy Manager → pcs.io.vn/tools/browser-policy](https://pcs.io.vn/tools/browser-policy)**

Select the policies you want, configure the values, and download two files: `Set-BrowserPolicy.ps1` and `Remove-BrowserPolicy.ps1`. Upload directly to Action1.

The tool covers Chrome and Edge simultaneously — one script pair, both browsers.
