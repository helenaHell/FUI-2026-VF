import { createFUIWindow } from "../core/template.js";

// =====================
// CODE CONTENT (PLUS LONG)
// =====================

const CODE = `#!/usr/bin/env python3
# Leak Analysis Tool v2.4.1
# Classification: CONFIDENTIAL
# Last Modified: 2024-12-15 03:42:17 UTC
# Author: [REDACTED]

import sys
import os
import hashlib
import json
import base64
import sqlite3
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from datetime import datetime, timedelta
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('leak_processor.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Handle all database operations for leak tracking"""
    
    def __init__(self, db_path='leaks.db'):
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Create tables if they don't exist"""
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS leaks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                checksum TEXT UNIQUE NOT NULL,
                size INTEGER,
                classification TEXT,
                source TEXT,
                timestamp TEXT,
                status TEXT DEFAULT 'pending'
            )
        ''')
        
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS metadata (
                leak_id INTEGER,
                key TEXT,
                value TEXT,
                FOREIGN KEY(leak_id) REFERENCES leaks(id)
            )
        ''')
        
        self.conn.commit()
        logger.info("Database initialized successfully")

class CryptoHandler:
    """Handle encryption and decryption operations"""
    
    def __init__(self, master_key=None):
        if master_key is None:
            master_key = Fernet.generate_key()
        self.cipher = Fernet(master_key)
        self.master_key = master_key
    
    def encrypt_file(self, filepath, output_path=None):
        """Encrypt a file and optionally save to output path"""
        try:
            with open(filepath, 'rb') as f:
                data = f.read()
            
            encrypted = self.cipher.encrypt(data)
            
            if output_path:
                with open(output_path, 'wb') as f:
                    f.write(encrypted)
                logger.info(f"Encrypted file saved to {output_path}")
            
            return encrypted
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            return None
    
    def decrypt_file(self, filepath, output_path=None):
        """Decrypt a file and optionally save to output path"""
        try:
            with open(filepath, 'rb') as f:
                encrypted_data = f.read()
            
            decrypted = self.cipher.decrypt(encrypted_data)
            
            if output_path:
                with open(output_path, 'wb') as f:
                    f.write(decrypted)
                logger.info(f"Decrypted file saved to {output_path}")
            
            return decrypted
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            return None

class LeakProcessor:
    """Main processor for handling leaked documents"""
    
    def __init__(self, source_dir, output_dir, encryption_key=None):
        self.source = Path(source_dir)
        self.output = Path(output_dir)
        self.processed = 0
        self.failed = 0
        self.skipped = 0
        
        # Initialize components
        self.db = DatabaseManager()
        self.crypto = CryptoHandler(encryption_key)
        
        # Create output directory if it doesn't exist
        self.output.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"LeakProcessor initialized")
        logger.info(f"Source: {self.source}")
        logger.info(f"Output: {self.output}")
    
    def verify_checksum(self, filepath):
        """Verify file integrity using SHA-256"""
        sha256_hash = hashlib.sha256()
        try:
            with open(filepath, "rb") as f:
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            checksum = sha256_hash.hexdigest()
            logger.debug(f"Checksum for {filepath.name}: {checksum}")
            return checksum
        except IOError as e:
            logger.error(f"Failed to read {filepath}: {str(e)}")
            self.failed += 1
            return None
    
    def classify_document(self, filepath):
        """Classify document based on content and metadata"""
        classifications = {
            'top_secret': ['TS', 'TOP SECRET', 'CLASSIFIED'],
            'confidential': ['CONFIDENTIAL', 'RESTRICTED'],
            'internal': ['INTERNAL', 'COMPANY CONFIDENTIAL'],
            'public': ['PUBLIC', 'UNCLASSIFIED']
        }
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read(1000)  # Read first 1000 chars
                
            for level, keywords in classifications.items():
                if any(kw in content.upper() for kw in keywords):
                    return level
            
            return 'unclassified'
        except Exception as e:
            logger.warning(f"Classification failed for {filepath}: {str(e)}")
            return 'unknown'
    
    def extract_metadata(self, filepath):
        """Extract metadata from file"""
        stat = filepath.stat()
        
        metadata = {
            'filename': filepath.name,
            'size': stat.st_size,
            'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
            'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
            'extension': filepath.suffix,
            'classification': self.classify_document(filepath)
        }
        
        return metadata
    
    def encrypt_metadata(self, metadata):
        """Encrypt sensitive metadata"""
        json_data = json.dumps(metadata)
        return self.crypto.cipher.encrypt(json_data.encode())
    
    def process_single_file(self, filepath):
        """Process a single leaked document"""
        try:
            # Verify checksum
            checksum = self.verify_checksum(filepath)
            if not checksum:
                return False
            
            # Extract metadata
            metadata = self.extract_metadata(filepath)
            
            # Check if already processed
            existing = self.db.cursor.execute(
                'SELECT id FROM leaks WHERE checksum = ?',
                (checksum,)
            ).fetchone()
            
            if existing:
                logger.info(f"File {filepath.name} already processed, skipping")
                self.skipped += 1
                return True
            
            # Encrypt file
            output_file = self.output / f"{checksum}{filepath.suffix}.enc"
            encrypted = self.crypto.encrypt_file(filepath, output_file)
            
            if not encrypted:
                return False
            
            # Store in database
            self.db.cursor.execute('''
                INSERT INTO leaks 
                (filename, checksum, size, classification, source, timestamp, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                filepath.name,
                checksum,
                metadata['size'],
                metadata['classification'],
                str(self.source),
                datetime.now().isoformat(),
                'processed'
            ))
            
            leak_id = self.db.cursor.lastrowid
            
            # Store metadata
            for key, value in metadata.items():
                self.db.cursor.execute(
                    'INSERT INTO metadata (leak_id, key, value) VALUES (?, ?, ?)',
                    (leak_id, key, str(value))
                )
            
            self.db.conn.commit()
            self.processed += 1
            
            logger.info(f"Successfully processed: {filepath.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process {filepath}: {str(e)}")
            self.failed += 1
            return False
    
    def process_batch(self, file_pattern='*'):
        """Process batch of leaked documents"""
        files = list(self.source.glob(file_pattern))
        total = len(files)
        
        logger.info(f"Found {total} files to process")
        
        for i, filepath in enumerate(files, 1):
            if filepath.is_file():
                logger.info(f"Processing {i}/{total}: {filepath.name}")
                self.process_single_file(filepath)
        
        self.print_summary()
    
    def print_summary(self):
        """Print processing summary"""
        total = self.processed + self.failed + self.skipped
        
        logger.info("=" * 50)
        logger.info("PROCESSING SUMMARY")
        logger.info("=" * 50)
        logger.info(f"Total files: {total}")
        logger.info(f"Processed: {self.processed}")
        logger.info(f"Failed: {self.failed}")
        logger.info(f"Skipped: {self.skipped}")
        logger.info(f"Success rate: {(self.processed/total*100) if total > 0 else 0:.2f}%")
        logger.info("=" * 50)

def generate_encryption_key(password, salt=None):
    """Generate encryption key from password"""
    if salt is None:
        salt = os.urandom(16)
    
    kdf = PBKDF2(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key, salt

def main():
    """Main entry point"""
    if len(sys.argv) < 3:
        print("Usage: leak_processor.py <source_dir> <output_dir> [password]")
        print("\nExample:")
        print("  python leak_processor.py ./leaks ./processed mypassword")
        sys.exit(1)
    
    source_dir = sys.argv[1]
    output_dir = sys.argv[2]
    
    # Generate or use provided encryption key
    encryption_key = None
    if len(sys.argv) > 3:
        password = sys.argv[3]
        encryption_key, salt = generate_encryption_key(password)
        logger.info("Using password-based encryption")
    else:
        logger.warning("No password provided, using random key")
    
    # Initialize processor
    processor = LeakProcessor(source_dir, output_dir, encryption_key)
    
    # Process all files
    processor.process_batch()
    
    logger.info("Processing complete")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.warning("Processing interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)`;

// =====================
// STATE
// =====================

let scrollOffset = 0;
let redactedWords = new Set();
let revealInterval = null;
let hideTagsTimeout = null;
let tagsVisible = true;

// Mots sensibles à redacter
const SENSITIVE_WORDS = [
  "CONFIDENTIAL",
  "REDACTED",
  "CLASSIFIED",
  "SECRET",
  "Leak",
  "leaked",
  "cryptography",
  "encrypt",
  "decrypt",
  "Fernet",
  "cipher",
  "checksum",
  "hash",
  "metadata",
  "verify",
  "processed",
  "password",
  "key",
  "salt",
];

// =====================
// HELPERS
// =====================

function initializeRedactedWords() {
  SENSITIVE_WORDS.forEach((word) => redactedWords.add(word));
}

function revealRandomWord() {
  if (redactedWords.size === 0) return;

  const words = Array.from(redactedWords);
  const randomWord = words[Math.floor(Math.random() * words.length)];
  redactedWords.delete(randomWord);
}

function highlightCode(code) {
  let highlighted = code;

  // Redacter les mots sensibles
  redactedWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    highlighted = highlighted.replace(
      regex,
      (match) => `<span class="redacted">${"█".repeat(match.length)}</span>`,
    );
  });

  // Syntax highlighting
  highlighted = highlighted
    .replace(/^(#.*$)/gm, '<span class="comment">$1</span>')
    .replace(
      /\b(import|from|class|def|return|if|for|try|except|with|as|in|is|not|and|or)\b/g,
      '<span class="keyword">$1</span>',
    )
    .replace(
      /\b(self|None|True|False|__name__|__main__)\b/g,
      '<span class="builtin">$1</span>',
    )
    .replace(
      /\b(str|int|len|open|print|range|iter|lambda|isinstance)\b/g,
      '<span class="function">$1</span>',
    )
    .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
    .replace(/'([^']*)'/g, "<span class=\"string\">'$1'</span>")
    .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

  return highlighted;
}

// =====================
// RENDER
// =====================

function render() {
  const lines = CODE.split("\n");
  const highlightedCode = highlightCode(CODE);

  // Dupliquer le code pour une loop invisible
  const doubledCode = highlightedCode + "\n\n" + highlightedCode;

  return `
    <div class="dev-editor">
      <div class="editor-header">
        <span class="editor-filename">leak_processor.py</span>
        <span class="editor-status ${
          tagsVisible ? "" : "fade-out"
        }">MODIFIED</span>
        <span class="editor-scroll-hint ${
          tagsVisible ? "" : "fade-out"
        }">▼ SCROLLING</span>
      </div>
      <div class="editor-separator"></div>
      <div class="editor-content" id="editor-scroll-content">
        <div class="editor-inner" style="transform: translateY(-${scrollOffset}px);">
          <pre><code>${doubledCode}</code></pre>
        </div>
      </div>
      <div class="editor-footer">
        <span>Lines: ${lines.length}</span>
        <span class="${tagsVisible ? "" : "fade-out"}">Redacted: ${
          redactedWords.size
        }/${SENSITIVE_WORDS.length}</span>
        <span>Python 3.11</span>
        <span>UTF-8</span>
      </div>
    </div>
  `;
}

// =====================
// UPDATE (SCROLL + REVEAL)
// =====================

function update() {
  // Défilement fluide
  scrollOffset += 0.8;

  const content = document.querySelector("#dev-editor .editor-content");
  if (!content) return;

  const inner = document.querySelector("#dev-editor .editor-inner");
  if (!inner) return;

  // La moitié de la hauteur (car le code est doublé)
  const halfHeight = inner.scrollHeight / 2;

  // Loop invisible : reset quand on atteint la moitié
  if (scrollOffset >= halfHeight) {
    scrollOffset = 0;
  }

  // Update transform
  inner.style.transform = `translateY(-${scrollOffset}px)`;
}

function startRevealWords() {
  if (revealInterval) clearInterval(revealInterval);

  // Révéler un mot toutes les 3 secondes
  revealInterval = setInterval(() => {
    if (redactedWords.size > 0) {
      revealRandomWord();

      // Rerender
      const el = document.getElementById("dev-editor");
      if (el) {
        el.innerHTML = render();
      }
    }
  }, 3000);
}

function hideTags() {
  // Faire disparaître les tags après 8 secondes
  hideTagsTimeout = setTimeout(() => {
    tagsVisible = false;
    const el = document.getElementById("dev-editor");
    if (el) {
      el.innerHTML = render();
    }
  }, 8000);
}

// =====================
// SETUP
// =====================

function setupEditor() {
  initializeRedactedWords();
  startRevealWords();
  hideTags();
}

// =====================
// CLEANUP
// =====================

function cleanup() {
  if (revealInterval) clearInterval(revealInterval);
  if (hideTagsTimeout) clearTimeout(hideTagsTimeout);
  scrollOffset = 0;
  redactedWords.clear();
  tagsVisible = true;
}

// =====================
// FUI WINDOW INSTANCE
// =====================

export const devEditorWindow = createFUIWindow({
  id: "dev-editor",
  render: render,
  update: update,
  interval: 16, // 60fps
  defaultMode: "default",
  autoRender: false,
});

// =====================
// PUBLIC API
// =====================

export function startDevEditor() {
  setupEditor();
  devEditorWindow.start();
}

export function stopDevEditor() {
  cleanup();
  devEditorWindow.stop();
}
