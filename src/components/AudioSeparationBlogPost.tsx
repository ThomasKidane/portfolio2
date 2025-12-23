import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const AudioSeparationBlogPost: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: 'intro', label: 'Introduction', position: 0, isMain: true },
    { id: 'problem', label: 'The Problem', position: 5, isMain: true },
    { id: 'classical', label: 'Classical Approaches', position: 12, isMain: true },
    { id: 'phase-cancellation', label: 'Phase Cancellation', position: 16, isMain: false },
    { id: 'nlms', label: 'NLMS Adaptive', position: 22, isMain: false },
    { id: 'spectral', label: 'Spectral Subtraction', position: 28, isMain: false },
    { id: 'echo', label: 'Echo Cancellation', position: 34, isMain: true },
    { id: 'webrtc', label: 'WebRTC AEC3', position: 38, isMain: false },
    { id: 'speexdsp', label: 'SpeexDSP', position: 44, isMain: false },
    { id: 'deep-learning', label: 'Deep Learning', position: 50, isMain: true },
    { id: 'demucs', label: 'Demucs', position: 54, isMain: false },
    { id: 'spleeter', label: 'Spleeter', position: 58, isMain: false },
    { id: 'rnnoise', label: 'RNNoise', position: 62, isMain: false },
    { id: 'results', label: 'Results', position: 68, isMain: true },
    { id: 'when-to-use', label: 'When to Use What', position: 76, isMain: true },
    { id: 'try-it', label: 'Try It Yourself', position: 84, isMain: true },
    { id: 'learned', label: 'What I Learned', position: 92, isMain: true },
  ];

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches || 
                     window.matchMedia('(hover: none)').matches ||
                     window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;
      setScrollProgress(progress);

      const currentSection = sections.findIndex((section, index) => {
        const nextSection = sections[index + 1];
        return progress >= section.position && (!nextSection || progress < nextSection.position);
      });
      setActiveSection(currentSection);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Custom Cursor - Only on Desktop */}
      {!isMobile && (
        <div 
          className="custom-cursor"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        />
      )}

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation Ticks */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`group/tick absolute flex items-center justify-end transition-all duration-300`}
            style={{ 
              top: `${index * 14 - (sections.length * 7)}px`,
              right: '0',
              width: 'auto'
            }}
          >
            <span className={`text-xs font-mono mr-3 transition-opacity duration-300 whitespace-nowrap ${
              activeSection === index ? 'opacity-100' : 'opacity-0 group-hover/tick:opacity-60'
            } ${section.isMain ? 'font-bold' : 'text-gray-500'}`}>
              {section.label}
            </span>
            <div className={`h-px transition-all duration-300 ${
              section.isMain 
                ? activeSection === index 
                  ? 'w-12 bg-blue-600' 
                  : 'w-8 bg-gray-400 group-hover/tick:w-12 group-hover/tick:bg-gray-600'
                : activeSection === index
                  ? 'w-8 bg-blue-400'
                  : 'w-4 bg-gray-300 group-hover/tick:w-6 group-hover/tick:bg-gray-400'
            }`} />
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="bg-white min-h-screen">
        {/* Header */}
        <header className="pt-8 pb-12 px-8 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-mono text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            
            <h1 
              className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
              style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1.5rem', lineHeight: '1.8' }}
            >
              Audio Source Separation
            </h1>
            
            <p className="text-xl text-gray-600 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              A Deep Dive into Removing Background Music from Voice Recordings
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-mono">
              <span>December 2025</span>
              <span>•</span>
              <span>15 min read</span>
              <span>•</span>
              <a 
                href="https://github.com/ThomasKidane/Renoise" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <Github className="w-4 h-4 mr-1" />
                View on GitHub
              </a>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="px-8 py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <section id="intro" className="mb-16">
              <p className="text-lg text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                When building voice-focused applications like dictation software, the challenge isn't just 
                capturing audio—it's isolating the voice from everything else. Background music, system sounds, 
                and ambient noise all compete with the speaker's voice. This project explores multiple approaches 
                to audio source separation, from classical signal processing to state-of-the-art deep learning, 
                ultimately finding that <strong>the best method depends entirely on what information you have available</strong>.
              </p>
            </section>

            {/* The Problem */}
            <section id="problem" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
                THE PROBLEM
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                Consider this scenario: you're using a dictation application while music plays from your speakers. 
                The microphone captures both your voice and the music. The dictation software struggles because 
                it can't distinguish between the two audio sources.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                The mathematical formulation is deceptively simple:
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 flex justify-center">
                <BlockMath math="\text{microphone} = \text{voice} + \alpha \cdot \text{reference} + \text{noise}" />
              </div>

              <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                where <InlineMath math="\alpha" /> represents the acoustic coupling between the speaker and microphone. 
                Our goal: recover <InlineMath math="\text{voice}" /> given{' '}
                <InlineMath math="\text{microphone}" /> and potentially{' '}
                <InlineMath math="\text{reference}" />.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                The difficulty varies dramatically based on what we know:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-mono">Scenario</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-mono">Difficulty</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-mono">Best Approach</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Have exact reference signal</td>
                      <td className="border border-gray-300 px-4 py-2 text-green-600 font-semibold">Easy</td>
                      <td className="border border-gray-300 px-4 py-2">Phase Cancellation</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Have approximate reference</td>
                      <td className="border border-gray-300 px-4 py-2 text-yellow-600 font-semibold">Medium</td>
                      <td className="border border-gray-300 px-4 py-2">Adaptive Filtering / AEC</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">No reference available</td>
                      <td className="border border-gray-300 px-4 py-2 text-red-600 font-semibold">Hard</td>
                      <td className="border border-gray-300 px-4 py-2">Deep Learning</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Classical Approaches */}
            <section id="classical" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
                CLASSICAL APPROACHES
              </h2>

              {/* Phase Cancellation */}
              <div id="phase-cancellation" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                  Phase Cancellation
                </h3>
                <p className="text-sm text-blue-600 font-mono mb-4">
                  The mathematically perfect solution—when conditions are right.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  If you have the <em>exact</em> reference signal that was mixed into the recording, phase cancellation 
                  achieves perfect separation. The principle is simple: invert the reference and add it to the mixed signal.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 flex justify-center">
                  <BlockMath math="\text{output} = \text{mixed} - \alpha \cdot \text{reference}" />
                </div>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  The challenge lies in finding the correct gain <InlineMath math="\alpha" /> and time alignment. Cross-correlation finds the optimal delay:
                </p>

                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto text-sm">
                  <code className="text-gray-800">{`def find_delay(mixed, reference, max_delay=48000):
    """Find delay using cross-correlation."""
    correlation = correlate(mixed, reference, mode='full')
    center = len(reference) - 1
    peak_idx = np.argmax(correlation[center-max_delay:center+max_delay])
    return peak_idx - max_delay

def find_gain(mixed, reference, delay):
    """Optimal gain via least squares."""
    ref_aligned = reference[delay:] if delay >= 0 else reference
    mix_aligned = mixed[:-delay] if delay >= 0 else mixed[-delay:]
    return np.sum(mix_aligned * ref_aligned) / np.sum(ref_aligned ** 2)`}</code>
                </pre>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong>Results:</strong> When the reference matches exactly, phase cancellation achieves {'>'}40dB 
                  reduction—essentially perfect removal. However, any mismatch (different audio path, compression 
                  artifacts, timing drift) causes the method to fail catastrophically.
                </p>
              </div>

              {/* NLMS */}
              <div id="nlms" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                  Adaptive Filters (NLMS)
                </h3>
                <p className="text-sm text-blue-600 font-mono mb-4">
                  When the reference is similar but not identical.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  The Normalized Least Mean Squares (NLMS) algorithm adapts a filter to model the acoustic 
                  path between reference and microphone:
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 flex justify-center">
                  <BlockMath math="\mathbf{w}[n+1] = \mathbf{w}[n] + \frac{\mu}{\|\mathbf{x}[n]\|^2 + \epsilon} \cdot e[n] \cdot \mathbf{x}[n]" />
                </div>

                <p className="text-gray-700 leading-relaxed mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  where:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2" style={{ fontFamily: 'Georgia, serif' }}>
                  <li><InlineMath math="\mathbf{w}[n]" /> is the filter coefficient vector</li>
                  <li><InlineMath math="\mu" /> is the step size (0.1–1.0)</li>
                  <li><InlineMath math="\mathbf{x}[n]" /> is the reference signal buffer</li>
                  <li><InlineMath math="e[n] = d[n] - \mathbf{w}[n]^T \mathbf{x}[n]" /> is the error signal</li>
                </ul>

                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto text-sm">
                  <code className="text-gray-800">{`class NLMSFilter {
  constructor(filterLength = 2048, stepSize = 0.5) {
    this.weights = new Float32Array(filterLength);
    this.buffer = new Float32Array(filterLength);
    this.stepSize = stepSize;
    this.eps = 1e-6;
  }

  process(input, reference) {
    // Shift buffer, add new reference sample
    this.buffer.copyWithin(1, 0);
    this.buffer[0] = reference;
    
    // Filter output: estimated echo
    let estimate = 0;
    for (let i = 0; i < this.weights.length; i++) {
      estimate += this.weights[i] * this.buffer[i];
    }
    
    // Error signal (hopefully just voice)
    const error = input - estimate;
    
    // Normalize by signal power
    let power = this.eps;
    for (let i = 0; i < this.buffer.length; i++) {
      power += this.buffer[i] * this.buffer[i];
    }
    
    // Update weights
    const norm = this.stepSize / power;
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += norm * error * this.buffer[i];
    }
    
    return error;
  }
}`}</code>
                </pre>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong>Results:</strong> NLMS achieves 10–20dB reduction with proper tuning. The step size <InlineMath math="\mu" />{' '}
                  controls the adaptation speed vs. stability tradeoff.
                </p>
              </div>

              {/* Spectral Subtraction */}
              <div id="spectral" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                  Spectral Subtraction
                </h3>
                <p className="text-sm text-blue-600 font-mono mb-4">
                  Working in the frequency domain.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  Rather than subtracting in the time domain, spectral subtraction operates on magnitude spectra:
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 flex justify-center">
                  <BlockMath math="|\hat{S}(\omega)|^2 = |X(\omega)|^2 - \alpha |N(\omega)|^2" />
                </div>

                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto text-sm">
                  <code className="text-gray-800">{`def spectral_subtraction(mixed, reference, alpha=1.0, beta=0.01):
    mixed_stft = librosa.stft(mixed)
    ref_stft = librosa.stft(reference)
    
    mixed_mag = np.abs(mixed_stft)
    ref_mag = np.abs(ref_stft)
    
    output_mag = np.maximum(mixed_mag - alpha * ref_mag, beta * mixed_mag)
    output_stft = output_mag * np.exp(1j * np.angle(mixed_stft))
    
    return librosa.istft(output_stft)`}</code>
                </pre>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong>Results:</strong> Handles frequency-dependent attenuation well but introduces "musical noise" artifacts.
                </p>
              </div>
            </section>

            {/* Echo Cancellation Methods */}
            <section id="echo" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
                ECHO CANCELLATION METHODS
              </h2>

              {/* WebRTC AEC3 */}
              <div id="webrtc" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                  WebRTC AEC3
                </h3>
                <p className="text-sm text-blue-600 font-mono mb-4">
                  Google's production-grade solution.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  WebRTC's AEC3 combines delay estimation, adaptive filtering, residual echo suppression, 
                  and comfort noise generation. I implemented 8 different modes:
                </p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-mono">Mode</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-mono">Voice Quality</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-mono">Echo Removal</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-mono">Use Case</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">0 - Ultra Conservative</td>
                        <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐⭐</td>
                        <td className="border border-gray-300 px-4 py-2">⭐⭐</td>
                        <td className="border border-gray-300 px-4 py-2">Voice calls</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">3 - Balanced</td>
                        <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐</td>
                        <td className="border border-gray-300 px-4 py-2">⭐⭐⭐</td>
                        <td className="border border-gray-300 px-4 py-2">General use</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">7 - Ultra Aggressive</td>
                        <td className="border border-gray-300 px-4 py-2">⭐⭐</td>
                        <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐⭐</td>
                        <td className="border border-gray-300 px-4 py-2">Music removal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto text-sm">
                  <code className="text-gray-800">{`EchoCanceller3Config config;
config.suppressor.normal_tuning.mask_lf.enr_transparent = 0.3f;
config.suppressor.normal_tuning.mask_lf.enr_suppress = 0.4f;
config.suppressor.dominant_nearend_detection.enr_threshold = 0.25f;
config.suppressor.dominant_nearend_detection.hold_duration = 50;

EchoCanceller3Factory factory(config);
auto echo_controller = factory.Create(sample_rate, num_channels, num_channels);`}</code>
                </pre>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong>Results:</strong> AEC3 Mode 7 achieves significant music reduction but can make voices sound "underwater."
                </p>
              </div>

              {/* SpeexDSP */}
              <div id="speexdsp" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                  SpeexDSP
                </h3>
                <p className="text-sm text-blue-600 font-mono mb-4">
                  Lightweight and embeddable.
                </p>

                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto text-sm">
                  <code className="text-gray-800">{`SpeexEchoState *echo_state = speex_echo_state_init(frame_size, filter_length);
speex_echo_ctl(echo_state, SPEEX_ECHO_SET_SAMPLING_RATE, &sample_rate);
speex_echo_cancellation(echo_state, input_frame, reference_frame, output_frame);`}</code>
                </pre>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong>Results:</strong> Lower CPU usage than AEC3, achieves 5–15dB reduction.
                </p>
              </div>
            </section>

            {/* Deep Learning Approaches */}
            <section id="deep-learning" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
                DEEP LEARNING APPROACHES
              </h2>

              {/* Demucs */}
              <div id="demucs" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                  Demucs (HTDemucs)
                </h3>
                <p className="text-sm text-blue-600 font-mono mb-4">
                  The current state-of-the-art.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  Demucs from Meta AI Research uses a hybrid transformer architecture to separate audio into stems. 
                  Unlike echo cancellation, it doesn't need a reference signal.
                </p>

                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto text-sm">
                  <code className="text-gray-800">{`pip install demucs
python -m demucs --two-stems=vocals input.wav`}</code>
                </pre>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong>Results:</strong> Remarkable separation quality—voices emerge cleanly even from complex 
                  musical arrangements. The tradeoff: 26 seconds to process 17 seconds of audio on CPU.
                </p>
              </div>

              {/* Spleeter */}
              <div id="spleeter" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                  Spleeter
                </h3>
                <p className="text-sm text-blue-600 font-mono mb-4">
                  Deezer's fast alternative.
                </p>

                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto text-sm">
                  <code className="text-gray-800">{`from spleeter.separator import Separator
separator = Separator('spleeter:2stems')
separator.separate_to_file('input.wav', 'output/')`}</code>
                </pre>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong>Results:</strong> 2–3x faster than Demucs with slightly lower quality.
                </p>
              </div>

              {/* RNNoise */}
              <div id="rnnoise" className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                  RNNoise
                </h3>
                <p className="text-sm text-blue-600 font-mono mb-4">
                  Real-time noise suppression.
                </p>

                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto text-sm">
                  <code className="text-gray-800">{`DenoiseState *st = rnnoise_create(NULL);
float frame[480];
while (read_frame(frame)) {
    rnnoise_process_frame(st, frame, frame);
    write_frame(frame);
}`}</code>
                </pre>

                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong>Results:</strong> Excellent for stationary noise, struggles with music (~5dB reduction).
                </p>
              </div>
            </section>

            {/* Implementation Results */}
            <section id="results" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
                IMPLEMENTATION RESULTS
              </h2>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-mono">Method</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-mono">Music Reduction</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-mono">Voice Quality</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-mono">Latency</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-mono">CPU Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Phase Cancellation</td>
                      <td className="border border-gray-300 px-4 py-2">40+ dB*</td>
                      <td className="border border-gray-300 px-4 py-2">Perfect*</td>
                      <td className="border border-gray-300 px-4 py-2">1ms</td>
                      <td className="border border-gray-300 px-4 py-2">1%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">NLMS Adaptive</td>
                      <td className="border border-gray-300 px-4 py-2">10–15 dB</td>
                      <td className="border border-gray-300 px-4 py-2">Good</td>
                      <td className="border border-gray-300 px-4 py-2">10ms</td>
                      <td className="border border-gray-300 px-4 py-2">5%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Spectral Subtraction</td>
                      <td className="border border-gray-300 px-4 py-2">8–12 dB</td>
                      <td className="border border-gray-300 px-4 py-2">Artifacts</td>
                      <td className="border border-gray-300 px-4 py-2">20ms</td>
                      <td className="border border-gray-300 px-4 py-2">10%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">WebRTC AEC3 Mode 7</td>
                      <td className="border border-gray-300 px-4 py-2">15–25 dB</td>
                      <td className="border border-gray-300 px-4 py-2">Muffled</td>
                      <td className="border border-gray-300 px-4 py-2">30ms</td>
                      <td className="border border-gray-300 px-4 py-2">15%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">SpeexDSP</td>
                      <td className="border border-gray-300 px-4 py-2">5–15 dB</td>
                      <td className="border border-gray-300 px-4 py-2">Good</td>
                      <td className="border border-gray-300 px-4 py-2">20ms</td>
                      <td className="border border-gray-300 px-4 py-2">8%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">RNNoise</td>
                      <td className="border border-gray-300 px-4 py-2">3–8 dB</td>
                      <td className="border border-gray-300 px-4 py-2">Excellent</td>
                      <td className="border border-gray-300 px-4 py-2">10ms</td>
                      <td className="border border-gray-300 px-4 py-2">5%</td>
                    </tr>
                    <tr className="bg-blue-50 font-semibold">
                      <td className="border border-gray-300 px-4 py-2">Demucs</td>
                      <td className="border border-gray-300 px-4 py-2">25–35 dB</td>
                      <td className="border border-gray-300 px-4 py-2">Excellent</td>
                      <td className="border border-gray-300 px-4 py-2">~2s</td>
                      <td className="border border-gray-300 px-4 py-2">GPU</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Spleeter</td>
                      <td className="border border-gray-300 px-4 py-2">20–30 dB</td>
                      <td className="border border-gray-300 px-4 py-2">Good</td>
                      <td className="border border-gray-300 px-4 py-2">~1s</td>
                      <td className="border border-gray-300 px-4 py-2">GPU</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-gray-500 italic" style={{ fontFamily: 'Georgia, serif' }}>
                *Only when reference matches exactly
              </p>
            </section>

            {/* When to Use What */}
            <section id="when-to-use" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
                WHEN TO USE WHAT
              </h2>

              <div className="space-y-8">
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    You have the exact reference signal
                  </h3>
                  <p className="text-blue-600 font-mono text-sm mb-2">→ Phase Cancellation</p>
                  <p className="text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    Mathematically optimal. If your system captures the reference before it goes to speakers, 
                    this achieves near-perfect removal.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    You have an approximate reference (real-time needed)
                  </h3>
                  <p className="text-blue-600 font-mono text-sm mb-2">→ WebRTC AEC3 or NLMS</p>
                  <p className="text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    Echo cancellation was designed for this. AEC3 provides best quality; NLMS offers more control.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    No reference available (offline processing OK)
                  </h3>
                  <p className="text-blue-600 font-mono text-sm mb-2">→ Demucs</p>
                  <p className="text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    State-of-the-art deep learning separation.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    No reference available (real-time needed)
                  </h3>
                  <p className="text-blue-600 font-mono text-sm mb-2">→ RNNoise + Accept limitations</p>
                  <p className="text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    No magic solution exists. Consider asking users to pause music during dictation.
                  </p>
                </div>
              </div>
            </section>

            {/* Try It Yourself */}
            <section id="try-it" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
                TRY IT YOURSELF
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    Demucs (Best Quality)
                  </h3>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-x-auto text-sm">
                    <code className="text-gray-800">{`pip install demucs
python -m demucs --two-stems=vocals your_recording.wav`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    WebRTC AEC3
                  </h3>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-x-auto text-sm">
                    <code className="text-gray-800">{`git clone https://github.com/anthropics/audio-separator
cd audio-separator/vendor/aec3
mkdir build && cd build
cmake .. && make
./aec3_demo_hq reference.wav mixed.wav output.wav 7`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    Phase Cancellation
                  </h3>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-x-auto text-sm">
                    <code className="text-gray-800">{`python separate.py mixed.wav reference.wav output.wav`}</code>
                  </pre>
                </div>
              </div>
            </section>

            {/* What I Learned */}
            <section id="learned" className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
                WHAT I LEARNED
              </h2>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    1. The Reference Signal is Everything
                  </h3>
                  <p className="text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    With it, simple algorithms work. Without it, even deep learning struggles.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    2. Echo Cancellation ≠ Source Separation
                  </h3>
                  <p className="text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    AEC assumes the reference is an echo, not independent audio.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    3. Latency Constraints Kill Options
                  </h3>
                  <p className="text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    Many promising approaches become unusable with real-time requirements.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800" style={{ fontFamily: '"Space Mono", monospace' }}>
                    4. Sample Rate Synchronization is Critical
                  </h3>
                  <p className="text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    Even 0.01% drift causes audible artifacts.
                  </p>
                </div>
              </div>
            </section>

            {/* References */}
            <section className="mb-16 border-t border-gray-200 pt-12">
              <h2 className="text-xl font-bold mb-6 text-gray-900" style={{ fontFamily: '"Space Mono", monospace' }}>
                References
              </h2>

              <ol className="list-decimal list-inside text-gray-700 space-y-2 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                <li>Défossez, A., et al. "Hybrid Transformers for Music Source Separation." ICASSP 2023.</li>
                <li>Valin, J.M., et al. "A Perceptually-Motivated Approach for Low-Complexity, Real-Time Enhancement of Fullband Speech." INTERSPEECH 2020.</li>
                <li>WebRTC Project. "Audio Processing Module Documentation."</li>
                <li>Haykin, S. "Adaptive Filter Theory." Prentice Hall, 2002.</li>
              </ol>
            </section>

            {/* Footer Links */}
            <footer className="border-t border-gray-200 pt-8">
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="https://github.com/ThomasKidane/Renoise" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-mono text-sm"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
                <Link 
                  to="/blog" 
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-mono text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Link>
              </div>
            </footer>

          </div>
        </article>
      </div>
    </>
  );
};

export default AudioSeparationBlogPost;
