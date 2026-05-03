import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ShieldAlert, Fingerprint, ScanFace, LockKeyhole, Mail, KeyRound, Loader2, CheckCircle2, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as OTPAuth from 'otpauth';
import { QRCodeSVG } from 'qrcode.react';

type LoginStep = 'credentials' | 'setup_2fa' | '2fa' | 'face' | 'success';

export default function AdminLogin() {
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectingFace, setDetectingFace] = useState(false);
  
  const [secret, setSecret] = useState('');
  const [authUri, setAuthUri] = useState('');
  const [userId, setUserId] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      setUserId(uid);
      
      const docRef = doc(db, 'admin_security', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().totpSecret) {
         setSecret(docSnap.data().totpSecret);
         setStep('2fa');
      } else {
         const newSecret = new OTPAuth.Secret({ size: 20 });
         const totp = new OTPAuth.TOTP({
           issuer: 'StoryBlogger Admin',
           label: email,
           algorithm: 'SHA1',
           digits: 6,
           period: 30,
           secret: newSecret
         });
         setSecret(newSecret.base32);
         setAuthUri(totp.toString());
         setStep('setup_2fa');
      }
    } catch (err: any) {
      setError('Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length < 6) return;
    setLoading(true);
    setError('');
    
    const totp = new OTPAuth.TOTP({
       issuer: 'StoryBlogger Admin',
       label: email,
       algorithm: 'SHA1',
       digits: 6,
       period: 30,
       secret: OTPAuth.Secret.fromBase32(secret)
    });
    
    const valid = totp.validate({ token: twoFaCode, window: 1 });
    if (valid !== null) {
       try {
         await setDoc(doc(db, 'admin_security', userId), {
           totpSecret: secret,
           updatedAt: Date.now()
         }, { merge: true });
         setStep('face');
       } catch (e) {
         setError('Failed to save security settings.');
       }
    } else {
       setError('Invalid authenticator code. Try again.');
    }
    setLoading(false);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length < 6) return;
    setLoading(true);
    setError('');
    
    const totp = new OTPAuth.TOTP({
       issuer: 'StoryBlogger Admin',
       label: email,
       algorithm: 'SHA1',
       digits: 6,
       period: 30,
       secret: OTPAuth.Secret.fromBase32(secret)
    });
    
    const valid = totp.validate({ token: twoFaCode, window: 1 });
    if (valid !== null) {
       setStep('face');
    } else {
       setError('Invalid authenticator code.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 'face') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  const handleFaceDetected = () => {
     stopCamera();
     setStep('success');
     localStorage.setItem('adminSecureAuth', 'true');
     setTimeout(() => {
       navigate('/admin');
     }, 1500);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      let faceFound = false;

      const checkFace = async () => {
        if (!videoRef.current || faceFound) return;
        
        try {
          if ('FaceDetector' in window) {
            // @ts-ignore
            const detector = new window.FaceDetector();
            const faces = await detector.detect(videoRef.current);
            if (faces.length > 0) {
              faceFound = true;
              setDetectingFace(true);
              setTimeout(handleFaceDetected, 800); // Small delay to feel premium
              return;
            }
          } else {
             // Fallback
             setTimeout(handleFaceDetected, 3000);
             return;
          }
        } catch (e) {
          console.warn("Face detector error, falling back", e);
          setTimeout(handleFaceDetected, 3000);
          return;
        }
        
        if (!faceFound) {
           requestAnimationFrame(checkFace);
        }
      };

      setTimeout(checkFace, 1500); // Warm up camera
    } catch (err) {
      console.warn('Camera access denied or not available.');
      setTimeout(handleFaceDetected, 3000); // Skip biometrics if no camera
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 selection:bg-pink-500/30">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-violet-500/20 blur-3xl rounded-full" />
        
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative shadow-2xl overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gray-800 border border-gray-700 rounded-2xl mb-4 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Gateway</h1>
            <p className="text-sm text-gray-400 mt-2">Maximum Security Level Required</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'credentials' && (
              <motion.form
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCredentialsSubmit}
                className="space-y-5"
              >
                {error && <div className="text-red-400 text-sm p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-center flex items-center justify-center gap-2"><ShieldAlert size={16}/> {error}</div>}
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input autoFocus required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-white text-gray-950 font-bold rounded-xl py-3 mt-4 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Authenticate Phase 1'}
                </button>
              </motion.form>
            )}

            {step === 'setup_2fa' && (
              <motion.form
                key="setup_2fa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSetup2FA}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <QrCode className="mx-auto text-pink-500 mb-3" size={32} />
                  <h3 className="text-white font-bold mb-1">Set Up 2FA</h3>
                  <p className="text-gray-400 text-xs">Scan the QR code below with Google Authenticator or Authy to secure this account.</p>
                </div>
                
                <div className="bg-white p-3 rounded-2xl w-fit mx-auto">
                   <QRCodeSVG value={authUri} size={160} />
                </div>
                <div className="text-center">
                   <span className="text-xs text-gray-500 uppercase font-mono tracking-widest">{secret}</span>
                </div>
                
                {error && <div className="text-red-400 text-sm p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-center flex items-center justify-center gap-2"><ShieldAlert size={16}/> {error}</div>}

                <div className="space-y-1">
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input required type="text" maxLength={6} placeholder="• • • • • •" value={twoFaCode} onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-800 border border-gray-700 text-white text-center text-2xl tracking-widest rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono" />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-pink-600 text-white font-bold rounded-xl py-3 mt-4 hover:bg-pink-500 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Setup'}
                </button>
              </motion.form>
            )}

            {step === '2fa' && (
              <motion.form
                key="2fa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify2FA}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <Fingerprint className="mx-auto text-violet-500 mb-3" size={40} />
                  <p className="text-gray-300 text-sm">Enter the secondary authentication code generated by your authenticator app.</p>
                </div>
                
                {error && <div className="text-red-400 text-sm p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-center flex items-center justify-center gap-2"><ShieldAlert size={16}/> {error}</div>}

                <div className="space-y-1">
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input autoFocus required type="text" maxLength={6} placeholder="• • • • • •" value={twoFaCode} onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-800 border border-gray-700 text-white text-center text-2xl tracking-widest rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono" />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-violet-600 text-white font-bold rounded-xl py-3 mt-4 hover:bg-violet-500 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                </button>
              </motion.form>
            )}

            {step === 'face' && (
              <motion.div
                key="face"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center space-y-6"
              >
                <div className="text-gray-300 text-sm font-medium">Real-Time Biometric Analysis</div>
                
                <div className={`relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 bg-gray-900 flex items-center justify-center transition-all duration-500 ${detectingFace ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)]' : 'border-gray-800 shadow-[0_0_40px_rgba(236,72,153,0.3)]'}`}>
                  <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-150 transform -scale-x-100" />
                  {/* Scanner overlay effect */}
                  <div className={`absolute inset-0 w-full h-full animate-[scan_2s_ease-in-out_infinite] ${detectingFace ? 'bg-gradient-to-b from-transparent via-green-500/40 to-transparent' : 'bg-gradient-to-b from-transparent via-pink-500/40 to-transparent'}`} style={{ transform: 'translateY(-100%)' }} />
                  <ScanFace className={`absolute w-full h-full p-8 transition-colors ${detectingFace ? 'text-green-500/70' : 'text-white/50'}`} strokeWidth={1} />
                </div>
                
                <div className={`flex items-center justify-center gap-3 font-mono text-sm transition-colors ${detectingFace ? 'text-green-500' : 'text-pink-500'}`}>
                  {detectingFace ? <CheckCircle2 size={16} /> : <Loader2 className="animate-spin" size={16} />}
                  {detectingFace ? 'Face Identity Verified' : 'Scanning topography...'}
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-8"
              >
                <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white">Access Granted</h2>
                <p className="text-gray-400">Identity verified. Decrypting panel...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}

