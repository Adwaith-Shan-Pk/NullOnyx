"use client";

import { useState } from "react";
import { CryptoManager } from "@/utils/CryptoManager";

export default function Home() {
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [myPublicKey, setMyPublicKey] = useState("");
  const [theirPublicKey, setTheirPublicKey] = useState("");
  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null);

  const [message, setMessage] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  
  const [incomingMessage, setIncomingMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");

  const handleGenerateKeys = async () => {
    const keys = await CryptoManager.generateKeyPair();
    setKeyPair(keys);
    const pubKey = await CryptoManager.exportPublicKey(keys.publicKey);
    setMyPublicKey(pubKey);
  };

  const handleDeriveSharedKey = async () => {
    if (!keyPair || !theirPublicKey) return;
    try {
      const importedPubKey = await CryptoManager.importPublicKey(theirPublicKey);
      const derived = await CryptoManager.deriveSharedKey(keyPair.privateKey, importedPubKey);
      setSharedKey(derived);
      alert("Shared key established successfully.");
    } catch (e) {
      alert("Failed to derive key. Ensure the public key is valid.");
    }
  };

  const handleEncrypt = async () => {
    if (!sharedKey || !message) return;
    const encrypted = await CryptoManager.encryptMessage(message, sharedKey);
    setEncryptedMessage(encrypted);
  };

  const handleDecrypt = async () => {
    if (!sharedKey || !incomingMessage) return;
    try {
      const decrypted = await CryptoManager.decryptMessage(incomingMessage, sharedKey);
      setDecryptedMessage(decrypted);
    } catch (e) {
      alert("Decryption failed. The message may have been tampered with or you are using the wrong key.");
    }
  };

  return (
    <main className="flex-1 p-6 sm:p-12 max-w-4xl mx-auto w-full">
      <header className="mb-12 border-b-2 border-foreground pb-6">
        <h1 className="text-4xl font-bold uppercase mb-4 text-primary">NullOnyx</h1>
        <p className="text-lg opacity-80 max-w-xl">Strictly client-side encryption. Keys never leave this browser.</p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold uppercase mb-6">Key Management</h2>
        
        <div className="flex flex-col gap-6">
          <div className="p-6 border-2 border-foreground brutal-shadow bg-background">
            <h3 className="text-xl font-bold mb-4">1. Generate Your Keys</h3>
            <button 
              onClick={handleGenerateKeys}
              className="px-6 py-3 min-w-[44px] min-h-[44px] bg-primary text-background font-bold uppercase tracking-wide border-2 border-foreground brutal-shadow-active transition-transform"
            >
              Generate Keys
            </button>
            
            {myPublicKey && (
              <div className="mt-6">
                <label className="block font-bold mb-2">Your Public Key (Share this)</label>
                <textarea 
                  readOnly 
                  value={myPublicKey}
                  className="w-full p-4 border-2 border-foreground bg-foreground text-background font-mono text-sm h-32 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="p-6 border-2 border-foreground bg-background" style={{ boxShadow: '4px 4px 0px 0px var(--accent)' }}>
            <h3 className="text-xl font-bold mb-4">2. Establish Secure Channel</h3>
            <label className="block font-bold mb-2">Contact's Public Key</label>
            <textarea 
              value={theirPublicKey}
              onChange={(e) => setTheirPublicKey(e.target.value)}
              placeholder="Paste their public key here..."
              className="w-full p-4 border-2 border-foreground bg-transparent font-mono text-sm h-32 brutal-input mb-4"
            />
            <button 
              onClick={handleDeriveSharedKey}
              disabled={!theirPublicKey || !keyPair}
              className="px-6 py-3 min-w-[44px] min-h-[44px] bg-foreground text-background font-bold uppercase border-2 border-foreground brutal-shadow-active disabled:opacity-50"
            >
              Initialize Channel
            </button>
          </div>
        </div>
      </section>

      {sharedKey && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border-2 border-foreground brutal-shadow bg-background">
            <h2 className="text-2xl font-bold uppercase mb-6">Encrypt Message</h2>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter plaintext..."
              className="w-full p-4 border-2 border-foreground bg-transparent font-mono text-sm h-32 brutal-input mb-4"
            />
            <button 
              onClick={handleEncrypt}
              className="px-6 py-3 w-full bg-primary text-background font-bold uppercase border-2 border-foreground brutal-shadow-active mb-4"
            >
              Encrypt Message
            </button>
            
            {encryptedMessage && (
              <div>
                <label className="block font-bold mb-2">Ciphertext</label>
                <textarea 
                  readOnly 
                  value={encryptedMessage}
                  className="w-full p-4 border-2 border-foreground bg-foreground text-background font-mono text-sm h-32 focus:outline-none"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(encryptedMessage)}
                  className="mt-2 text-sm font-bold underline"
                >
                  Copy Ciphertext
                </button>
              </div>
            )}
          </div>

          <div className="p-6 border-2 border-foreground bg-background" style={{ boxShadow: '4px 4px 0px 0px var(--accent)' }}>
            <h2 className="text-2xl font-bold uppercase mb-6">Decrypt Message</h2>
            <textarea 
              value={incomingMessage}
              onChange={(e) => setIncomingMessage(e.target.value)}
              placeholder="Paste ciphertext..."
              className="w-full p-4 border-2 border-foreground bg-transparent font-mono text-sm h-32 brutal-input mb-4"
            />
            <button 
              onClick={handleDecrypt}
              className="px-6 py-3 w-full bg-foreground text-background font-bold uppercase border-2 border-foreground brutal-shadow-active mb-4"
            >
              Decrypt Message
            </button>
            
            {decryptedMessage && (
              <div>
                <label className="block font-bold mb-2">Plaintext</label>
                <textarea 
                  readOnly 
                  value={decryptedMessage}
                  className="w-full p-4 border-2 border-foreground bg-background text-foreground font-mono text-sm h-32 focus:outline-none"
                />
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
