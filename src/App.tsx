/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  BookOpen, 
  Copy, 
  Download,
  Info,
  Lock,
  Network,
  Cpu,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Packet {
  id: string;
  sourceIp: string;
  destIp: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'DNS';
  length: number;
  status: 'Normal' | 'Suspicious';
  timestamp: string;
}

// --- Mock Data Generator ---
const generateMockPacket = (): Packet => {
  const protocols: ('TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'DNS')[] = ['TCP', 'UDP', 'ICMP', 'HTTP', 'DNS'];
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const length = Math.floor(Math.random() * 1500) + 40;
  
  // Logic for "Suspicious" packets as per user requirements
  // Unusually large (> 1200 bytes) or "Unknown" (simulated here as DNS for variety)
  const isSuspicious = length > 1200 || protocol === 'DNS';

  return {
    id: Math.random().toString(36).substr(2, 9),
    sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
    destIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    protocol,
    length,
    status: isSuspicious ? 'Suspicious' : 'Normal',
    timestamp: new Date().toLocaleTimeString(),
  };
};

// --- Python Code Content ---
const PYTHON_CODE = `import tkinter as tk
from tkinter import scrolledtext, messagebox
from scapy.all import sniff, IP, TCP, UDP, ICMP
import threading

class PacketSnifferGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Network Packet Sniffer - Cybersecurity Project")
        self.root.geometry("800x600")
        self.root.configure(bg="#f0f2f5")

        # Control Variables
        self.sniffing = False
        self.sniffer_thread = None

        # --- GUI Layout ---
        # Title Heading
        self.title_label = tk.Label(
            root, text="Network Packet Sniffer", 
            font=("Helvetica", 20, "bold"), bg="#f0f2f5", fg="#1a73e8"
        )
        self.title_label.pack(pady=20)

        # Scrolling Text Area for Packet Info
        self.text_area = scrolledtext.ScrolledText(
            root, width=90, height=20, font=("Courier New", 10)
        )
        self.text_area.pack(padx=20, pady=10)
        self.text_area.insert(tk.END, "Source IP | Destination IP | Protocol | Length | Status\\n")
        self.text_area.insert(tk.END, "-"*80 + "\\n")
        self.text_area.configure(state='disabled')

        # Buttons Frame
        self.btn_frame = tk.Frame(root, bg="#f0f2f5")
        self.btn_frame.pack(pady=20)

        self.start_btn = tk.Button(
            self.btn_frame, text="Start Sniffing", command=self.start_sniffing,
            bg="#34a853", fg="white", font=("Helvetica", 12, "bold"), width=15
        )
        self.start_btn.grid(row=0, column=0, padx=10)

        self.stop_btn = tk.Button(
            self.btn_frame, text="Stop Sniffing", command=self.stop_sniffing,
            bg="#ea4335", fg="white", font=("Helvetica", 12, "bold"), width=15,
            state='disabled'
        )
        self.stop_btn.grid(row=0, column=1, padx=10)

    def packet_callback(self, packet):
        """Processes each captured packet."""
        if not self.sniffing:
            return

        if IP in packet:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            proto = "Unknown"
            length = len(packet)

            if TCP in packet: proto = "TCP"
            elif UDP in packet: proto = "UDP"
            elif ICMP in packet: proto = "ICMP"

            # Suspicious Traffic Detection Logic
            # Criteria: Unusually large (> 1200 bytes) or Unknown protocol
            status = "✓ Normal Packet"
            if length > 1200 or proto == "Unknown":
                status = "⚠ Suspicious Packet"

            display_str = f"{src_ip} → {dst_ip} | {proto} | {length} bytes | {status}\\n"
            
            # Update GUI from thread safely
            self.root.after(0, self.update_text_area, display_str)

    def update_text_area(self, content):
        """Inserts text into the scrolling area."""
        self.text_area.configure(state='normal')
        self.text_area.insert(tk.END, content)
        self.text_area.see(tk.END) # Auto-scroll
        self.text_area.configure(state='disabled')

    def start_sniffing(self):
        """Initializes packet capture in a background thread."""
        self.sniffing = True
        self.start_btn.config(state='disabled')
        self.stop_btn.config(state='normal')
        self.text_area.configure(state='normal')
        self.text_area.insert(tk.END, "\\n[!] Sniffing Started...\\n")
        self.text_area.configure(state='disabled')

        # Run Scapy sniff in a separate thread to keep GUI responsive
        self.sniffer_thread = threading.Thread(target=self.run_sniffer, daemon=True)
        self.sniffer_thread.start()

    def run_sniffer(self):
        """The actual sniffing loop."""
        sniff(prn=self.packet_callback, stop_filter=lambda x: not self.sniffing)

    def stop_sniffing(self):
        """Stops the packet capture."""
        self.sniffing = False
        self.start_btn.config(state='normal')
        self.stop_btn.config(state='disabled')
        self.text_area.configure(state='normal')
        self.text_area.insert(tk.END, "[!] Sniffing Stopped.\\n")
        self.text_area.configure(state='disabled')

if __name__ == "__main__":
    root = tk.Tk()
    app = PacketSnifferGUI(root)
    root.mainloop()
`;

// --- Main Component ---
export default function App() {
  const [isSniffing, setIsSniffing] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [activeTab, setActiveTab] = useState<'simulation' | 'code' | 'guide'>('simulation');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulation Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSniffing) {
      interval = setInterval(() => {
        setPackets(prev => [...prev.slice(-49), generateMockPacket()]);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isSniffing]);

  // Auto-scroll simulation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [packets]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(PYTHON_CODE);
    alert('Python code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">CyberSniff v1.0</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Packet Analysis Tool</p>
            </div>
          </div>
          <nav className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            {[
              { id: 'simulation', label: 'Live Demo', icon: Play },
              { id: 'code', label: 'Source Code', icon: Terminal },
              { id: 'guide', label: 'Project Guide', icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                    : 'hover:bg-white/5 text-zinc-400'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Simulation Tab */}
          {activeTab === 'simulation' && (
            <motion.div
              key="sim"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls & Stats */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-500" />
                      Control Panel
                    </h2>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => setIsSniffing(true)}
                        disabled={isSniffing}
                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                          isSniffing 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                            : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Start Sniffing
                      </button>
                      <button
                        onClick={() => setIsSniffing(false)}
                        disabled={!isSniffing}
                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                          !isSniffing 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                            : 'bg-red-500 text-white hover:bg-red-400 active:scale-[0.98]'
                        }`}
                      >
                        <Square className="w-4 h-4 fill-current" />
                        Stop Sniffing
                      </button>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Status</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${isSniffing ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
                          {isSniffing ? 'ACTIVE' : 'IDLE'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Packets Captured</span>
                        <span className="text-xs font-mono text-white">{packets.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Suspicious Detected</span>
                        <span className="text-xs font-mono text-red-400">
                          {packets.filter(p => p.status === 'Suspicious').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-white">Browser Limitation</h3>
                        <p className="text-xs leading-relaxed text-zinc-400">
                          This is a <strong>simulated demonstration</strong>. Real network packet sniffing requires raw socket access, which is restricted in web browsers for security. Use the provided Python code to run a real sniffer locally.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Packet Feed */}
                <div className="lg:col-span-2 bg-black border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[600px]">
                  <div className="bg-zinc-900/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 ml-4 uppercase tracking-widest">Live Traffic Feed</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-600">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 scrollbar-thin scrollbar-thumb-zinc-800"
                  >
                    <div className="grid grid-cols-12 gap-2 text-zinc-500 border-b border-white/5 pb-2 mb-4 sticky top-0 bg-black">
                      <div className="col-span-3">SOURCE IP</div>
                      <div className="col-span-3">DESTINATION IP</div>
                      <div className="col-span-1">PROTO</div>
                      <div className="col-span-2">LENGTH</div>
                      <div className="col-span-3">STATUS</div>
                    </div>

                    {packets.length === 0 && !isSniffing && (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 opacity-50">
                        <Network className="w-12 h-12" />
                        <p>Click "Start Sniffing" to begin traffic analysis</p>
                      </div>
                    )}

                    {packets.map((packet) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={packet.id} 
                        className={`grid grid-cols-12 gap-2 py-1 border-b border-white/5 hover:bg-white/5 transition-colors ${
                          packet.status === 'Suspicious' ? 'text-red-400 bg-red-500/5' : 'text-zinc-300'
                        }`}
                      >
                        <div className="col-span-3 truncate">{packet.sourceIp}</div>
                        <div className="col-span-3 truncate">{packet.destIp}</div>
                        <div className="col-span-1">{packet.protocol}</div>
                        <div className="col-span-2">{packet.length} B</div>
                        <div className="col-span-3 flex items-center gap-1.5">
                          {packet.status === 'Suspicious' ? (
                            <><AlertTriangle className="w-3 h-3" /> ⚠ Suspicious</>
                          ) : (
                            <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> ✓ Normal</>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Python Implementation</h2>
                  <p className="text-zinc-400 text-sm">Full source code using Scapy and Tkinter.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </button>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <pre className="relative bg-zinc-950 border border-white/10 rounded-2xl p-8 overflow-x-auto font-mono text-sm leading-relaxed text-zinc-300 scrollbar-thin scrollbar-thumb-zinc-800">
                  <code>{PYTHON_CODE}</code>
                </pre>
              </div>
            </motion.div>
          )}

          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Setup Instructions */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                    <Download className="w-4 h-4 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Setup & Installation</h2>
                </div>
                
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">1. Install Python</h3>
                    <p className="text-xs text-zinc-400">Download and install Python from <a href="https://python.org" className="text-emerald-500 hover:underline">python.org</a>. Ensure "Add to PATH" is checked.</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">2. Install Dependencies</h3>
                    <p className="text-xs text-zinc-400 mb-2">Open your terminal and run:</p>
                    <div className="bg-black rounded-lg p-3 font-mono text-xs text-emerald-400 border border-white/5">
                      pip install scapy
                    </div>
                    <p className="text-[10px] text-zinc-500 italic">Note: Tkinter is usually pre-installed with Python.</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">3. Run in VS Code</h3>
                    <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
                      <li>Create a new file named <code className="text-zinc-200">sniffer.py</code></li>
                      <li>Paste the source code from the "Source Code" tab</li>
                      <li>Run with administrative privileges (required for Scapy)</li>
                      <li>On Windows: Run VS Code as Administrator</li>
                      <li>On Linux/Mac: <code className="text-zinc-200">sudo python3 sniffer.py</code></li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Educational Content */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
                    <Lock className="w-4 h-4 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Security Analysis</h2>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">Why Packet Sniffing?</h3>
                    <p className="text-xs leading-relaxed text-zinc-400">
                      Packet sniffing is a core technique in network security. It allows analysts to:
                    </p>
                    <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
                      <li>Detect unauthorized data exfiltration</li>
                      <li>Identify misconfigured network devices</li>
                      <li>Troubleshoot connectivity issues</li>
                      <li>Monitor for clear-text sensitive data (like passwords)</li>
                    </ul>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest">
                      <AlertTriangle className="w-4 h-4" />
                      Legal Warning
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-400">
                      Packet sniffing can capture sensitive information. <strong>NEVER</strong> use this tool on networks you do not own or have explicit written permission to monitor. Unauthorized sniffing is illegal and unethical.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <a 
                      href="https://scapy.net/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-500 flex items-center gap-1 hover:underline"
                    >
                      Learn more about Scapy <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center">
        <p className="text-zinc-500 text-xs">
          Built for Cybersecurity Internship Project Portfolio &copy; 2024
        </p>
      </footer>
    </div>
  );
}
