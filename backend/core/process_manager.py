import subprocess
import os
import json
import atexit
from typing import Dict, Optional
from pathlib import Path

class DemoProcessManager:
    """Manages demo project processes and port allocation"""
    
    def __init__(self):
        self.processes: Dict[str, Dict] = {}
        self.base_port = 3001
        self.process_file = Path.home() / ".central-illustration" / "demo_processes.json"
        
        # Create directory if it doesn't exist
        self.process_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Load existing processes on startup
        self._load_processes()
        
        # Cleanup on exit
        atexit.register(self.cleanup_all)
    
    def _load_processes(self):
        """Load process info from file"""
        if self.process_file.exists():
            try:
                with open(self.process_file, 'r') as f:
                    self.processes = json.load(f)
            except:
                self.processes = {}
    
    def _save_processes(self):
        """Save process info to file"""
        try:
            with open(self.process_file, 'w') as f:
                json.dump(self.processes, f)
        except Exception as e:
            print(f"Error saving processes: {e}")
    
    def get_port_for_demo(self, folder_name: str) -> int:
        """Get or assign a port for a demo"""
        if folder_name in self.processes:
            return self.processes[folder_name]['port']
        else:
            # Find next available port
            used_ports = [p['port'] for p in self.processes.values()]
            port = self.base_port
            while port in used_ports:
                port += 1
            return port
    
    def start_demo(self, folder_name: str, project_path: str) -> Dict:
        """Start a demo project"""
        # Check if already running
        if folder_name in self.processes:
            pid = self.processes[folder_name].get('pid')
            if pid and self._is_process_running(pid):
                return {
                    'status': 'already_running',
                    'port': self.processes[folder_name]['port'],
                    'pid': pid
                }
        
        # Get port
        port = self.get_port_for_demo(folder_name)
        
        # Start the process
        try:
            demo_dir = Path(project_path) / folder_name
            
            if not demo_dir.exists():
                return {'status': 'error', 'message': f'Demo folder not found: {folder_name}'}
            
            # Change to demo directory and start
            env = os.environ.copy()
            env['PORT'] = str(port)
            
            process = subprocess.Popen(
                ['npm', 'run', 'dev', '--', '-p', str(port)],
                cwd=str(demo_dir),
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                start_new_session=True  # Detach from parent process
            )
            
            # Store process info
            self.processes[folder_name] = {
                'pid': process.pid,
                'port': port,
                'status': 'running',
                'path': str(demo_dir)
            }
            
            self._save_processes()
            
            return {
                'status': 'started',
                'port': port,
                'pid': process.pid
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def stop_demo(self, folder_name: str) -> Dict:
        """Stop a demo project"""
        if folder_name not in self.processes:
            return {'status': 'not_found'}
        
        pid = self.processes[folder_name].get('pid')
        if pid:
            try:
                # Try graceful termination first
                import signal
                os.kill(pid, signal.SIGTERM)
                
                # Wait a bit
                import time
                time.sleep(1)
                
                # Force kill if still running
                if self._is_process_running(pid):
                    os.kill(pid, signal.SIGKILL)
                
                del self.processes[folder_name]
                self._save_processes()
                
                return {'status': 'stopped'}
            except ProcessLookupError:
                # Process already gone
                del self.processes[folder_name]
                self._save_processes()
                return {'status': 'stopped'}
            except Exception as e:
                return {'status': 'error', 'message': str(e)}
        
        return {'status': 'not_running'}
    
    def get_demo_status(self, folder_name: str) -> Dict:
        """Get status of a demo"""
        if folder_name not in self.processes:
            return {'status': 'not_running', 'port': None}
        
        port = self.processes[folder_name]['port']
        pid = self.processes[folder_name].get('pid')
        
        if pid and self._is_process_running(pid):
            return {'status': 'running', 'port': port, 'pid': pid}
        else:
            # Process died
            del self.processes[folder_name]
            self._save_processes()
            return {'status': 'not_running', 'port': None}
    
    def _is_process_running(self, pid: int) -> bool:
        """Check if process is running"""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False
    
    def cleanup_all(self):
        """Cleanup all processes"""
        for folder_name in list(self.processes.keys()):
            self.stop_demo(folder_name)
    
    def list_all(self) -> Dict:
        """List all demo processes"""
        result = {}
        for folder_name, info in self.processes.items():
            pid = info.get('pid')
            if pid and self._is_process_running(pid):
                result[folder_name] = {
                    'status': 'running',
                    'port': info['port'],
                    'pid': pid
                }
            else:
                result[folder_name] = {'status': 'not_running', 'port': None}
        return result


# Global instance
process_manager = DemoProcessManager()

