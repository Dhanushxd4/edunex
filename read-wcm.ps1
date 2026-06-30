Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class CredReader {
    [StructLayout(LayoutKind.Sequential)]
    private struct FILETIME { public uint lo; public uint hi; }
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    private struct CRED {
        public uint Flags, Type;
        public IntPtr TargetName, Comment;
        public FILETIME LastWritten;
        public uint BlobSize;
        public IntPtr Blob;
        public uint Persist, AttrCount;
        public IntPtr Attrs, TargetAlias, UserName;
    }
    [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern bool CredRead(string t, uint tp, int r, out IntPtr p);
    [DllImport("advapi32.dll")]
    static extern void CredFree(IntPtr p);
    [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern bool CredEnumerate(string filter, int flags, out int count, out IntPtr pCredentials);
    public static string Get(string target) {
        IntPtr p = IntPtr.Zero;
        try {
            if (!CredRead(target, 1, 0, out p)) return null;
            var c = (CRED)Marshal.PtrToStructure(p, typeof(CRED));
            if (c.BlobSize == 0 || c.Blob == IntPtr.Zero) return null;
            byte[] b = new byte[c.BlobSize];
            Marshal.Copy(c.Blob, b, 0, (int)c.BlobSize);
            // Try UTF-8 first (most common for PATs), then Unicode
            string utf8 = Encoding.UTF8.GetString(b);
            if (utf8.StartsWith("ghp_") || utf8.StartsWith("github_pat_") || utf8.StartsWith("gho_")) return utf8;
            string ascii = Encoding.ASCII.GetString(b);
            if (ascii.StartsWith("ghp_") || ascii.StartsWith("github_pat_") || ascii.StartsWith("gho_")) return ascii;
            // Return raw UTF-8 and let caller decide
            return utf8;
        } finally { if (p != IntPtr.Zero) CredFree(p); }
    }
    public static string GetTargetName(string target) {
        IntPtr p = IntPtr.Zero;
        try {
            if (!CredRead(target, 1, 0, out p)) return null;
            var c = (CRED)Marshal.PtrToStructure(p, typeof(CRED));
            return Marshal.PtrToStringUni(c.TargetName);
        } finally { if (p != IntPtr.Zero) CredFree(p); }
    }
}
"@

Write-Host "=== Scanning Windows Credential Manager for GitHub tokens ==="

$targets = @(
    "GitHub - https://api.github.com/Dhanushxd4",
    "git:https://github.com",
    "git:https://Dhanushxd4@github.com",
    "GitHub for Windows",
    "GitHub Desktop",
    "https://github.com",
    "https://Dhanushxd4@github.com"
)

$found = $false
foreach ($t in $targets) {
    try {
        $pwd = [CredReader]::Get($t)
        if ($pwd -and $pwd.Trim().Length -gt 0) {
            Write-Host "FOUND: $t"
            $trimmed = $pwd.Trim()
            Write-Host "First 20 chars: $($trimmed.Substring(0, [Math]::Min(20, $trimmed.Length)))"
            Write-Host "Is PAT (ghp_): $($trimmed.StartsWith('ghp_'))"
            Write-Host "Is OAuth (gho_): $($trimmed.StartsWith('gho_'))"
            # Save token for use by bat
            [System.IO.File]::WriteAllText("C:\Users\admin\Downloads\edunex\.github-token.tmp", $trimmed)
            Write-Host "Saved to .github-token.tmp"
            $found = $true
            break
        } else {
            Write-Host "NOT FOUND: $t"
        }
    } catch {
        Write-Host "ERROR reading $t`: $_"
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "No GitHub credentials found in WCM."
    Write-Host "Trying cmdkey list..."
    $ck = cmdkey /list 2>&1
    $ck | Where-Object { $_ -match "github" } | ForEach-Object { Write-Host $_ }
}
