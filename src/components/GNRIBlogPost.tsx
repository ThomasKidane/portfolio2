import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const GNRIBlogPost: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // More detailed sections with subsections
  const sections = [
    { id: 'intro', label: 'Introduction', position: 0, isMain: true },
    { id: 'gnri-editing', label: 'GNRI Editing', position: 5, isMain: false },
    { id: 'foundation', label: 'Diffusion Foundation', position: 10, isMain: true },
    { id: 'forward-process', label: 'Forward Process', position: 15, isMain: false },
    { id: 'reverse-process', label: 'Reverse Process', position: 20, isMain: false },
    { id: 'ddim', label: 'DDIM Sampling', position: 25, isMain: false },
    { id: 'inversion', label: 'Inversion Problem', position: 30, isMain: true },
    { id: 'why-hard', label: 'Why It\'s Hard', position: 35, isMain: false },
    { id: 'tradeoff', label: 'Stochastic Tradeoff', position: 40, isMain: false },
    { id: 'newton', label: 'Newton-Raphson', position: 45, isMain: true },
    { id: 'classical-nr', label: 'Classical Method', position: 48, isMain: false },
    { id: 'latent-space', label: 'Latent Space', position: 51, isMain: false },
    { id: 'gnri-objective', label: 'GNRI Objective', position: 54, isMain: false },
    { id: 'gradient-update', label: 'Gradient Update', position: 57, isMain: false },
    { id: 'implementation', label: 'Implementation', position: 60, isMain: true },
    { id: 'euler-scheduler', label: 'Euler Scheduler', position: 63, isMain: false },
    { id: 'noise-init', label: 'Noise Init', position: 66, isMain: false },
    { id: 'gradient-flow', label: 'Gradient Flow', position: 69, isMain: false },
    { id: 'comparison', label: 'Comparison', position: 72, isMain: true },
    { id: 'google-ai', label: 'Google AI', position: 75, isMain: false },
    { id: 'sdxl-gnri', label: 'SDXL+GNRI', position: 78, isMain: false },
    { id: 'performance', label: 'Performance', position: 81, isMain: false },
    { id: 'when-to-use', label: 'When to Use', position: 84, isMain: false },
    { id: 'learned', label: 'What I Learned', position: 87, isMain: true },
    { id: 'paper-production', label: 'Paper to Production', position: 89, isMain: false },
    { id: 'debugging', label: 'Debugging', position: 91, isMain: false },
    { id: 'noise-sync', label: 'Noise Sync', position: 93, isMain: false },
    { id: 'future', label: 'Future Directions', position: 95, isMain: true },
    { id: 'try', label: 'Try It Yourself', position: 98, isMain: true },
  ];

  useEffect(() => {
    // Check if mobile on mount and window resize
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

      // Update active section based on scroll position
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
    
    // Only add mouse tracking on desktop devices
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
              top: `${index * 12 - (sections.length * 6)}px`,
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
      <div ref={containerRef} className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="font-mono text-sm text-gray-600 hover:text-blue-600 transition-colors">
              ← Back to Portfolio
            </Link>
            <span className="font-mono text-xs text-gray-500">
              December 2025
            </span>
          </div>
        </header>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-6 py-16 font-mono">
          {/* Title Section */}
          <section id="intro" className="mb-20">
            <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight text-gray-900">
              Guided Newton-Raphson Inversion
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Real-Time Image Editing via Gradient-Based Latent Space Optimization
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>By Thomas Kidane</span>
              <span>•</span>
              <span>December 2025</span>
              <span>•</span>
              <a 
                href="https://github.com/ThomasKidane/GNRI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
              <span>•</span>
              <a 
                href="/gnri" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            </div>
          </section>

          {/* Introduction */}
          <section className="mb-20 leading-relaxed text-gray-800">
            <p className="text-lg mb-6 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
              Diffusion models have revolutionized image generation, but editing real images remains fundamentally harder than creating new ones. 
              The challenge: how do you modify a photograph while preserving everything except what you want to change? 
              Naive approaches—running the image through a diffusion model with a new prompt—destroy the original content entirely. 
              The model has no memory of what it started with.
            </p>
            
            <p className="mb-6">
              GNRI (Guided Newton-Raphson Inversion) solves this by treating image editing as an optimization problem. 
              Instead of hoping the model preserves structure, we mathematically constrain it to. 
              This implementation deploys GNRI on SDXL models, comparing results against Google's Gemini image generation 
              to understand where classical optimization beats modern API-based approaches.
            </p>

            {/* GNRI Editing Example */}
            <figure id="gnri-editing" className="my-12">
              <img 
                src="/assets/gnriediting.png" 
                alt="GNRI Image Editing Example" 
                className="w-full rounded-lg shadow-lg"
              />
              <figcaption className="text-center text-sm text-gray-600 mt-4">
                Figure 1: GNRI enables precise image editing while preserving structure
              </figcaption>
            </figure>
          </section>

          {/* The Diffusion Foundation */}
          <section id="foundation" className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">The Diffusion Foundation</h2>
            
            <p className="mb-6 text-gray-700">
              Before understanding GNRI, we need the mathematical machinery of diffusion models. 
              These models learn to reverse a noise-adding process, transforming Gaussian noise into coherent images.
            </p>

            {/* Diffusion Process Diagram */}
            <figure className="my-12">
              <img 
                src="/assets/diffusion.jpg" 
                alt="Diffusion Forward and Reverse Process" 
                className="w-full rounded-lg shadow-lg"
              />
              <figcaption className="text-center text-sm text-gray-600 mt-4">
                Figure 2: Diffusion forward and reverse process diagram
              </figcaption>
            </figure>

            <div id="forward-process" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">The Forward Process</h3>
              
              <p className="mb-4 text-gray-700">
                Diffusion models define a forward process that gradually adds Gaussian noise to data. 
                Given a clean image <InlineMath math="x_0" />, we produce increasingly noisy versions{' '}
                <InlineMath math="x_1, x_2, \ldots, x_T" /> according to:
              </p>

              <div className="my-8 overflow-x-auto bg-gray-50 p-4 rounded-lg">
                <BlockMath math="q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{1-\beta_t} x_{t-1}, \beta_t \mathbf{I})" />
              </div>

              <p className="mb-4 text-gray-700">
                where <InlineMath math="\beta_t" /> is a variance schedule. The key insight: we can sample{' '}
                <InlineMath math="x_t" /> directly from <InlineMath math="x_0" /> without iterating through intermediate steps:
              </p>

              <div className="my-8 overflow-x-auto bg-gray-50 p-4 rounded-lg">
                <BlockMath math="q(x_t | x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} x_0, (1-\bar{\alpha}_t) \mathbf{I})" />
              </div>

              <p className="mb-6 text-gray-700">
                where <InlineMath math="\bar{\alpha}_t = \prod_{s=1}^{t}(1-\beta_s)" /> is the cumulative product of noise schedule terms. 
                This closed-form solution is crucial—it means we can jump to any noise level instantly.
              </p>
            </div>

            <div id="reverse-process" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">The Reverse Process</h3>
              
              <p className="mb-4 text-gray-700">
                The model learns to reverse this corruption. Given noisy <InlineMath math="x_t" />, 
                predict the noise <InlineMath math="\epsilon" /> that was added:
              </p>

              <div className="my-8 overflow-x-auto bg-gray-50 p-4 rounded-lg">
                <BlockMath math="\epsilon_\theta(x_t, t) \approx \epsilon" />
              </div>

              <p className="mb-4 text-gray-700">
                where <InlineMath math="\epsilon \sim \mathcal{N}(0, \mathbf{I})" /> is the actual noise. The training objective minimizes:
              </p>

              <div className="my-8 overflow-x-auto bg-gray-50 p-4 rounded-lg">
                <BlockMath math="\mathcal{L} = \mathbb{E}_{x_0, \epsilon, t}\left[ \| \epsilon - \epsilon_\theta(x_t, t) \|^2 \right]" />
              </div>

              <p className="mb-4 text-gray-700">
                Once trained, we generate images by starting from pure noise <InlineMath math="x_T \sim \mathcal{N}(0, \mathbf{I})" /> and iteratively denoising:
              </p>

              <div className="my-8 overflow-x-auto bg-gray-50 p-4 rounded-lg">
                <BlockMath math="x_{t-1} = \frac{1}{\sqrt{\alpha_t}}\left( x_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}} \epsilon_\theta(x_t, t) \right) + \sigma_t z" />
              </div>

              <p className="mb-6 text-gray-700">
                where <InlineMath math="z \sim \mathcal{N}(0, \mathbf{I})" /> and <InlineMath math="\sigma_t" /> controls stochasticity.
              </p>
            </div>

            <div id="ddim" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">DDIM: Deterministic Sampling</h3>
              
              <p className="mb-4 text-gray-700">
                DDIM (Denoising Diffusion Implicit Models) reformulates sampling as a deterministic process. The key equation:
              </p>

              <div className="my-8 overflow-x-auto bg-gray-50 p-4 rounded-lg">
                <BlockMath math="x_{t-1} = \sqrt{\bar{\alpha}_{t-1}} \underbrace{\left( \frac{x_t - \sqrt{1-\bar{\alpha}_t} \epsilon_\theta(x_t, t)}{\sqrt{\bar{\alpha}_t}} \right)}_{\text{predicted } x_0} + \sqrt{1-\bar{\alpha}_{t-1}} \cdot \epsilon_\theta(x_t, t)" />
              </div>

              <p className="text-gray-700">
                This determinism is essential for inversion—the same latent always produces the same image.
              </p>
            </div>
          </section>

          {/* The Inversion Problem */}
          <section id="inversion" className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">The Inversion Problem</h2>
            
            <p className="mb-6 text-gray-700">
              Image editing requires <em>inversion</em>: finding the latent code <InlineMath math="z_T" /> that, 
              when denoised, reconstructs the original image <InlineMath math="x_0" />. 
              If we can find this latent, we can modify the text prompt and denoise again, 
              producing an edited version that shares structure with the original.
            </p>

            {/* Inversion Problem Illustration */}
            <figure className="my-12">
              <img 
                src="/assets/inversion.jpg" 
                alt="Inversion Problem - Original to Latent to Reconstruction" 
                className="w-full rounded-lg shadow-lg"
              />
              <figcaption className="text-center text-sm text-gray-600 mt-4">
                Figure 3: The inversion problem - finding latents that reconstruct the original
              </figcaption>
            </figure>

            <div id="why-hard" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Why Inversion is Hard</h3>
              
              <p className="mb-4 text-gray-700">
                The naive approach—run DDIM sampling backwards—fails catastrophically. DDIM inversion computes:
              </p>

              <div className="my-8 overflow-x-auto bg-gray-50 p-4 rounded-lg">
                <BlockMath math="x_{t+1} = \sqrt{\bar{\alpha}_{t+1}} \hat{x}_0 + \sqrt{1-\bar{\alpha}_{t+1}} \cdot \epsilon_\theta(x_t, t)" />
              </div>

              <p className="mb-4 text-gray-700">
                where <InlineMath math="\hat{x}_0" /> is the predicted clean image. 
                The problem: small errors compound. Each step's prediction error feeds into the next step's input, 
                and after 50 steps, the accumulated drift destroys reconstruction fidelity.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
                <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                  <code>{`# Naive DDIM inversion - errors accumulate
for t in reversed(timesteps):
    noise_pred = unet(latent, t, prompt_embeds)
    # This prediction has error ε
    latent = ddim_inverse_step(noise_pred, t, latent)
    # Error compounds: after N steps, total error ≈ N * ε`}</code>
                </pre>
              </div>
            </div>

            <div id="tradeoff" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">The Deterministic-Stochastic Tradeoff</h3>
              
              <p className="mb-4 text-gray-700">
                Stochastic samplers (like Euler Ancestral) add random noise at each step:
              </p>

              <div className="my-8 overflow-x-auto bg-gray-50 p-4 rounded-lg">
                <BlockMath math="x_{t-1} = \text{deterministic\_step}(x_t) + \sigma_{\text{up}} \cdot \epsilon" />
              </div>

              <p className="mb-4 text-gray-700">
                This noise injection improves generation quality but makes inversion impossible—you can't invert randomness. 
                DDIM's determinism enables inversion but sacrifices quality.
              </p>

              <p className="font-semibold text-gray-800">
                The core tension: good generation wants stochasticity; good inversion wants determinism.
              </p>
            </div>
          </section>

          {/* Enter Newton-Raphson */}
          <section className="mb-16" id="newton">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Enter Newton-Raphson</h2>
            
            <p className="text-gray-700 mb-6">
              GNRI resolves this tension by treating inversion as root-finding. 
              Instead of hoping backward DDIM steps are accurate, we <em>optimize</em> each step to minimize reconstruction error.
            </p>

            {/* Newton-Raphson Convergence Visualization */}
            <div className="my-8">
              <img 
                src="/assets/newtonraphson.jpg" 
                alt="Newton-Raphson Convergence in Latent Space" 
                className="w-full rounded-lg border border-gray-800"
              />
              <p className="text-sm text-gray-500 text-center mt-3">
                Figure 4: Newton-Raphson convergence in latent space
              </p>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Classical Newton-Raphson</h3>
            
            <p className="text-gray-700 mb-4">
              Newton-Raphson finds roots of <InlineMath math="f(x) = 0" /> via iterative linearization:
            </p>

            <div className="my-8 overflow-x-auto">
              <BlockMath math="x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}" />
            </div>

            <p className="text-gray-700 mb-6">
              Geometrically: at each point, approximate <InlineMath math="f" /> with its tangent line and step to where that line crosses zero. 
              Convergence is quadratic near the root—error squares each iteration.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Adapting to Latent Space</h3>
            
            <p className="text-gray-700 mb-4">
              For diffusion inversion, we want to find <InlineMath math="z_t" /> such that one denoising step produces our target:
            </p>

            <div className="my-8 overflow-x-auto">
              <BlockMath math="f(z_t) = \text{denoise\_step}(z_t) - z_{t-1}^{\text{target}} = 0" />
            </div>

            <p className="text-gray-700 mb-6">
              But we have a problem: we don't know <InlineMath math="z_{t-1}^{\text{target}}" /> exactly. 
              GNRI introduces a clever reformulation.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">The GNRI Objective</h3>
            
            <p className="text-gray-700 mb-4">
              Instead of matching a fixed target, GNRI minimizes a composite objective:
            </p>

            <div className="my-8 overflow-x-auto">
              <BlockMath math="f(z_t) = |z_{t-1}(z_t) - z_t| - \alpha \cdot \text{dist}(z_{t-1}, z_0)" />
            </div>

            <p className="text-gray-700 mb-4">
              where:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><InlineMath math="z_{t-1}(z_t)" /> is the result of one denoising step from <InlineMath math="z_t" /></li>
              <li>The first term measures "how much did the latent change?"</li>
              <li>The second term is a Gaussian prior pulling toward the original image's latent <InlineMath math="z_0" /></li>
              <li><InlineMath math="\alpha" /> balances reconstruction vs. staying in-distribution</li>
            </ul>

            <p className="text-gray-700 mb-4">
              The distribution term uses a Gaussian centered on <InlineMath math="z_0" />:
            </p>

            <div className="my-8 overflow-x-auto">
              <BlockMath math="\text{dist}(z, z_0) = -\frac{1}{2} \left( \frac{z - z_0}{\sigma_t} \right)^2" />
            </div>

            <p className="text-gray-700 mb-6">
              where <InlineMath math="\sigma_t" /> is the noise level at timestep <InlineMath math="t" />. 
              This prior prevents the optimization from finding adversarial latents that technically minimize the first term but produce garbage images.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Gradient-Based Update</h3>
            
            <p className="text-gray-700 mb-4">
              The Newton-Raphson update becomes:
            </p>

            <div className="my-8 overflow-x-auto">
              <BlockMath math="z_t^{(k+1)} = z_t^{(k)} - \frac{1}{n} \cdot \frac{L}{\nabla_{z_t} L}" />
            </div>

            <p className="text-gray-700 mb-4">
              where <InlineMath math="L = \sum f(z_t)" /> and <InlineMath math="n" /> is the latent dimensionality. 
              The gradient <InlineMath math="\nabla_{z_t} L" /> flows backward through the UNet—this is why GNRI requires differentiable inference.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
              <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                <code>{`# GNRI inversion step - the core algorithm
def inversion_step(self, z_t, t, prompt_embeds, added_cond_kwargs, inv_hp, z_0):
    n_iters, alpha, lr = inv_hp
    latent = z_t
    best_latent, best_score = None, torch.inf
    curr_dist = self.get_timestamp_dist(z_0, t)
    latent_numel = latent.numel()  # 64*64*4 = 16384 for 512px
    
    for i in range(n_iters):
        latent.requires_grad = True
        
        # Forward pass through UNet
        noise_pred = self.unet_pass(latent, t, prompt_embeds, added_cond_kwargs)
        next_latent = self.backward_step(noise_pred, t, z_t)
        
        # GNRI objective: minimize change while staying in distribution
        f_x = (next_latent - latent).abs() - alpha * curr_dist(next_latent)
        L = f_x.sum()
        score = f_x.mean()
        
        if score < best_score:
            best_score = score
            best_latent = next_latent.detach()
        
        # Backward pass - gradients through UNet
        L.backward()
        
        # Newton-Raphson update
        latent = latent - (1 / latent_numel) * (L / latent.grad)
        latent.grad = None
    
    return best_latent`}</code>
              </pre>
            </div>

            <p className="text-gray-700">
              The key insight: we're not just running the UNet forward—we're differentiating <em>through</em> it to find optimal latents.
            </p>
          </section>

          {/* Implementation Deep Dive */}
          <section className="mb-16" id="implementation">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Implementation Deep Dive</h2>
            
            <p className="text-gray-700 mb-6">
              Deploying GNRI on SDXL required careful engineering across multiple components. 
              The official paper's code targets Stable Diffusion 1.5; adapting to SDXL's dual text encoders 
              and larger latent space introduced several challenges.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">The Euler Ancestral Scheduler</h3>
            
            <p className="text-gray-700 mb-4">
              SDXL uses Euler Ancestral sampling by default, which adds stochastic noise. 
              For GNRI, we need deterministic inversion with the <em>same</em> noise sequence used during inference. 
              The solution: pre-generate and share a noise list.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
              <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                <code>{`class MyEulerAncestralDiscreteScheduler(EulerAncestralDiscreteScheduler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.noise_list = None
    
    def set_noise_list(self, noise_list):
        """Share noise between inversion and inference."""
        self.noise_list = noise_list
    
    def step(self, model_output, timestep, sample, ...):
        # ... compute sigma_up, sigma_down ...
        
        # Use stored noise if available (GNRI mode)
        # Otherwise generate random noise (normal generation)
        if self.noise_list is not None:
            noise = self.noise_list[self.step_index]
        else:
            noise = torch.randn_like(sample)
        
        prev_sample = prev_sample + noise * sigma_up
        return prev_sample
    
    def inv_step(self, model_output, timestep, sample, ...):
        """Inverse step: subtract the same noise that will be added."""
        # ... compute sigma_up, sigma_down ...
        
        prev_sample = sample - derivative * dt
        prev_sample = prev_sample - self.noise_list[self.step_index] * sigma_up
        
        return prev_sample`}</code>
              </pre>
            </div>

            <p className="text-gray-700 mb-6">
              The critical detail: <code>inv_step</code> <em>subtracts</em> the noise that <code>step</code> will <em>add</em>. 
              When we later denoise with the same noise list, the operations cancel perfectly.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Noise List Initialization</h3>
            
            <p className="text-gray-700 mb-4">
              The noise list must be generated deterministically and shared across all schedulers:
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
              <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                <code>{`def _setup_noise(self, cfg: RunConfig):
    """Initialize shared noise list for GNRI."""
    g_cpu = torch.Generator().manual_seed(7865)  # Fixed seed
    img_size = self.model_config["image_size"]  # 512 or 1024
    VQAE_SCALE = 8
    latents_size = (1, 4, img_size // VQAE_SCALE, img_size // VQAE_SCALE)
    
    self.noise_list = [
        randn_tensor(latents_size, dtype=torch.float16, 
                     device=self.device, generator=g_cpu)
        for _ in range(cfg.num_inversion_steps)
    ]
    
    # Share across all schedulers
    self.pipe_inversion.scheduler.set_noise_list(self.noise_list)
    self.pipe_inference.scheduler.set_noise_list(self.noise_list)`}</code>
              </pre>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Gradient Flow Through the UNet</h3>
            
            <p className="text-gray-700 mb-4">
              The most subtle implementation detail: ensuring gradients flow correctly. 
              The <code>inversion_step</code> function must <em>not</em> use <code>@torch.no_grad()</code>, 
              but the UNet forward pass and backward DDIM step <em>should</em> be wrapped to avoid unnecessary computation:
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
              <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                <code>{`# NOTE: No @torch.no_grad() here - gradients needed!
def inversion_step(self, z_t, t, ...):
    for i in range(n_iters):
        latent.requires_grad = True
        noise_pred = self.unet_pass(latent, t, ...)  # Gradients flow here
        # ...
        L.backward()  # Backprop through UNet
        latent = latent - (1/n) * (L / latent.grad)

@torch.no_grad()  # No gradients needed for forward pass itself
def unet_pass(self, z_t, t, prompt_embeds, added_cond_kwargs):
    noise_pred = self.unet(z_t, t, encoder_hidden_states=prompt_embeds, ...)
    return noise_pred`}</code>
              </pre>
            </div>

            <p className="text-gray-700 mb-6">
              Wait—if <code>unet_pass</code> has <code>@torch.no_grad()</code>, how do gradients flow? 
              The answer: PyTorch's autograd tracks operations on tensors with <code>requires_grad=True</code>. 
              The <code>@torch.no_grad()</code> context prevents <em>new</em> gradient tracking but doesn't stop gradients 
              from flowing through already-tracked tensors. The latent enters with <code>requires_grad=True</code>, 
              so the UNet's operations are recorded.
            </p>
          </section>

          {/* The Comparison */}
          <section className="mb-16" id="comparison">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">The Comparison: Google AI vs. SDXL+GNRI</h2>
            
            <p className="text-gray-700 mb-6">
              This project compares two fundamentally different approaches to image generation and editing:
            </p>

            {/* Visual Comparison */}
            <div className="my-8 bg-gray-900 border border-gray-800 rounded-lg p-4">
              <img 
                src="/assets/gnriediting.png" 
                alt="GNRI vs Google AI Comparison" 
                className="w-full rounded"
              />
              <p className="text-sm text-gray-500 text-center mt-3">
                Figure 5: Side-by-side comparison of editing capabilities
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">Google AI Studio (Gemini)</h3>
                <p className="text-gray-700 mb-4">
                  Google's approach: massive scale, API simplicity, black-box inference. 
                  You send a prompt, receive an image. No control over the generation process, 
                  no ability to edit existing images (at the time of this implementation).
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-green-400 font-semibold mb-1">Strengths:</h4>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                      <li>Zero setup—API call and done</li>
                      <li>Consistently high quality</li>
                      <li>Handles complex prompts well</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">Weaknesses:</h4>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                      <li>No image editing capability</li>
                      <li>No control over generation process</li>
                      <li>Latency depends on API availability</li>
                      <li>Cost scales with usage</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">SDXL + GNRI</h3>
                <p className="text-gray-700 mb-4">
                  Our approach: local inference with mathematical control. 
                  The model runs on your GPU, and GNRI provides precise editing through optimization.
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-green-400 font-semibold mb-1">Strengths:</h4>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                      <li>True image editing—modify existing photos</li>
                      <li>Full control over generation parameters</li>
                      <li>No API costs after initial setup</li>
                      <li>Deterministic, reproducible results</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">Weaknesses:</h4>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                      <li>Requires GPU (L40S for comfortable inference)</li>
                      <li>More complex deployment</li>
                      <li>Quality depends on prompt engineering</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Performance Metrics</h3>
            
            <p className="text-gray-700 mb-4">On an NVIDIA L40S GPU:</p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left text-gray-700">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-3 px-4">Operation</th>
                    <th className="py-3 px-4">SDXL-Turbo</th>
                    <th className="py-3 px-4">SDXL Base</th>
                    <th className="py-3 px-4">SDXL Base + Refiner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">Generation</td>
                    <td className="py-3 px-4">~1.2s</td>
                    <td className="py-3 px-4">~8s</td>
                    <td className="py-3 px-4">~15s</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">GNRI Inversion</td>
                    <td className="py-3 px-4">~2s</td>
                    <td className="py-3 px-4">~12s</td>
                    <td className="py-3 px-4">N/A</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">Total Edit</td>
                    <td className="py-3 px-4">~3.5s</td>
                    <td className="py-3 px-4">~20s</td>
                    <td className="py-3 px-4">~27s</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-gray-700 mb-6">
              SDXL-Turbo achieves 4-step generation at 512×512, while SDXL Base uses 25 steps at 1024×1024. 
              The refiner adds another pass for fine details.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">When to Use Which</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Use Google AI when:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>You need quick generation without editing</li>
                  <li>You don't have GPU access</li>
                  <li>Prompt complexity is high</li>
                </ul>
              </div>
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Use SDXL+GNRI when:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>You need to edit existing images</li>
                  <li>You want deterministic, reproducible results</li>
                  <li>You're running many generations (cost efficiency)</li>
                  <li>You need fine control over the process</li>
                </ul>
              </div>
            </div>
          </section>

          {/* What I Learned */}
          <section className="mb-16" id="learned">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What I Learned</h2>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">The Gap Between Paper and Production</h3>
            
            <p className="text-gray-700 mb-4">
              Academic code optimizes for clarity and reproducibility. Production code optimizes for reliability and performance. 
              Bridging this gap required:
            </p>

            <ol className="list-decimal list-inside text-gray-700 space-y-3 mb-6">
              <li>
                <strong>Error handling everywhere</strong>: The paper's code assumes perfect inputs. 
                Real users upload corrupted JPEGs, wrong aspect ratios, and prompts in languages the model wasn't trained on.
              </li>
              <li>
                <strong>Memory management</strong>: SDXL + GNRI + Refiner exceeds 24GB VRAM. 
                Careful model loading/unloading and <code>torch.cuda.empty_cache()</code> calls were essential.
              </li>
              <li>
                <strong>Scheduler state management</strong>: The noise list must be synchronized across multiple pipeline instances. 
                A single desync produces gray images.
              </li>
            </ol>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Debugging Diffusion Models</h3>
            
            <p className="text-gray-700 mb-4">
              When GNRI produced gray outputs, the culprit was <code>@torch.no_grad()</code> on the wrong function. 
              Gradients weren't flowing, so Newton-Raphson couldn't optimize. 
              The fix: remove the decorator from <code>inversion_step</code>, keep it on <code>unet_pass</code>.
            </p>

            <p className="text-gray-700 mb-4">The debugging process:</p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
              <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                <code>{`# Added to inversion_step
if latent.grad is None:
    print(f"WARNING: No gradient at iteration {i}")
else:
    print(f"NR iter {i}: score={score:.6f}, grad_norm={latent.grad.norm():.6f}")`}</code>
              </pre>
            </div>

            <p className="text-gray-700 mb-6">
              Watching the gradient norm confirmed optimization was happening. 
              Score decreasing from 69 to 22 across iterations showed convergence.
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">The Importance of Noise Synchronization</h3>
            
            <p className="text-gray-700 mb-6">
              GNRI's magic depends on using <em>identical</em> noise during inversion and inference. 
              The scheduler's <code>inv_step</code> subtracts noise; <code>step</code> adds it back. 
              If the noise differs by even floating-point precision, reconstruction fails.
            </p>

            <p className="text-gray-700">
              The solution: generate noise once with a fixed seed, store it in a list, share that list across all scheduler instances.
            </p>
          </section>

          {/* Future Directions */}
          <section className="mb-16" id="future">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Future Directions</h2>
            
            <p className="text-gray-700 mb-6">
              Several improvements remain unexplored:
            </p>

            <ol className="list-decimal list-inside text-gray-700 space-y-3">
              <li>
                <strong>Attention injection</strong>: Beyond latent optimization, inject attention maps from the source image to preserve fine structure.
              </li>
              <li>
                <strong>Adaptive iterations</strong>: Currently using fixed 2 NR iterations. 
                Could dynamically increase iterations when score isn't converging.
              </li>
              <li>
                <strong>Multi-scale editing</strong>: Run GNRI at multiple resolutions, 
                combining coarse structure preservation with fine detail editing.
              </li>
              <li>
                <strong>LoRA integration</strong>: Fine-tuned LoRAs could improve domain-specific editing (faces, products, etc.).
              </li>
              <li>
                <strong>Kernel Level Optimizations</strong>: To make the generation faster we can optimize individual layers, 
                and even do Kernel Fusion.
              </li>
            </ol>
          </section>

          {/* Try It Yourself */}
          <section className="mb-16" id="try">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Try It Yourself</h2>
            
            <p className="text-gray-700 mb-6">
              The live demo compares Google AI Studio against SDXL+GNRI in real-time:
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a 
                href="/gnri"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                Live Demo
              </a>
              <a 
                href="https://github.com/ThomasKidane/GNRI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>

            <p className="text-gray-700">
              Upload an image, provide source and target prompts, and watch GNRI transform it while preserving structure.
            </p>
          </section>

            {/* Footer */}
            <div className="border-t border-gray-300 pt-8 mt-16">
              <Link 
                to="/projects" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors font-mono"
              >
                View more projects →
              </Link>
            </div>
        </article>
      </div>
    </>
  );
};

export default GNRIBlogPost;
