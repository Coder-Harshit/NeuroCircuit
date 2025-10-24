import subprocess
import webbrowser
import sys
import os
import atexit
import signal

# --- Configuration ---
BACKEND_HOST = "127.0.0.1" # Keep backend local for security unless needed otherwise
BACKEND_PORT = 8000
FRONTEND_PORT = 5173
# ---------------------

backend_process = None
frontend_process = None

def get_base_dir():
    """Gets the directory where the script (or bundled exe) is running."""
    if getattr(sys, 'frozen', False):
        # If running as a bundled executable (PyInstaller)
        return os.path.dirname(sys.executable)
    else:
        # If running as a normal script
        return os.path.dirname(os.path.abspath(__file__))

def start_servers():
    global backend_process, frontend_process
    base_dir = get_base_dir()
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dist_dir = os.path.join(base_dir, "frontend", "dist")

    print(f"Base directory: {base_dir}")
    print(f"Backend directory: {backend_dir}")
    print(f"Frontend dist directory: {frontend_dist_dir}")

    if not os.path.isdir(backend_dir):
        print(f"ERROR: Backend directory not found at {backend_dir}")
        return False
    if not os.path.isdir(frontend_dist_dir):
        print(f"ERROR: Frontend 'dist' directory not found at {frontend_dist_dir}")
        print("Did the installer run 'npm run build' correctly?")
        return False

    try:
        # Start Backend (Uvicorn)
        print(f"Starting backend server on {BACKEND_HOST}:{BACKEND_PORT}...")
        # Use sys.executable to ensure we use the Python env PyInstaller bundles if needed
        # NOTE: Using 'uvicorn' assumes it's globally available or in the PATH.
        # If backend dependencies were installed in a venv *within* the installed {app}/backend,
        # this might need adjustment (e.g., calling the venv's python).
        # For simplicity now, we assume uvicorn is accessible.
        backend_command = [
            "uvicorn", "app.main:app",
            "--host", BACKEND_HOST,
            "--port", str(BACKEND_PORT)
        ]
        # Use DETACHED_PROCESS or CREATE_NEW_PROCESS_GROUP on Windows to help separate it
        # Use preexec_fn=os.setsid on Linux/macOS if needed, but start simple
        creationflags = 0
        if sys.platform == "win32":
            creationflags = subprocess.CREATE_NEW_PROCESS_GROUP

        backend_process = subprocess.Popen(
            backend_command,
            cwd=backend_dir,
            creationflags=creationflags
        )
        print(f"Backend process started with PID: {backend_process.pid}")

        # Start Frontend (Simple HTTP Server)
        print(f"Starting frontend server on 127.0.0.1:{FRONTEND_PORT}...")
        # Use sys.executable for the Python interpreter
        frontend_command = [
            sys.executable, "-m", "http.server",
            str(FRONTEND_PORT),
            "--directory", frontend_dist_dir
        ]
        frontend_process = subprocess.Popen(
            frontend_command,
            cwd=frontend_dist_dir, # Run from dist dir itself
             creationflags=creationflags
        )
        print(f"Frontend process started with PID: {frontend_process.pid}")

        return True

    except FileNotFoundError as e:
        print(f"ERROR: Command not found. Is uvicorn installed and in PATH? Details: {e}")
        return False
    except Exception as e:
        print(f"ERROR starting servers: {e}")
        return False

def stop_servers():
    print("Stopping servers...")
    # Attempt graceful termination first, then force if needed
    processes = [frontend_process, backend_process]
    for p in processes:
        if p and p.poll() is None: # If process exists and is running
            try:
                if sys.platform == "win32":
                    # Send Ctrl+C equivalent on Windows
                    p.send_signal(signal.CTRL_BREAK_EVENT)
                else:
                    # Send SIGTERM on Unix-like systems
                    p.send_signal(signal.SIGTERM)

                # Wait a short time for graceful shutdown
                p.wait(timeout=5)
                print(f"Process {p.pid} terminated gracefully.")
            except subprocess.TimeoutExpired:
                print(f"Process {p.pid} did not terminate gracefully, forcing kill.")
                p.kill() # Force kill if timeout expires
            except Exception as e:
                print(f"Error terminating process {p.pid}: {e}. Forcing kill.")
                p.kill() # Force kill on other errors

# Register the cleanup function to run when the script exits
atexit.register(stop_servers)

if __name__ == "__main__":
    if start_servers():
        print("Servers started. Opening browser...")
        # Open the browser to the frontend URL
        try:
             # Wait a tiny bit for servers to be ready
            import time
            time.sleep(2)
            webbrowser.open_new_tab(f"http://127.0.0.1:{FRONTEND_PORT}")
            print("Browser opened. Launcher will keep servers running in the background.")
            print("Close this window (or press Ctrl+C if run in terminal) to stop the servers.")
            # Keep the script running until manually closed or interrupted
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("Launcher interrupted by user.")
        except Exception as e:
            print(f"An error occurred: {e}")
    else:
        print("Failed to start servers. Please check the logs.")
        input("Press Enter to exit...") # Keep window open to see errors if run directly