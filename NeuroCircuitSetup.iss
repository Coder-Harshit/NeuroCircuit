#define MyAppName "NeuroCircuit"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "Harshit Vijay"
#define MyAppURL "https://github.com/Coder-Harshit/NeuroCircuit"
#define MyAppExeName "NeuroCircuitLauncher.exe"
#define AppOutputName "NeuroCircuit-Setup-{#MyAppVersion}"


[Setup]
; global settings
AppId={{AUTO}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
OutputBaseFilename={#AppOutputName}
Compression=lzma
SolidCompression=yes
WizardStyle=modern


[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"


[Tasks]
; Optional Components / Actions 
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked


[Files]
; files & dirs to be included within the installer
Source: "dist\NeuroCircuitLauncher.exe"; DestDir: "{app}"; Flags: ignoreversion

; BACKEND
Source: "backend\requirements.txt"; DestDir: "{app}\backend"; Flags: ignoreversion;
Source: "backend\app\*"; DestDir: "{app}\backend\app"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "backend\plugins\*"; DestDir: "{app}\backend\plugins"; Flags: ignoreversion recursesubdirs createallsubdirs

Source: "frontend\src\*"; DestDir: "{app}\frontend\src"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "frontend\index.html"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "frontend\package.json"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "frontend\tailwind.config.js"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "frontend\tsconfig.json"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "frontend\tsconfig.app.json"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "frontend\tsconfig.node.json"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "frontend\vite.config.ts"; DestDir: "{app}\frontend"; Flags: ignoreversion

Source: "docker-compose.yml"; DestDir: "{app}"; Flags: ignoreversion


[Icons]
; Creates shortcuts in Start Menu &/or Desktop
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon


[Run]
; After installation Execution
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent


[Code]
// Custom Logic (PASCAL SCRIPT)

// --- Global variables for user choices ---
var
  InstallTypePage: TInputOptionWizardPage;
  IsDockerInstall: Boolean;

// --- Function to execute a command and capture its output ---
function ExecAndGetOutput(const Command, Params: String; var Output: String): Boolean;
var
  TempFileName: String;
  ResultCode: Integer;
begin
  Result := False; // Assume failure
  Output := '';
  TempFileName := ExpandConstant('{tmp}\version_check.txt');

  // Execute command, redirecting output to a temporary file
  if Exec(ExpandConstant('{cmd}'), '/c ' + Command + ' ' + Params + ' > "' + TempFileName + '" 2>&1', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    
    if ResultCode = 0 then
    begin
      if LoadStringFromFile(TempFileName, Output) then
      begin
        Result := True; // Success!
      end
      else begin
        Log('Failed to read output file: ' + TempFileName);
      end;
    end
    else begin
      Log(Command + ' exited with code: ' + IntToStr(ResultCode));
      LoadStringFromFile(TempFileName, Output); // Try to get error message
    end;
  end
  else begin
    Log('Exec failed for command: ' + Command);
  end;
  DeleteFile(TempFileName);
end;

// --- Function to compare version strings (Major.Minor.Patch) ---
function CompareVersions(V1, V2: String): Boolean;
var
  P1, P2: Integer;
  Ver1, Ver2: TArrayOfString;
  Major1, Minor1, Patch1: Integer;
  Major2, Minor2, Patch2: Integer;
begin
  Result := False; // Default to V1 < V2

  // Ensure format consistency (add .0 if needed)
  P1 := Pos('.', V1);
  if P1 = 0 then V1 := V1 + '.0.0' else begin
    P2 := Pos('.', Copy(V1, P1 + 1, Length(V1)));
    if P2 = 0 then V1 := V1 + '.0';
  end;
  P1 := Pos('.', V2);
  if P1 = 0 then V2 := V2 + '.0.0' else begin
    P2 := Pos('.', Copy(V2, P1 + 1, Length(V2)));
    if P2 = 0 then V2 := V2 + '.0';
  end;

  // Simple parsing (may need refinement for complex versions)
  try
    Major1 := StrToIntDef(Copy(V1, 1, Pos('.', V1) - 1), 0);
    Delete(V1, 1, Pos('.', V1));
    Minor1 := StrToIntDef(Copy(V1, 1, Pos('.', V1) - 1), 0);
    Delete(V1, 1, Pos('.', V1));
    Patch1 := StrToIntDef(V1, 0);

    Major2 := StrToIntDef(Copy(V2, 1, Pos('.', V2) - 1), 0);
    Delete(V2, 1, Pos('.', V2));
    Minor2 := StrToIntDef(Copy(V2, 1, Pos('.', V2) - 1), 0);
    Delete(V2, 1, Pos('.', V2));
    Patch2 := StrToIntDef(V2, 0);

    // Comparison logic
    if Major1 > Major2 then Result := True
    else if Major1 = Major2 then begin
      if Minor1 > Minor2 then Result := True
      else if Minor1 = Minor2 then begin
        if Patch1 >= Patch2 then Result := True;
      end;
    end;
  except
    Log('Error parsing version strings during comparison: "' + V1 + '" vs "' + V2 + '"');
    Result := False; // Fail comparison on error
  end;
end;

// --- Function to extract version number from command output ---
function ExtractVersion(Output: String; Prefix: String): String;
var
  P: Integer;
  VersionStr: String;
  TrimChars: String;
begin
  Result := '';
  TrimChars := #13#10' ' + #9; // CR, LF, Space, Tab

  P := Pos(Prefix, Output);
  if P > 0 then
  begin
    // Get substring after prefix
    VersionStr := Copy(Output, P + Length(Prefix), Length(Output));
    // Remove potential leading 'v'
    if (Length(VersionStr) > 0) and (VersionStr[1] = 'v') then
      VersionStr := Copy(VersionStr, 2, Length(VersionStr));

    // Trim leading/trailing whitespace and newlines
    VersionStr := TrimLeft(VersionStr);
    VersionStr := TrimRight(VersionStr);

    // Take only the part before any unexpected character (like space after version)
    P := Pos(' ', VersionStr);
    if P > 0 then VersionStr := Copy(VersionStr, 1, P - 1);

    Result := VersionStr;
  end;
end;
  
// --- Function to create the custom page ---
procedure InitializeWizard();
begin
  // Create the custom page for installation type
  InstallTypePage := CreateInputOptionPage(wpSelectDir,
    'Choose Installation Type', 'Select how you want to install NeuroCircuit',
    'Please select the installation method:', True, False);

  // Add radio buttons
  InstallTypePage.Add('Containerized (Recommended - Requires Docker Desktop)');
  InstallTypePage.Add('Local Machine (Requires Python 3.11+, Node.js 22+, Git)');

  // Set default selection (e.g., Docker)
  InstallTypePage.Values[0] := True;
  IsDockerInstall := True; // Set initial default variable
end;

// --- Function to store user choice when moving to next page ---
function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True; // Allow moving to the next page by default
  if CurPageID = InstallTypePage.ID then begin
    IsDockerInstall := InstallTypePage.Values[0];
    if IsDockerInstall then Log('User selected Docker install.')
    else Log('User selected Local install.');
  end;
end;

// --- Placeholder for Prerequisite Check Functions ---
function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ErrorCode: Integer;
  CmdOutput: String;
  DetectedVersion: String;
  RequiredPythonVersion: String;
  RequiredNodeVersion: String;
begin
  // This function runs before installation starts
  
  Result := ''; // Assume success
  RequiredPythonVersion := '3.11.0';
  RequiredNodeVersion := '22.0.0';
  
  if IsDockerInstall then
  begin
    Log('Checking for Docker...');
    if not Exec(ExpandConstant('{cmd}'), '/c docker --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode) or (ErrorCode <> 0) then begin
      MsgBox('Docker Desktop was not found or failed to run.'#13#10#13#10'Please install it from https://www.docker.com/products/docker-desktop/ and ensure it is running.', mbError, MB_OK);
      Result := 'Docker check failed.'; Exit;
    end else Log('Docker found.');
  end
  else
  begin
    Log('Checking for Python, Node, Git...');
    // TODO: Add Exec calls for python --version, node --version, git --version
    
    // PYTHON CHECK
    Log('Checking Python Version');
    CmdOutput := ''; // Reset output
    if not ExecAndGetOutput('python', '--version', CmdOutput) then
        ExecAndGetOutput('py', '--version', CmdOutput); // Try 'py' launcher

    if CmdOutput = '' then begin
      MsgBox('Python was not found.'#13#10#13#10'Please install Python ' + RequiredPythonVersion + '+ from https://www.python.org/downloads/ (ensure it''s added to PATH).', mbError, MB_OK);
      Result := 'Python not found.'; Exit;
    end;
    DetectedVersion := ExtractVersion(CmdOutput, 'Python ');
    Log('Detected Python version string: "' + DetectedVersion + '"');
    if not CompareVersions(DetectedVersion, RequiredPythonVersion) then begin
      MsgBox('Incorrect Python version detected (' + DetectedVersion + '). Version ' + RequiredPythonVersion + ' or later is required.'#13#10#13#10'Please install/update from https://www.python.org/downloads/', mbError, MB_OK);
      Result := 'Python version too old.'; Exit;
    end else Log('Python version OK.');

    // --- NODE CHECK ---
    Log('Checking Node.js version...');
    CmdOutput := ''; // Reset output
    if not ExecAndGetOutput('node', '--version', CmdOutput) then begin
      MsgBox('Node.js was not found.'#13#10#13#10'Please install Node.js ' + RequiredNodeVersion + '+ from https://nodejs.org/ (ensure it''s added to PATH).', mbError, MB_OK);
      Result := 'Node.js not found.'; Exit;
    end;
    DetectedVersion := ExtractVersion(CmdOutput, 'v');
    Log('Detected Node.js version string: "' + DetectedVersion + '"');
    if not CompareVersions(DetectedVersion, RequiredNodeVersion) then begin
      MsgBox('Incorrect Node.js version detected (' + DetectedVersion + '). Version ' + RequiredNodeVersion + ' or later is required.'#13#10#13#10'Please install/update from https://nodejs.org/', mbError, MB_OK);
      Result := 'Node.js version too old.'; Exit;
    end else Log('Node.js version OK.');

    // --- GIT CHECK (Existence only) ---
    Log('Checking Git existence...');
    if not Exec(ExpandConstant('{cmd}'), '/c git --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode) or (ErrorCode <> 0) then begin
      MsgBox('Git was not found.'#13#10#13#10'Please install Git from https://git-scm.com/download/win (ensure it''s added to PATH).', mbError, MB_OK);
      Result := 'Git not found.'; Exit;
    end else Log('Git found.');
  end;
end;

// --- Placeholder for Post-Install Steps ---
procedure CurStepChanged(CurStep: TSetupStep);
var
  StatusText: string;
  ResultCode: Integer;
  FrontendDir: String;
  BackendDir: String;
begin
  if CurStep = ssPostInstall then
  begin
    Log('Post-install step reached. Install type Docker: ' + BoolToStr(IsDockerInstall));
    FrontendDir := ExpandConstant('{app}\frontend');
    BackendDir := ExpandConstant('{app}\backend');
    
    if IsDockerInstall then
    begin
      StatusText := WizardForm.StatusLabel.Caption; // Save current status
      WizardForm.StatusLabel.Caption := 'Pulling Docker images (this may take a while)...';
      WizardForm.ProgressGauge.Style := npbstMarquee; // Indeterminate progress

      Log('Pulling frontend Docker image...');
      Exec(ExpandConstant('{cmd}'), '/c docker pull ghcr.io/coder-harshit/neurocircuit-frontend:latest', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
      if ResultCode <> 0 then Log('Failed to pull frontend image. Code: ' + IntToStr(ResultCode));

      Log('Pulling backend Docker image...');
      Exec(ExpandConstant('{cmd}'), '/c docker pull ghcr.io/coder-harshit/neurocircuit-backend:latest', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
      if ResultCode <> 0 then Log('Failed to pull backend image. Code: ' + IntToStr(ResultCode));

      WizardForm.StatusLabel.Caption := 'Starting containers using Docker Compose...';
      Log('Running docker-compose up...');
      Exec(ExpandConstant('{cmd}'), '/c docker-compose -f "' + ExpandConstant('{app}\docker-compose.yml') + '" up -d', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
      if ResultCode <> 0 then Log('Failed to start Docker containers. Code: ' + IntToStr(ResultCode));

      WizardForm.ProgressGauge.Style := npbstNormal; // Restore normal progress bar
      WizardForm.StatusLabel.Caption := StatusText; // Restore original status
    end
    else
    begin
      StatusText := WizardForm.StatusLabel.Caption;
      WizardForm.ProgressGauge.Style := npbstMarquee;

      // Install Frontend Dependencies
      WizardForm.StatusLabel.Caption := 'Installing frontend dependencies (npm install)...';
      Log('Running npm install in ' + FrontendDir);
      // Use 'npm.cmd' on Windows
      Exec(ExpandConstant('{cmd}'), '/c npm.cmd install', FrontendDir, SW_HIDE, ewWaitUntilTerminated, ResultCode);
      if ResultCode <> 0 then Log('npm install failed. Code: ' + IntToStr(ResultCode));

      // Build Frontend
      WizardForm.StatusLabel.Caption := 'Building frontend (npm run build)...';
      Log('Running npm run build in ' + FrontendDir);
      Exec(ExpandConstant('{cmd}'), '/c npm.cmd run build', FrontendDir, SW_HIDE, ewWaitUntilTerminated, ResultCode);
      if ResultCode <> 0 then Log('npm run build failed. Code: ' + IntToStr(ResultCode));

      // Install Backend Dependencies
      WizardForm.StatusLabel.Caption := 'Installing backend dependencies...';
      Log('Running pip install in ' + BackendDir);
      Exec(ExpandConstant('{cmd}'), '/c pip install -r requirements.txt', BackendDir, SW_HIDE, ewWaitUntilTerminated, ResultCode);
      if ResultCode <> 0 then Log('pip install failed. Code: ' + IntToStr(ResultCode));

      WizardForm.ProgressGauge.Style := npbstNormal;
      WizardForm.StatusLabel.Caption := StatusText;
    end;
  end;
end;

end.

[UninstallDelete]
; Files/Folder to remove during uninstallation
Type: filesandordirs; Name: "{app}" ; Tasks: ""
