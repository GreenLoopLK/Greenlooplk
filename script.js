/* -----------------------------------------------------------------------------
   Green Loop Premium Brand Guidelines - Single-Page Scrolling Layout Script
   ----------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // Mark JS as active (lifts FOUC guard on hero elements)
    document.body.classList.add('js-ready');
    
    // 1. Check for prefers-reduced-motion (A11y constraint)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Animation Tokens mapping to user specs (Slowing down durations for majestic feel)
    const anim = {
        y: prefersReducedMotion ? 0 : 35,
        ySmall: prefersReducedMotion ? 0 : 15,
        x: prefersReducedMotion ? 0 : 15,
        scale: prefersReducedMotion ? 1 : 0.95,
        duration: prefersReducedMotion ? 0.01 : 1.5, // Majestic 1.5s default duration
        ease: "power4.out" // Clean exponential ease-out-expo
    };

    // 2. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
        duration: prefersReducedMotion ? 0.01 : 1.5, // Slightly longer smooth scroll duration
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium spring easing
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false
    });

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 3. Pre-split all .split-line elements once on page load for smooth, layout-safe reveals
    const splitLines = document.querySelectorAll('.split-line');
    splitLines.forEach(el => {
        if (!prefersReducedMotion) {
            const split = new SplitType(el, { types: 'lines, words' });
            split.lines.forEach(line => {
                const mask = document.createElement('div');
                mask.className = 'line-mask';
                line.parentNode.insertBefore(mask, line);
                mask.appendChild(line);
            });
            gsap.set(split.words, { yPercent: 105 });
            el.splitWords = split.words;

            // Apply highlight class to specific brand words in the hero tagline
            if (el.classList.contains('tagline')) {
                split.words.forEach(word => {
                    const text = word.textContent.trim().replace(/[.,()]/g, '');
                    if (['Reverse', 'Vending', 'Machine', 'RVM', 'John', 'Keells', 'Group'].includes(text)) {
                        word.classList.add('highlight-accent');
                    }
                });
            }
        }
    });

    // 4. Dynamic Section Dividers & Placeholder SVG Borders Injection
    // Section Dividers injection between all slide sections
    const sections = document.querySelectorAll('.slide-section');
    sections.forEach((section, idx) => {
        if (idx > 0) {
            const hr = document.createElement('hr');
            hr.className = 'section-divider';
            section.parentNode.insertBefore(hr, section);
        }
    });

    // Placeholder Borders injection for dashed border animations
    const placeholders = document.querySelectorAll('.placeholder-frame:not(#usp-frame-target)');
    placeholders.forEach(frame => {
        // Create wrapper SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "placeholder-border-svg");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "0";
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", "placeholder-border-rect");
        rect.setAttribute("x", "0.75");
        rect.setAttribute("y", "0.75");
        rect.setAttribute("width", "calc(100% - 1.5px)");
        rect.setAttribute("height", "calc(100% - 1.5px)");
        rect.setAttribute("fill", "none");
        rect.setAttribute("stroke", "rgba(46, 46, 46, 0.12)");
        rect.setAttribute("stroke-width", "1.5");
        rect.setAttribute("stroke-dasharray", "6 4");
        
        svg.appendChild(rect);
        frame.appendChild(svg);
        
        // Remove static CSS border
        frame.style.border = "none";
    });

    // Inject hover rules dynamically to avoid double file modifications
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .placeholder-frame:hover .placeholder-border-rect {
            stroke: var(--color-keells-green) !important;
            stroke-width: 2px !important;
        }
        .placeholder-border-svg {
            overflow: visible;
        }
    `;
    document.head.appendChild(styleEl);

    // 5. Custom Spotlight Cursor Trail Loop (Squash & Stretch Velocity Follower)
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorCircle = document.querySelector('.custom-cursor-circle');
    
    let mouseX = 0;
    let mouseY = 0;
    let circleX = 0;
    let circleY = 0;
    let speed = 0;
    let angle = 0;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant dot position
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });
    
    // Lagging circle trail interpolation
    gsap.ticker.add(() => {
        if (prefersReducedMotion) {
            cursorCircle.style.left = `${mouseX}px`;
            cursorCircle.style.top = `${mouseY}px`;
            return;
        }

        const vx = mouseX - circleX;
        const vy = mouseY - circleY;
        
        // Position interpolation (lerp)
        circleX += vx * 0.1;
        circleY += vy * 0.1;
        
        // Calculate velocity magnitude & direction
        const currentSpeed = Math.sqrt(vx * vx + vy * vy);
        const currentAngle = Math.atan2(vy, vx) * 180 / Math.PI;
        
        // Smooth out velocity transitions
        speed += (currentSpeed - speed) * 0.15;
        angle += (currentAngle - angle) * 0.15;
        
        // Squash and stretch scale limits (max stretch 1.4x, max squeeze 0.7x)
        const scaleX = 1 + Math.min(speed * 0.005, 0.4);
        const scaleY = 1 - Math.min(speed * 0.005, 0.3);
        
        gsap.set(cursorCircle, {
            x: circleX,
            y: circleY,
            left: 0,
            top: 0,
            xPercent: -50,
            yPercent: -50,
            rotation: angle,
            scaleX: scaleX,
            scaleY: scaleY,
            transformOrigin: "center center"
        });
    });

    // Active state triggers on hover elements
    const hoverElements = document.querySelectorAll('.overview-box, .cta-button, .dot-link, .directory-card, .metric-card, .operations-step, .color-spec-card, .placeholder-frame, .strategy-table tbody tr');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorCircle.classList.add('active'));
        el.addEventListener('mouseleave', () => cursorCircle.classList.remove('active'));
    });

    // 6. ScrollTrigger Initialization
    gsap.registerPlugin(ScrollTrigger);

    const slides = gsap.utils.toArray('.slide-section');
    const dotLinks = document.querySelectorAll('.dot-link');

    // 6a. Navbar Glassmorphism on scroll past 40px
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // State variables for logo transition lifecycle
    let isPageLoading = true;

    // 6b. Page Load Hero Cascade (Awwwards Mask Entrance)
    const heroSection = document.querySelector('#slide-hero');
    if (heroSection) {
        const isScrolledPastHero = window.scrollY > window.innerHeight * 0.5;

        // Common scrubbed ScrollTrigger setup function
        const initScrubbedLogoTrigger = () => {
            gsap.fromTo('#shared-logo', 
                {
                    x: () => window.innerWidth * 0.5 - 55, // Shift left slightly from 20 for optical center alignment
                    y: '35vh',
                    xPercent: -50,
                    yPercent: -50,
                    scale: 0.85,
                    transformOrigin: 'center center'
                },
                {
                    scrollTrigger: {
                        trigger: '#slide-hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                        invalidateOnRefresh: true,
                    },
                    x: () => window.innerWidth * 0.038, // Shift left slightly from 0.05
                    y: 40, // 40px from top
                    xPercent: 0,
                    yPercent: 0,
                    scale: 0.27,
                    transformOrigin: 'left center',
                    ease: 'none'
                }
            );
        };

        if (isScrolledPastHero) {
            // Immediately place logo in top-left target if loaded scrolled down
            gsap.set('#shared-logo', {
                x: () => window.innerWidth * 0.038, // Shift left slightly from 0.05
                y: 40,
                xPercent: 0,
                yPercent: 0,
                scale: 0.27,
                opacity: 1,
                transformOrigin: 'left center'
            });

            // If page loaded scrolled down, force tagline words to be visible so they appear when scrolling back up
            const heroTagline = heroSection.querySelector('.tagline');
            if (heroTagline && heroTagline.splitWords) {
                gsap.set(heroTagline.splitWords, { yPercent: 0 });
            }

            isPageLoading = false;
            initScrubbedLogoTrigger();
        } else {
            const loadTL = gsap.timeline({ delay: 0.2 });

            const heroTagline = heroSection.querySelector('.tagline');
            const heroMeta = heroSection.querySelector('.meta-tag');

            // Set logo to starting position (centered on hero) before animating
            gsap.set('#shared-logo', {
                x: () => window.innerWidth * 0.5 - 55, // Shift left slightly from 20 for optical center alignment
                y: '35vh',
                xPercent: -50,
                yPercent: -50,
                scale: 0.55,
                opacity: 0,
                transformOrigin: 'center center'
            });

            // Logo placeholder fade + scale entrance
            loadTL.to('#shared-logo', {
                opacity: 1,
                scale: 0.85,
                duration: 0.8,
                ease: 'power3.out'
            })
            // Eyebrow Label
            .from(heroMeta, {
                opacity: 0,
                x: -anim.x,
                duration: 1.0,
                ease: anim.ease
            }, "-=0.5");

            if (prefersReducedMotion) {
                loadTL.from(heroTagline, { opacity: 0, duration: 1.0 }, "-=0.4");
            } else {
                if (heroTagline && heroTagline.splitWords) {
                    loadTL.to(heroTagline.splitWords, {
                        yPercent: 0,
                        duration: 1.4,
                        stagger: 0.03,
                        ease: "power4.out"
                    }, "-=0.8");
                }
            }

            loadTL.fromTo('.hero-cta-wrap', 
                { y: anim.ySmall, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.0, ease: anim.ease }
            , "-=0.6")
            // "v1.0" badge scale-up
            .from('.version-label', {
                opacity: 0,
                scale: 0.9,
                duration: 0.8,
                ease: anim.ease
            }, "-=0.5")
            // Floating Dot nav fade-in
            .from('.dot-nav', {
                opacity: 0,
                duration: 1.2
            }, "-=0.6")
            .call(() => {
                isPageLoading = false;
                initScrubbedLogoTrigger();
            });
        }

        // Spawn premium floating leaves in the hero section
        const leafContainer = document.createElement('div');
        leafContainer.className = 'floating-leaves-container';
        heroSection.appendChild(leafContainer);

        const leafSVG = `
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 100%; height: 100%;">
                <path d="M21,3c-3,0-8,3-10,6C9,11,7,14,3,17c0,0,3,1,5,0c2-0.5,4-2,6-4c2,2,4,3.5,6,4c2,0.5,5,0,5,0C17,14,15,11,13,9C15,6,20,3,21,3z"/>
            </svg>
        `;

        const numLeaves = 15;
        for (let i = 0; i < numLeaves; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'floating-leaf';
            leaf.innerHTML = leafSVG;
            
            const size = Math.random() < 0.8 
                ? Math.random() * 8 + 8   // Small: 8px to 16px
                : Math.random() * 12 + 16; // Medium: 16px to 28px
                
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const duration = Math.random() * 15 + 15;
            const delay = Math.random() * -25;
            const rotation = Math.random() * 360;
            
            leaf.style.width = `${size}px`;
            leaf.style.height = `${size}px`;
            leaf.style.left = `${startX}vw`;
            leaf.style.top = `${startY}vh`;
            leaf.style.transform = `rotate(${rotation}deg)`;
            leaf.style.animation = `leafFloat ${duration}s linear infinite`;
            leaf.style.animationDelay = `${delay}s`;
            
            leaf.style.opacity = (size < 16) 
                ? (Math.random() * 0.20 + 0.12).toFixed(2)
                : (Math.random() * 0.30 + 0.20).toFixed(2);
                
            if (size < 12) {
                leaf.style.filter = 'blur(1px)';
            } else if (size > 22) {
                leaf.style.filter = 'blur(1.5px)';
            }

            leafContainer.appendChild(leaf);
        }
    } else {
        isPageLoading = false;
    }

    // 6c. Active State Sync for Dot Navigation, Mesh Colors, and Shared Morphing Frame on scroll
    const frameLabels = {
        'slide-hero': '[ Green Loop System Canvas ]',
        'slide-overview': '[ Green Loop System Canvas ]',
        'slide-directory': '[ Green Loop System Canvas ]',
        'slide-conflict': '[ Waste Statistics ]',
        'slide-survey': '[ Research Insights ]',
        'slide-competitors': '[ Research & Development ]',
        'slide-usp': '[ Product Definition ]',
        'slide-decisions': '[ Product Definition ]',
        'slide-logo': '[ Green Loop Brand Specs ]',
        'slide-construction': '[ Green Loop Brand Specs ]',
        'slide-colors': '[ Green Loop Brand System ]',
        'slide-type': '[ Green Loop Brand System ]',
        'slide-photo': '[ Green Loop Brand System ]',
        'slide-applications': '[ RVM Product Ecosystem ]',
        'slide-mkt-campaigns': '[ Marketing & Outreach ]',
        'slide-mkt-channels': '[ Marketing & Outreach ]',
        'slide-rvm-render': '[ RVM Physical Design ]',
        'slide-rvm-dimensions': '[ RVM Physical Design ]',
        'slide-placement': '[ RVM Lobby Placement ]',
        'slide-rvm-screen': '[ RVM UI/UX Interface ]',
        'slide-rvm-app': '[ RVM UI/UX Interface ]',
        'slide-rewards': '[ RVM Reward Matrix ]',
        'slide-telemetry': '[ RVM Smart Logistics ]',
        'slide-logistics': '[ RVM Smart Logistics ]',
        'slide-journey': '[ Customer Journey ]',
        'slide-habit-loop': '[ Customer Journey ]',
        'slide-bus-model': '[ Revenue Model ]',
        'slide-bus-financials': '[ RVM Financial Matrix ]',
        'slide-bus-roadmap': '[ Future Roadmap ]',
        'slide-future-education': '[ Future Roadmap ]',
        'slide-mkt-calendar': '[ Future Roadmap ]'
    };

    // Shared morph state tracking
    let activeDefaultTarget = null;
    let activeDefaultLabel = '';
    let hoveredElement = null;

    function getElementBounds(element) {
        if (!element) return { left: 0, top: 0, width: 0, height: 0 };
        
        let revealAncestors = [];
        let cur = element;
        while (cur && cur !== document.body) {
            if (cur.classList.contains('reveal-element')) {
                revealAncestors.push(cur);
            }
            cur = cur.parentElement;
        }

        const originalTransforms = revealAncestors.map(el => {
            return {
                el: el,
                y: gsap.getProperty(el, "y")
            };
        });

        revealAncestors.forEach(el => {
            gsap.set(el, { y: 0 });
        });

        const viewportRect = document.querySelector('.viewport-container').getBoundingClientRect();
        const rect = element.getBoundingClientRect();

        originalTransforms.forEach(state => {
            gsap.set(state.el, { y: state.y });
        });

        return {
            left: rect.left - viewportRect.left,
            top: rect.top - viewportRect.top,
            width: rect.width,
            height: rect.height
        };
    }

    function updateFrameToTarget(target, labelText, isHover = false) {
        let frameOpacity = 1;
        let frameScale = 1;
        let frameTargetBounds = { left: 0, top: 0, width: 0, height: 0 };

        // Force hide the shared frame ONLY when slide-applications is active, targeted, or pinned
        const st = ScrollTrigger.getById('applications-trigger');
        const isInsideSlideApps = target && (target.closest('#slide-applications') || target.id === 'slide-applications');
        const isScrollInsideApps = st && (window.scrollY >= st.start && window.scrollY < st.end);

        if (isInsideSlideApps || isScrollInsideApps) {
            gsap.to('#shared-frame', { opacity: 0, scale: 0.8, duration: 0.3, overwrite: 'auto' });
            return;
        }

        if (!target) {
            frameOpacity = 0;
            frameScale = 0.8;
            const activeSlide = document.querySelector('.slide-section.active') || heroSection;
            const container = activeSlide.querySelector('.container') || activeSlide;
            frameTargetBounds = getElementBounds(container);
        } else {
            frameTargetBounds = getElementBounds(target);
        }

        const labelEl = document.getElementById('shared-frame-lbl');
        if (labelEl) {
            labelEl.innerText = labelText || '[ Green Loop System Canvas ]';
        }

        gsap.to('#shared-frame', {
            left: frameTargetBounds.left,
            top: frameTargetBounds.top,
            width: frameTargetBounds.width,
            height: frameTargetBounds.height,
            borderRadius: 8,
            opacity: frameOpacity,
            scale: frameScale,
            duration: isHover ? 0.6 : 1.2,
            ease: isHover ? 'power2.out' : 'power3.inOut',
            overwrite: 'auto',
            onUpdate: () => {
                const coordsText = document.getElementById('shared-frame-coords');
                if (coordsText) {
                    coordsText.innerText = `DX:${Math.round(frameTargetBounds.left)} DY:${Math.round(frameTargetBounds.top)}`;
                }
            }
        });
    }

    function updateSharedElements(activeSlide, force = false) {
        // Logo position is now fully managed by the scrubbed ScrollTrigger on the hero slide,
        // so we don't need any logo positioning calculations or GSAP animations here.

        // Determine default target for active slide
        const frameHide = activeSlide.getAttribute('data-frame-hide') === 'true';
        const frameTargetSelector = activeSlide.getAttribute('data-frame-target');

        if (frameHide || !frameTargetSelector) {
            activeDefaultTarget = null;
            activeDefaultLabel = '';
        } else {
            const targetEl = document.querySelector(frameTargetSelector);
            if (targetEl) {
                activeDefaultTarget = targetEl;
            } else {
                activeDefaultTarget = activeSlide.querySelector('.container') || activeSlide;
            }
            activeDefaultLabel = frameLabels[activeSlide.id] || '[ Green Loop System Canvas ]';
        }

        // Morph shared frame if not hovered
        if (!hoveredElement) {
            updateFrameToTarget(activeDefaultTarget, activeDefaultLabel, false);
        }
    }

    function getLabelForElement(el) {
        const card = el.closest('.guideline-card');
        if (card) {
            const attrLabel = card.getAttribute('data-frame-label');
            if (attrLabel) return `[ ${attrLabel} ]`;
            const monoLabel = card.querySelector('.mono-label');
            if (monoLabel) return `[ ${monoLabel.innerText.trim()} ]`;
        }
        
        const selfLabel = el.getAttribute('data-frame-label');
        if (selfLabel) return `[ ${selfLabel} ]`;

        const labelInside = el.querySelector('.frame-label');
        if (labelInside) return labelInside.innerText.trim();

        const colorCard = el.closest('.color-spec-card');
        if (colorCard) {
            const mono = colorCard.querySelector('.mono-label');
            if (mono) return `[ ${mono.innerText.trim()} ]`;
        }

        const dirCard = el.closest('.directory-card');
        if (dirCard) {
            const title = dirCard.querySelector('h4');
            if (title) return `[ ${title.innerText.trim()} ]`;
        }

        const metricCard = el.closest('.metric-card');
        if (metricCard) {
            const lbl = metricCard.querySelector('.metric-lbl');
            if (lbl) return `[ ${lbl.innerText.trim()} ]`;
        }

        const section = el.closest('.slide-section');
        if (section) {
            return frameLabels[section.id] || '[ Green Loop System Canvas ]';
        }

        return '[ Green Loop System Canvas ]';
    }

    // Attach frame hover listeners to all potential visual targets on page load
    const attachFrameHoverListeners = () => {
        const frameHoverTargets = document.querySelectorAll('.placeholder-frame:not(#usp-frame-target), .image-container, .strategy-table-wrapper, .color-spec-card, .directory-card, .metric-card');
        frameHoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                hoveredElement = el;
                const label = getLabelForElement(el);
                updateFrameToTarget(el, label, true);
            });

            el.addEventListener('mouseleave', () => {
                if (hoveredElement === el) {
                    hoveredElement = null;
                    updateFrameToTarget(activeDefaultTarget, activeDefaultLabel, false);
                }
            });
        });
    };
    
    attachFrameHoverListeners();

    // Initial position on load
    if (heroSection) {
        updateSharedElements(heroSection);
        document.body.classList.add('hero-active');
    }

    slides.forEach((slide, idx) => {
        ScrollTrigger.create({
            trigger: slide,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if (self.isActive) {
                    // Update active nav dot
                    dotLinks.forEach(link => link.classList.remove('active'));
                    if (dotLinks[idx]) {
                        dotLinks[idx].classList.add('active');
                    }

                    if (slide.id === 'slide-hero') {
                        document.body.classList.add('hero-active');
                    } else {
                        document.body.classList.remove('hero-active');
                    }

                    // Dynamically morph background blobs based on active section attribute values
                    const blob1Color = slide.getAttribute('data-blob1-color') || '#6DBB45';
                    const blob2Color = slide.getAttribute('data-blob2-color') || '#FFD54A';

                    gsap.to('.blob-1', {
                        backgroundColor: blob1Color,
                        x: slide.getAttribute('data-blob1-x') || '0vw',
                        y: slide.getAttribute('data-blob1-y') || '0vh',
                        scale: parseFloat(slide.getAttribute('data-blob1-scale')) || 1.0,
                        duration: 1.5,
                        ease: 'power3.out'
                    });

                    gsap.to('.blob-2', {
                        backgroundColor: blob2Color,
                        x: slide.getAttribute('data-blob2-x') || '0vw',
                        y: slide.getAttribute('data-blob2-y') || '0vh',
                        scale: parseFloat(slide.getAttribute('data-blob2-scale')) || 1.0,
                        duration: 1.5,
                        ease: 'power3.out'
                    });

                    // Morph shared logo and blueprint frame
                    updateSharedElements(slide);
                }
            }
        });
    });

    // 6d. Component-Level Scroll reveals (Triggered exactly when elements enter viewport)
    
    // Section Headers
    document.querySelectorAll('.slide-section').forEach(slide => {
        if (slide.id === 'slide-hero') return;
        const header = slide.querySelector('.section-header');
        if (!header) return;

        const eyebrow = header.querySelector('.section-num');
        const heading = header.querySelector('.split-line');

        const headerTL = gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                once: true
            }
        });

        if (eyebrow) {
            headerTL.from(eyebrow, {
                x: -anim.x,
                opacity: 0,
                duration: 0.8,
                ease: anim.ease
            });
        }

        if (heading) {
            if (prefersReducedMotion) {
                headerTL.from(heading, { opacity: 0, duration: 1.0 }, eyebrow ? "-=0.4" : "0");
            } else if (heading.splitWords) {
                headerTL.to(heading.splitWords, {
                    yPercent: 0,
                    duration: 1.5,
                    stagger: 0.05,
                    ease: "power4.out"
                }, eyebrow ? "-=0.5" : "0");
            }
        }
    });

    // Standard Reveal Elements (Text blocks, boxes, column contents)
    document.querySelectorAll('.reveal-element').forEach(el => {
        if (el.closest('#slide-survey')) {
            return; // Handled separately (coordinated timeline)
        }
        if (el.classList.contains('directory-grid-13') ||
            el.classList.contains('metric-row') ||
            el.classList.contains('strategy-table-wrapper') ||
            el.classList.contains('journey-flow')) {
            return; // Handled separately
        }

        gsap.fromTo(el, 
            { y: anim.ySmall, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1.0, 
                ease: anim.ease,
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    once: true
                },
                onComplete: () => {
                    el.querySelectorAll('strong.highlight-sweep').forEach(span => {
                        span.classList.add('active');
                    });
                }
            }
        );
    });

    // Section Divider Lines
    document.querySelectorAll('.section-divider').forEach(divider => {
        gsap.to(divider, {
            scaleX: 1,
            duration: 1.5,
            ease: anim.ease,
            scrollTrigger: {
                trigger: divider,
                start: "top 92%",
                once: true
            }
        });
    });

    // Placeholder Visual Card Frames
    document.querySelectorAll('.placeholder-frame').forEach(placeholder => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: placeholder,
                start: "top 85%",
                once: true
            }
        });
        
        tl.fromTo(placeholder, 
            {
                scale: anim.scale,
                opacity: 0
            },
            {
                scale: 1,
                opacity: 1,
                duration: 1.2,
                ease: anim.ease
            }
        );
        
        const rect = placeholder.querySelector('.placeholder-border-rect');
        if (rect && !prefersReducedMotion) {
            tl.add(() => {
                const bbox = rect.ownerSVGElement.parentNode.getBoundingClientRect();
                const perimeter = 2 * (bbox.width + bbox.height);
                gsap.fromTo(rect, 
                    { strokeDashoffset: perimeter, strokeDasharray: "6 4" },
                    { strokeDashoffset: 0, duration: 1.6, ease: "power2.out" }
                );
            }, "-=0.8");
        }
    });

    // 7. Custom Section Diagrams Animations (Pre-split trigger logic)
    
    // 7a. Research Insights (Ecosystem Diagram & Cards) Animation
    const slideSurvey = document.getElementById('slide-survey');
    if (slideSurvey) {
        const overviewBox = slideSurvey.querySelector('.overview-text-column .overview-box');
        const cards = slideSurvey.querySelectorAll('.insight-item-card');
        const ecosystemCard = slideSurvey.querySelector('.ecosystem-diagram-card');
        const centerNode = slideSurvey.querySelector('.node-center');
        const outerNodes = slideSurvey.querySelectorAll('.diag-node:not(.node-center)');
        const links = slideSurvey.querySelectorAll('.diag-link');
        const insightCard = slideSurvey.querySelector('.diagram-insight-card');
        const sourcesSection = slideSurvey.querySelector('.sources-section');

        // Set initial states
        gsap.set(overviewBox, { y: anim.ySmall, opacity: 0 });
        gsap.set(cards, { y: anim.ySmall, opacity: 0 });
        gsap.set(ecosystemCard, { scale: anim.scale, opacity: 0 });
        
        if (prefersReducedMotion) {
            gsap.set(centerNode, { scale: 1, opacity: 0 });
            gsap.set(outerNodes, { scale: 1, opacity: 0 });
            links.forEach(link => {
                gsap.set(link, { opacity: 0 });
            });
        } else {
            gsap.set(centerNode, { scale: 0, opacity: 0, transformOrigin: 'center center' });
            gsap.set(outerNodes, { scale: 0.8, opacity: 0, transformOrigin: 'center center' });
            links.forEach(link => {
                const length = link.getTotalLength();
                gsap.set(link, { strokeDasharray: length, strokeDashoffset: length });
            });
        }
        
        gsap.set(insightCard, { y: anim.ySmall, opacity: 0 });
        gsap.set(sourcesSection, { y: anim.ySmall, opacity: 0 });

        const surveyTL = gsap.timeline({
            scrollTrigger: {
                trigger: slideSurvey,
                start: "top 75%",
                once: true
            }
        });

        // 1. Reveal left overview text column & right ecosystem frame card
        surveyTL.to([overviewBox, ecosystemCard], {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.8, // Snappier entrance
            stagger: 0.15,
            ease: anim.ease
        })
        // 2. Stagger reveal the 4 left info cards
        .to(cards, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: anim.ease
        }, "-=0.6");

        if (prefersReducedMotion) {
            surveyTL.to([centerNode, outerNodes, links], {
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: anim.ease
            }, "-=0.4");
        } else {
            surveyTL.to(centerNode, {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                ease: "back.out(1.5)"
            }, "-=0.8")
            .to(links, {
                strokeDashoffset: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: "power2.out"
            }, "-=0.4")
            .to(outerNodes, {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: "back.out(1.2)"
            }, "-=0.4");
        }

        // 6. Reveal bottom right insight card & sources section
        surveyTL.to([insightCard, sourcesSection], {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: anim.ease
        }, "-=0.4");
    }

    // 7b. Behavioral Habit Loop Sequential draw-on
    const loopSvg = document.querySelector('.behavioral-loop-svg');
    if (loopSvg) {
        gsap.set('.behavioral-loop-svg .loop-node', { scale: 0, opacity: 0 });
        gsap.set('.behavioral-loop-svg .loop-path', { strokeDasharray: 300, strokeDashoffset: 300 });

        const habitTL = gsap.timeline({
            scrollTrigger: {
                trigger: loopSvg,
                start: "top 80%",
                once: true
            }
        });

        habitTL.to('.node-1', { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
               .to('.path-1', { strokeDashoffset: 0, duration: 0.9, ease: "sine.inOut" })
               .to('.node-2', { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
               .to('.path-2', { strokeDashoffset: 0, duration: 0.9, ease: "sine.inOut" })
               .to('.node-3', { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
               .to('.path-3', { strokeDashoffset: 0, duration: 0.9, ease: "sine.inOut" })
               .to('.node-4', { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
               .to('.path-4', { strokeDashoffset: 0, duration: 0.9, ease: "sine.inOut" })
               .add(() => {
                   document.querySelectorAll('.loop-node').forEach(node => node.classList.add('active'));
                   const dot = document.querySelector('.loop-glowing-dot');
                   if (dot && !prefersReducedMotion) {
                       dot.style.display = "block";
                       const dotObj = { angle: -Math.PI / 2 };
                       gsap.to(dotObj, {
                           angle: 1.5 * Math.PI,
                           duration: 7.0,
                           repeat: -1,
                           ease: "none",
                           onUpdate: () => {
                               const x = 120 + 80 * Math.cos(dotObj.angle);
                               const y = 120 + 80 * Math.sin(dotObj.angle);
                               gsap.set(dot, { attr: { cx: x, cy: y } });
                           }
                       });
                   }
               });
    }

    // 7c. Floor plan blueprint sketch-line drawing (Line-by-line)
    const floorPlanSvg = document.querySelector('.floor-plan-svg');
    if (floorPlanSvg) {
        gsap.set('.floor-plan-svg .sketch-line', { strokeDasharray: 110, strokeDashoffset: 110 });
        gsap.set('.floor-plan-svg .clearance-rect', { strokeDasharray: 500, strokeDashoffset: 500 });
        
        const blueprintTL = gsap.timeline({
            scrollTrigger: {
                trigger: floorPlanSvg,
                start: "top 80%",
                once: true
            }
        });
        
        blueprintTL.to('.s-1', { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" })
                   .to('.s-2', { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" }, "-=0.2")
                   .to('.s-3', { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" }, "-=0.2")
                   .to('.s-4', { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" }, "-=0.2")
                   .to('.floor-plan-svg .clearance-rect', { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" })
                   .to('.floor-plan-svg .machine-hatch', { opacity: 1, duration: 0.6 }, "<0.3")
                   .to('.floor-plan-svg .dim-line', { opacity: 1, duration: 0.8, stagger: 0.25 }, "-=0.3");
    }

    // 7cc. Feasibility Decisions & Accepted Materials animations
    const slideDecisions = document.getElementById('slide-decisions');
    if (slideDecisions) {
        const decisionsFrame = document.getElementById('decisions-frame-target');
        const textColumn = slideDecisions.querySelector('.overview-text-column');
        const acceptedCard = slideDecisions.querySelector('.card-accepted');
        const soonHdpeCard = slideDecisions.querySelector('.card-soon-hdpe');
        const soonAluCard = slideDecisions.querySelector('.card-soon-aluminum');
        const warningBadge = slideDecisions.querySelector('.decision-warning-badge');
        const connectors = slideDecisions.querySelectorAll('.decision-line');

        // Set initial states
        gsap.set(decisionsFrame, { y: 20, opacity: 0 });
        gsap.set(textColumn, { y: anim.ySmall, opacity: 0 });
        gsap.set([acceptedCard, soonHdpeCard, soonAluCard, warningBadge], { scale: 0.95, opacity: 0, transformOrigin: "center center" });
        
        connectors.forEach(line => {
            const len = line.getTotalLength();
            gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        });

        const decisionsTL = gsap.timeline({
            scrollTrigger: {
                trigger: slideDecisions,
                start: "top 75%",
                once: true
            }
        });

        // 1. Diagram fades in and moves upward on scroll
        decisionsTL.to(decisionsFrame, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        })
        .to(textColumn, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: anim.ease
        }, "-=0.6");

        // 2. Connection lines animate from the center outward
        connectors.forEach((line) => {
            decisionsTL.to(line, {
                strokeDashoffset: 0,
                duration: 0.8,
                ease: "power1.inOut"
            }, "-=0.5");
        });

        // 3. Fades and scales in Cards and Badge
        decisionsTL.to(warningBadge, {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "back.out(1.2)"
        }, "-=0.6")
        .to(acceptedCard, {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "back.out(1.2)"
        }, "-=0.4")
        .to([soonHdpeCard, soonAluCard], {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)"
        }, "-=0.3");

        // 4. Start continuous premium loops
        decisionsTL.call(() => {
            if (prefersReducedMotion) return;

            // A. Accepted card gently floats by 5px
            gsap.to(acceptedCard, {
                y: "-=5",
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // B. Accepted badge softly pulses
            const acceptedRect = acceptedCard.querySelector('.badge-accepted rect');
            const acceptedText = acceptedCard.querySelector('.badge-accepted text');
            if (acceptedRect && acceptedText) {
                gsap.to([acceptedRect, acceptedText], {
                    scale: 1.05,
                    transformOrigin: "center center",
                    duration: 1.5,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }

            // C. Coming Soon cards have a subtle glowing border
            const hdpeRect = soonHdpeCard.querySelector('.soon-card-rect');
            const aluRect = soonAluCard.querySelector('.soon-card-rect');
            if (hdpeRect && aluRect) {
                gsap.to([hdpeRect, aluRect], {
                    stroke: "#6DBE45",
                    filter: "drop-shadow(0 0 8px rgba(109, 190, 69, 0.35))",
                    duration: 2.0,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }

            // D. PVC warning badge slowly fades in and out
            gsap.to(warningBadge, {
                opacity: 0.4,
                duration: 3.0,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    }

    // 7d. USP Process Flow Interactive Animation
    const slideUsp = document.getElementById('slide-usp');
    if (slideUsp) {
        const glassCard = document.getElementById('usp-frame-target');
        const leftBoxes = slideUsp.querySelectorAll('.overview-text-column .overview-box');
        const traditionalNodes = slideUsp.querySelectorAll('.node-traditional');
        const greenloopNodes = slideUsp.querySelectorAll('.node-greenloop');
        const traditionalConnectors = slideUsp.querySelectorAll('.traditional-connectors line');
        const greenloopConnectors = slideUsp.querySelectorAll('.flow-path');
        const greenloopPulses = slideUsp.querySelectorAll('.flow-pulse');
        const hudBlueprint = slideUsp.querySelector('.hud-blueprint');
        const flowHeaders = slideUsp.querySelector('.flow-headers');
        
        const scanChecklist = slideUsp.querySelector('.scan-checklist');
        const checkItems = slideUsp.querySelectorAll('.check-item');
        const scanLine = slideUsp.querySelector('.scan-line');
        const crushGear = slideUsp.querySelector('.crush-gear-g');
        const rewardText = slideUsp.querySelector('.rewards-text-sub');
        const pulseRing = slideUsp.querySelector('.reward-pulse-ring');

        // Set initial states
        gsap.set(glassCard, { y: 20, opacity: 0 });
        gsap.set(leftBoxes, { y: anim.ySmall, opacity: 0 });
        gsap.set(traditionalNodes, { scale: 0.95, opacity: 0, transformOrigin: 'center center' });
        gsap.set(greenloopNodes, { scale: 0.95, opacity: 0, transformOrigin: 'center center' });
        gsap.set(flowHeaders, { opacity: 0 });
        gsap.set(hudBlueprint, { opacity: 0 });
        gsap.set(traditionalConnectors, { opacity: 0 });
        gsap.set(pulseRing, { attr: { r: 58 }, opacity: 0 });
        
        greenloopConnectors.forEach(path => {
            const len = path.getTotalLength();
            gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        });
        greenloopPulses.forEach(pulse => {
            const len = pulse.getTotalLength();
            gsap.set(pulse, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        });
        
        gsap.set(scanChecklist, { opacity: 0, y: 5 });
        gsap.set(checkItems, { opacity: 0 });
        gsap.set(scanLine, { opacity: 0, y: -44 });
        gsap.set(crushGear, { transformOrigin: 'center center', rotation: 0 });

        const uspTL = gsap.timeline({
            scrollTrigger: {
                trigger: '#slide-usp',
                start: "top 75%",
                once: true
            }
        });

        // 1. Entrance animation (entire diagram fades and moves up 20px)
        uspTL.to(glassCard, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        })
        .to(leftBoxes, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: anim.ease
        }, "-=0.6")
        .to(flowHeaders, {
            opacity: 1,
            duration: 0.6
        }, "-=0.4")
        .to(hudBlueprint, {
            opacity: 0.02,
            duration: 0.8
        }, "-=0.4");

        // 2. Animate GreenLoop cards one by one from left to right (Fade in, scale 0.95 -> 1.0, soft green glow for 0.5s)
        const glNodesList = [
            slideUsp.querySelector('.node-deposit'),
            slideUsp.querySelector('.node-scan'),
            slideUsp.querySelector('.node-verify'),
            slideUsp.querySelector('.node-crush'),
            slideUsp.querySelector('.node-reward')
        ];

        glNodesList.forEach((node, idx) => {
            uspTL.to(node, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "power2.out"
            }, idx === 0 ? "-=0.3" : "-=0.25");

            const rect = node.querySelector('rect');
            if (rect) {
                uspTL.to(rect, {
                    stroke: "#5CBF43",
                    filter: "drop-shadow(0 0 8px rgba(92, 191, 67, 0.45))",
                    duration: 0.25,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut"
                }, "<");
            }
        });

        // 3. Stagger reveal Traditional cards
        uspTL.to(traditionalNodes, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.4")
        .to(traditionalConnectors, {
            opacity: 1,
            duration: 0.6,
            stagger: 0.1
        }, "-=0.2");

        // 4. Draw GreenLoop connection lines smoothly
        greenloopConnectors.forEach((path, idx) => {
            uspTL.to(path, {
                strokeDashoffset: 0,
                duration: 0.6,
                ease: "sine.inOut"
            }, `-=${0.5 - idx * 0.1}`);
        });

        uspTL.call(() => {
            startBackgroundParticles();
            startPulseCycle();
            attachNodeHoverEffects();
        });

        // 2. Background Drift Particle effect (5-10 particles drifting slowly in background)
        function startBackgroundParticles() {
            if (prefersReducedMotion) return;
            const particles = slideUsp.querySelectorAll('.usp-particle');
            particles.forEach((p, idx) => {
                gsap.to(p, {
                    x: () => (Math.random() - 0.5) * 30,
                    y: () => (Math.random() - 0.5) * 30,
                    opacity: () => 0.2 + Math.random() * 0.5,
                    duration: 4 + Math.random() * 4,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });
        }

        // 3. Recurring Pulse timeline loop (Thin green line travel + active pulses)
        function startPulseCycle() {
            if (prefersReducedMotion) return;
            
            const cycle = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
            
            const p1 = slideUsp.querySelector('.pulse-1');
            const p2 = slideUsp.querySelector('.pulse-2');
            const p3 = slideUsp.querySelector('.pulse-3');
            const p4 = slideUsp.querySelector('.pulse-4');
            
            const nDeposit = slideUsp.querySelector('.node-deposit');
            const nScan = slideUsp.querySelector('.node-scan');
            const nVerify = slideUsp.querySelector('.node-verify');
            const nCrush = slideUsp.querySelector('.node-crush');
            const nReward = slideUsp.querySelector('.node-reward');

            const rDeposit = nDeposit.querySelector('rect');
            const rScan = nScan.querySelector('rect');
            const rVerify = nVerify.querySelector('rect');
            const rCrush = nCrush.querySelector('rect');
            const rReward = nReward.querySelector('rect');
            
            const checkPet = slideUsp.querySelector('.check-pet');
            const checkLabel = slideUsp.querySelector('.check-label');
            const checkWeight = slideUsp.querySelector('.check-weight');
            const checkVerified = slideUsp.querySelector('.check-verified');

            // Reset callback
            cycle.add(() => {
                gsap.set([rDeposit, rScan, rVerify, rCrush, rReward], { stroke: "rgba(92, 191, 67, 0.25)", filter: "none" });
                gsap.set([nDeposit, nScan, nVerify, nCrush, nReward], { scale: 1.0 });
                gsap.set([p1, p2, p3, p4], { opacity: 0, strokeDashoffset: 18 });
                gsap.set(scanLine, { opacity: 0, y: -44 });
                gsap.set(scanChecklist, { opacity: 0, y: 5 });
                gsap.set([checkPet, checkLabel, checkWeight], { opacity: 0, fill: "#8E8E93" });
                if (checkVerified) {
                    checkVerified.textContent = "WAITING";
                    gsap.set(checkVerified, { fill: "#8E8E93" });
                }
                if (rewardText) rewardText.textContent = "+0 PTS";
                gsap.set(pulseRing, { opacity: 0, attr: { r: 58 } });
            });

            // Node 1: Deposit active state pulse
            cycle.to(nDeposit, { scale: 1.02, duration: 0.2, ease: "power2.out" })
            .to(rDeposit, {
                stroke: "#5CBF43",
                filter: "drop-shadow(0 0 8px rgba(92, 191, 67, 0.4))",
                duration: 0.2
            }, "<")
            .to(nDeposit, { scale: 1.0, duration: 0.2, ease: "power2.in" })
            .to(rDeposit, { stroke: "rgba(92, 191, 67, 0.25)", filter: "none", duration: 0.2 }, "<")
            
            // Pulse 1 travels
            .set(p1, { opacity: 1 }, "+=0.05")
            .to(p1, { strokeDashoffset: 0, duration: 0.5, ease: "sine.inOut" })
            .set(p1, { opacity: 0 })
            
            // Node 2: Scan active state pulse & scan animation
            .to(nScan, { scale: 1.02, duration: 0.2, ease: "power2.out" })
            .to(rScan, {
                stroke: "#5CBF43",
                filter: "drop-shadow(0 0 8px rgba(92, 191, 67, 0.4))",
                duration: 0.2
            }, "<")
            .set(scanLine, { opacity: 1 }, "<")
            .to(scanLine, { y: 44, duration: 0.8, ease: "power1.inOut" })
            .set(scanLine, { opacity: 0 })
            .to(scanChecklist, { opacity: 1, y: 0, duration: 0.3 })
            .to(checkPet, { opacity: 1, fill: "#5CBF43", duration: 0.2 })
            .to(checkLabel, { opacity: 1, fill: "#5CBF43", duration: 0.2 }, "+=0.05")
            .to(checkWeight, { opacity: 1, fill: "#5CBF43", duration: 0.2 }, "+=0.05")
            .add(() => {
                if (checkVerified) {
                    checkVerified.textContent = "VERIFIED ✓";
                    gsap.set(checkVerified, { fill: "#5CBF43" });
                }
            }, "+=0.05")
            .to(nScan, { scale: 1.0, duration: 0.2, ease: "power2.in" })
            .to(rScan, { stroke: "rgba(92, 191, 67, 0.25)", filter: "none", duration: 0.2 }, "<")
            
            // Pulse 2 travels
            .set(p2, { opacity: 1 }, "+=0.1")
            .to(p2, { strokeDashoffset: 0, duration: 0.5, ease: "sine.inOut" })
            .set(p2, { opacity: 0 })

            // Node 3: Verification active state pulse
            .to(nVerify, { scale: 1.02, duration: 0.2, ease: "power2.out" })
            .to(rVerify, {
                stroke: "#5CBF43",
                filter: "drop-shadow(0 0 8px rgba(92, 191, 67, 0.4))",
                duration: 0.2
            }, "<")
            .to(nVerify, { scale: 1.0, duration: 0.2, ease: "power2.in" })
            .to(rVerify, { stroke: "rgba(92, 191, 67, 0.25)", filter: "none", duration: 0.2 }, "<")
            
            // Pulse 3 travels
            .set(p3, { opacity: 1 }, "+=0.1")
            .to(p3, { strokeDashoffset: 0, duration: 0.5, ease: "sine.inOut" })
            .set(p3, { opacity: 0 })

            // Node 4: Crusher active state pulse & gears turn
            .to(nCrush, { scale: 1.02, duration: 0.2, ease: "power2.out" })
            .to(rCrush, {
                stroke: "#5CBF43",
                filter: "drop-shadow(0 0 8px rgba(92, 191, 67, 0.4))",
                duration: 0.2
            }, "<")
            .to(crushGear, { rotation: 180, duration: 0.6, ease: "power2.inOut" }, "<")
            .to(nCrush, { scale: 1.0, duration: 0.2, ease: "power2.in" })
            .to(rCrush, { stroke: "rgba(92, 191, 67, 0.25)", filter: "none", duration: 0.2 }, "<")
            
            // Pulse 4 travels
            .set(p4, { opacity: 1 }, "+=0.1")
            .to(p4, { strokeDashoffset: 0, duration: 0.5, ease: "sine.inOut" })
            .set(p4, { opacity: 0 })

            // Node 5: Reward active state pulse & smooth count up & brighter glow
            .to(nReward, { scale: 1.03, duration: 0.25, ease: "power2.out" })
            .to(rReward, {
                stroke: "#5CBF43",
                filter: "drop-shadow(0 0 12px rgba(92, 191, 67, 0.65))", // Glows brighter
                duration: 0.25
            }, "<");

            const pointsObj = { val: 0 };
            cycle.to(pointsObj, {
                val: 350,
                duration: 0.8,
                ease: "power1.out",
                onUpdate: () => {
                    if (rewardText) {
                        rewardText.textContent = `+${Math.round(pointsObj.val)} PTS`;
                    }
                }
            }, "<");

            cycle.set(pulseRing, { opacity: 0.8, attr: { r: 58 } }, "<")
            .to(pulseRing, {
                attr: { r: 88 },
                opacity: 0,
                duration: 0.7,
                ease: "power2.out"
            }, "<")
            .to(nReward, { scale: 1.0, duration: 0.25, ease: "power2.in" })
            .to(rReward, { stroke: "rgba(92, 191, 67, 0.25)", filter: "none", duration: 0.25 }, "<");
        }

        // 4. Node Hover Micro-interactions (Lift by 5px + slightly increase glow)
        function attachNodeHoverEffects() {
            const allNodes = slideUsp.querySelectorAll('.usp-node');
            allNodes.forEach(node => {
                const isTraditional = node.classList.contains('node-traditional');
                
                node.addEventListener('mouseenter', () => {
                    if (isTraditional) {
                        gsap.to(node, {
                            y: 115, // lift by 5px
                            duration: 0.3,
                            overwrite: "auto"
                        });
                        gsap.to(node.querySelector('rect'), {
                            stroke: "#A1A1A6",
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.05))",
                            duration: 0.3,
                            overwrite: "auto"
                        });
                        if (node.classList.contains('node-no-reward')) {
                            gsap.to(node.querySelector('rect'), {
                                stroke: "#FF3B30",
                                fill: "#FFF0F0",
                                filter: "drop-shadow(0 4px 8px rgba(255, 59, 48, 0.15))",
                                duration: 0.3,
                                overwrite: "auto"
                            });
                        }
                    } else {
                        gsap.to(node, {
                            y: 340, // lift by 5px
                            duration: 0.3,
                            overwrite: "auto"
                        });
                        gsap.to(node.querySelector('rect'), {
                            stroke: "#5CBF43",
                            filter: "drop-shadow(0 4px 10px rgba(92, 191, 67, 0.25))", // soft border glow
                            duration: 0.3,
                            overwrite: "auto"
                        });
                        
                        if (node.classList.contains('node-deposit')) highlightLink('.link-1');
                        else if (node.classList.contains('node-scan')) highlightLink('.link-1, .link-2');
                        else if (node.classList.contains('node-verify')) highlightLink('.link-2, .link-3');
                        else if (node.classList.contains('node-crush')) highlightLink('.link-3, .link-4');
                        else if (node.classList.contains('node-reward')) highlightLink('.link-4');
                    }
                });
                
                node.addEventListener('mouseleave', () => {
                    if (isTraditional) {
                        gsap.to(node, {
                            y: 120,
                            duration: 0.3,
                            overwrite: "auto"
                        });
                        gsap.to(node.querySelector('rect'), {
                            stroke: "#E5E7EB",
                            filter: "none",
                            duration: 0.3,
                            overwrite: "auto"
                        });
                        if (node.classList.contains('node-no-reward')) {
                            gsap.to(node.querySelector('rect'), {
                                stroke: "#FF5C5C",
                                fill: "#FFF5F5",
                                duration: 0.3,
                                overwrite: "auto"
                            });
                        }
                    } else {
                        gsap.to(node, {
                            y: 345,
                            duration: 0.3,
                            overwrite: "auto"
                        });
                        gsap.to(node.querySelector('rect'), {
                            stroke: "rgba(92, 191, 67, 0.25)",
                            filter: "none",
                            duration: 0.3,
                            overwrite: "auto"
                        });
                        resetLinks();
                    }
                });
            });
        }

        function highlightLink(selector) {
            slideUsp.querySelectorAll(selector).forEach(link => {
                gsap.to(link, {
                    stroke: "#5CBF43",
                    strokeWidth: 3,
                    duration: 0.3
                });
            });
        }

        function resetLinks() {
            slideUsp.querySelectorAll('.flow-path').forEach(link => {
                gsap.to(link, {
                    stroke: "rgba(92, 191, 67, 0.18)",
                    strokeWidth: 2,
                    duration: 0.3
                });
            });
        }
    }

    // 8. Portal Directory Grid Cards Reveal (3D Rotation flip-down)
    const dirGrid = document.querySelector('.directory-grid-13');
    if (dirGrid) {
        gsap.timeline({
            scrollTrigger: {
                trigger: dirGrid,
                start: "top 82%",
                once: true
            }
        })
        .fromTo(dirGrid, { opacity: 0, y: anim.ySmall }, { opacity: 1, y: 0, duration: 1.0 })
        .fromTo('.directory-card', 
            { rotationX: -15, transformOrigin: "top center", scale: 0.95, opacity: 0 },
            { rotationX: 0, scale: 1, opacity: 1, duration: 1.2, stagger: 0.12, ease: "power3.out" }
        , "-=0.6");
    }

    // 9. Stat Cards Count-up Numbers (Primary Ratio, Exchange Value, Carbon Offset)
    const metricRow = document.querySelector('.metric-row');
    if (metricRow) {
        const cards = gsap.utils.toArray('.metric-card');
        const metricTL = gsap.timeline({
            scrollTrigger: {
                trigger: metricRow,
                start: "top 82%",
                once: true
            }
        });

        metricTL.fromTo(metricRow, { opacity: 0, y: anim.ySmall }, { opacity: 1, y: 0, duration: 1.0 })
                .fromTo(cards, 
                    { rotationX: -15, transformOrigin: "top center", scale: 0.95, opacity: 0 },
                    { rotationX: 0, scale: 1, opacity: 1, duration: 1.4, stagger: 0.18, ease: "power3.out" }
                , "-=0.6");

        cards.forEach((card) => {
            const valEl = card.querySelector('.metric-val');
            const lblEl = card.querySelector('.metric-lbl');
            const descEl = card.querySelector('.metric-desc');

            metricTL.from(lblEl, { opacity: 0, y: -5, duration: 0.6 }, "<0.2");

            const text = valEl.innerText.trim();
            let num = 0;
            let prefix = "";
            let suffix = "";
            let decimals = 0;

            if (text.includes("Pts")) {
                num = parseInt(text.replace("Pts", ""));
                suffix = " Pts";
                valEl.innerText = "0 Pts";
            } else if (text.includes("Rs.")) {
                num = parseInt(text.replace("Rs.", ""));
                prefix = "Rs. ";
                valEl.innerText = "Rs. 0";
            } else if (text.includes("kg")) {
                num = parseFloat(text.replace("kg", ""));
                suffix = " kg";
                decimals = 2;
                valEl.innerText = "0.00 kg";
            }

            const counterObj = { val: 0 };
            metricTL.to(counterObj, {
                val: num,
                duration: 2.2, // Slower count-up
                ease: "power2.out",
                onUpdate: () => {
                    valEl.innerText = prefix + counterObj.val.toFixed(decimals) + suffix;
                }
            }, "<");

            metricTL.from(descEl, { opacity: 0, duration: 0.6 }, "<0.8");
        });
    }

    // 10. Data Tables Staggered Rows Reveal (3D index card layout)
    document.querySelectorAll('.strategy-table-wrapper').forEach(wrapper => {
        const table = wrapper.querySelector('.strategy-table');
        const header = table.querySelector('thead tr');
        const rows = table.querySelectorAll('tbody tr');
        
        const tableTL = gsap.timeline({
            scrollTrigger: {
                trigger: wrapper,
                start: "top 82%",
                once: true
            }
        });

        tableTL.fromTo(wrapper, { opacity: 0, y: anim.ySmall }, { opacity: 1, y: 0, duration: 1.0 });

        if (header) {
            tableTL.from(header, {
                opacity: 0,
                y: 8,
                duration: 0.7,
                ease: anim.ease
            }, "-=0.5");
        }

        if (rows.length > 0) {
            tableTL.fromTo(rows, 
                { opacity: 0, rotationX: -10, transformOrigin: "top center", x: -8 },
                { opacity: 1, rotationX: 0, x: 0, duration: 1.2, stagger: 0.15, ease: anim.ease }
            , "-=0.3");
        }

        // If this is the competitor slide, also animate the insight card and badges
        const section = wrapper.closest('#slide-competitors');
        if (section) {
            const insightCard = section.querySelector('.competitor-insight-card');
            const badges = section.querySelectorAll('.comp-badge');
            
            // Set initial state
            gsap.set(insightCard, { y: anim.ySmall, opacity: 0 });
            
            if (badges.length > 0) {
                if (prefersReducedMotion) {
                    gsap.set(badges, { opacity: 0 });
                    tableTL.to(badges, {
                        opacity: 1,
                        duration: 0.4,
                        stagger: 0.01,
                        ease: anim.ease
                    }, "-=0.6");
                } else {
                    gsap.set(badges, { scale: 0.8, opacity: 0 });
                    tableTL.to(badges, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.4,
                        stagger: 0.01,
                        ease: "back.out(1.5)"
                    }, "-=0.6");
                }
            }
            
            tableTL.to(insightCard, {
                y: 0,
                opacity: 1,
                duration: 1.0,
                ease: anim.ease
            }, "-=0.4");
        }
    });

    // 11. Shopper Journey Path & Tracer Animation
    const journeyFlow = document.querySelector('.journey-flow');
    if (journeyFlow) {
        const journeySteps = gsap.utils.toArray('.journey-step');

        // Set initial state of steps: circles and text muted
        gsap.set(journeySteps, { opacity: 0.25 });
        journeySteps.forEach(step => {
            const num = step.querySelector('.journey-step-num');
            if (num) gsap.set(num, { scale: 1 });
            const title = step.querySelector('h4');
            const desc = step.querySelector('p');
            if (title) gsap.set(title, { y: 10, opacity: 0 });
            if (desc) gsap.set(desc, { y: 10, opacity: 0 });
        });

        // We create a ScrollTrigger that runs the animation timeline
        const journeyTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: journeyFlow,
                start: "top 80%",
                once: true,
                onEnter: () => {
                    // Perform calculations on enter to get absolute coordinates after layouts settle
                    const flowRect = journeyFlow.getBoundingClientRect();
                    const stepPositions = journeySteps.map(step => {
                        const circle = step.querySelector('.journey-step-num');
                        const circleRect = circle.getBoundingClientRect();
                        const circleCenter = (circleRect.left + circleRect.width / 2) - flowRect.left;
                        return (circleCenter / flowRect.width) * 100;
                    });

                    const startPct = stepPositions[0];
                    const endPct = stepPositions[4];

                    // Position the background progress dashed line
                    gsap.set('.journey-progress-bg', { left: `${startPct}%`, width: `${endPct - startPct}%` });
                    // Set fill line initial position (collapsed at start circle center)
                    gsap.set('.journey-progress-fill', { left: `${startPct}%`, width: '0%' });
                    // Set dot initial position
                    gsap.set('.journey-progress-dot', { left: `${startPct}%` });

                    // Build the animation timeline dynamically
                    const segDur = 1.0; // Segment duration
                    const easeType = "power2.inOut";

                    // Step 1 active state
                    journeyTimeline.add(() => activateStep(0));

                    // Step 2
                    journeyTimeline
                        .to('.journey-progress-dot', { left: `${stepPositions[1]}%`, duration: segDur, ease: easeType })
                        .to('.journey-progress-fill', { width: `${stepPositions[1] - stepPositions[0]}%`, duration: segDur, ease: easeType }, '<')
                        .add(() => activateStep(1));

                    // Step 3
                    journeyTimeline
                        .to('.journey-progress-dot', { left: `${stepPositions[2]}%`, duration: segDur, ease: easeType })
                        .to('.journey-progress-fill', { width: `${stepPositions[2] - stepPositions[0]}%`, duration: segDur, ease: easeType }, '<')
                        .add(() => activateStep(2));

                    // Step 4
                    journeyTimeline
                        .to('.journey-progress-dot', { left: `${stepPositions[3]}%`, duration: segDur, ease: easeType })
                        .to('.journey-progress-fill', { width: `${stepPositions[3] - stepPositions[0]}%`, duration: segDur, ease: easeType }, '<')
                        .add(() => activateStep(3));

                    // Step 5
                    journeyTimeline
                        .to('.journey-progress-dot', { left: `${stepPositions[4]}%`, duration: segDur, ease: easeType })
                        .to('.journey-progress-fill', { width: `${stepPositions[4] - stepPositions[0]}%`, duration: segDur, ease: easeType }, '<')
                        .add(() => activateStep(4));
                }
            }
        });

        function activateStep(index) {
            const step = journeySteps[index];
            if (!step) return;

            // Highlight the step container
            gsap.to(step, { opacity: 1, duration: 0.4 });

            // Circle bounce animation
            const num = step.querySelector('.journey-step-num');
            if (num) {
                num.classList.add('active');
                gsap.fromTo(num, 
                    { scale: 1 }, 
                    { scale: 1.25, duration: 0.4, ease: "back.out(1.7)", onComplete: () => {
                        gsap.to(num, { scale: 1.08, duration: 0.2 });
                    }}
                );
            }

            // Animate step texts sliding up and fading in
            const title = step.querySelector('h4');
            const desc = step.querySelector('p');
            const stepTimeline = gsap.timeline();
            if (title) {
                stepTimeline.to(title, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
            }
            if (desc) {
                stepTimeline.to(desc, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.35");
            }
        }
    }

    // 12. Dot Navigation Clicks (Smooth Scroll Scroll-to Section)
    dotLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                lenis.scrollTo(targetEl, {
                    offset: 0,
                    duration: 0.8,
                    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // Premium ease-in-out curve
                });
            }
        });
    });

    // 13. Hero CTA Button click Smooth Scroll
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const targetEl = document.querySelector('#slide-overview');
            if (targetEl) {
                lenis.scrollTo(targetEl, {
                    offset: 0,
                    duration: 0.8
                });
            }
        });
    }


    // 14. Horizontal Scroll Pinning & Middle Highlight
    const track = document.querySelector('.horizontal-track');
    const headerSticky = document.querySelector('.horizontal-header-sticky');
    const scrollContainer = document.querySelector('.horizontal-scroll-container');
    
    if (track && headerSticky) {
        let isAnimatingCard = false;
        let currentCardIndex = 0;
        const cards = document.querySelectorAll('.horizontal-card');
        const mm = gsap.matchMedia();

        // Desktop: Pin & scrub, with smooth snapping and exact scroll bounds
        mm.add("(min-width: 993px)", () => {
            gsap.to(track, {
                x: () => {
                    const totalMove = track.scrollWidth - window.innerWidth;
                    return -totalMove;
                },
                ease: 'none',
                scrollTrigger: {
                    id: 'applications-trigger',
                    trigger: '#slide-applications',
                    pin: true,
                    scrub: true,
                    snap: {
                        snapTo: 1 / (cards.length - 1),
                        duration: { min: 0.2, max: 0.4 },
                        delay: 0.05,
                        ease: "power2.inOut"
                    },
                    start: 'top top',
                    end: () => `+=${track.scrollWidth - window.innerWidth}`, // Removed dead scroll space
                    invalidateOnRefresh: true,
                    onUpdate: () => {
                        updateHighlightedCard();
                    },
                    onRefresh: () => {
                        updateHighlightedCard();
                    }
                }
            });
            updateHighlightedCard();
        });

        // Mobile/Tablet: No pinning/translating in ScrollTrigger.
        // Handled via native CSS scroll-snap. Just add an observer/scroll listener.
        mm.add("(max-width: 992px)", () => {
            if (scrollContainer) {
                scrollContainer.addEventListener('scroll', () => {
                    updateHighlightedCardMobile();
                }, { passive: true });
                updateHighlightedCardMobile();
            }
        });

        // Function to update highlighted card on desktop (middle of screen)
        function updateHighlightedCard() {
            const viewportCenter = window.innerWidth / 2;
            
            let closestCard = null;
            let minDistance = Infinity;
            let closestIdx = 0;
            
            cards.forEach((card, idx) => {
                const rect = card.getBoundingClientRect();
                const cardCenter = rect.left + rect.width / 2;
                const distance = Math.abs(cardCenter - viewportCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                    closestIdx = idx;
                }
            });
            
            cards.forEach((card, idx) => {
                if (idx === closestIdx) {
                    card.classList.add('highlighted');
                } else {
                    card.classList.remove('highlighted');
                }
            });

            if (!isAnimatingCard) {
                currentCardIndex = closestIdx;
            }
        }

        // Function to update highlighted card on mobile (scrollContainer center)
        function updateHighlightedCardMobile() {
            if (!scrollContainer) return;
            const containerCenter = scrollContainer.scrollLeft + scrollContainer.clientWidth / 2;
            
            let closestIdx = 0;
            let minDistance = Infinity;
            
            cards.forEach((card, idx) => {
                const cardCenter = card.offsetLeft + card.clientWidth / 2;
                const distance = Math.abs(cardCenter - containerCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIdx = idx;
                }
            });
            
            cards.forEach((card, idx) => {
                if (idx === closestIdx) {
                    card.classList.add('highlighted');
                } else {
                    card.classList.remove('highlighted');
                }
            });
            
            currentCardIndex = closestIdx;
        }



        // Card-by-Card Wheel Scroll Hijack for Desktop
        window.addEventListener('wheel', (e) => {
            if (window.innerWidth <= 992) return; // Only hijack on desktop

            const st = ScrollTrigger.getById('applications-trigger');
            if (!st) return;

            const scrollY = window.scrollY;
            const isActive = scrollY >= (st.start - 10) && scrollY <= (st.end + 10);
            if (!isActive) return;

            if (isAnimatingCard) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.deltaY > 0) {
                // Scroll down: move to next card
                if (currentCardIndex < cards.length - 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    isAnimatingCard = true;
                    currentCardIndex++;
                    const targetScroll = st.start + (currentCardIndex / (cards.length - 1)) * (st.end - st.start);
                    
                    const unlockTimeout = setTimeout(() => {
                        isAnimatingCard = false;
                    }, 750);

                    lenis.scrollTo(targetScroll, {
                        duration: 0.35,
                        force: true,
                        onComplete: () => {
                            setTimeout(() => {
                                clearTimeout(unlockTimeout);
                                isAnimatingCard = false;
                            }, 250);
                        }
                    });
                }
            } else if (e.deltaY < 0) {
                // Scroll up: move to previous card
                if (currentCardIndex > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    isAnimatingCard = true;
                    currentCardIndex--;
                    const targetScroll = st.start + (currentCardIndex / (cards.length - 1)) * (st.end - st.start);
                    
                    const unlockTimeout = setTimeout(() => {
                        isAnimatingCard = false;
                    }, 750);

                    lenis.scrollTo(targetScroll, {
                        duration: 0.35,
                        force: true,
                        onComplete: () => {
                            setTimeout(() => {
                                clearTimeout(unlockTimeout);
                                isAnimatingCard = false;
                            }, 250);
                        }
                    });
                }
            }
        }, { passive: false });
    }

        // 15. Window resize handler to maintain frame positioning
    window.addEventListener('resize', () => {
        const activeDot = document.querySelector('.dot-link.active');
        if (activeDot) {
            const targetId = activeDot.getAttribute('href');
            const activeSlide = document.querySelector(targetId);
            if (activeSlide) {
                updateSharedElements(activeSlide, true);
            }
        }
    });

    // ── 16. Lightbox — Full Rebuild ───────────────────────────────────────────
    const initLightbox = () => {

        /* ── DOM construction ───────────────────────────────────────────────── */
        const lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Image Preview');

        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close Preview');

        const content = document.createElement('div');
        content.className = 'lightbox-content';

        // Fullscreen Navigation Arrows
        const arrowPrev = document.createElement('button');
        arrowPrev.className = 'lightbox-nav-arrow arrow-prev';
        arrowPrev.innerHTML = '&#10094;';
        arrowPrev.setAttribute('aria-label', 'Previous image');

        const arrowNext = document.createElement('button');
        arrowNext.className = 'lightbox-nav-arrow arrow-next';
        arrowNext.innerHTML = '&#10095;';
        arrowNext.setAttribute('aria-label', 'Next image');

        const zoomControls = document.createElement('div');
        zoomControls.className = 'lightbox-zoom-controls';

        const btnMinus = document.createElement('button');
        btnMinus.className = 'zoom-btn btn-minus';
        btnMinus.textContent = '-';
        btnMinus.setAttribute('aria-label', 'Zoom Out');

        const zoomLabel = document.createElement('span');
        zoomLabel.className = 'zoom-label';
        zoomLabel.textContent = '100%';

        const btnPlus = document.createElement('button');
        btnPlus.className = 'zoom-btn btn-plus';
        btnPlus.textContent = '+';
        btnPlus.setAttribute('aria-label', 'Zoom In');

        const btnReset = document.createElement('button');
        btnReset.className = 'zoom-btn btn-reset';
        btnReset.innerHTML = '&#x21BB;';
        btnReset.setAttribute('aria-label', 'Reset Zoom');

        zoomControls.append(btnMinus, zoomLabel, btnPlus, btnReset);
        lightbox.append(closeBtn, arrowPrev, arrowNext, content, zoomControls);
        document.body.appendChild(lightbox);

        /* ── State ──────────────────────────────────────────────────────────── */
        const MIN_SCALE = 0.5;
        const MAX_SCALE = 5;
        let scale     = 1;
        let panX      = 0;
        let panY      = 0;
        let isDragging     = false;
        let dragStartX     = 0;
        let dragStartY     = 0;
        let touchStartDist  = 0;
        let touchStartScale = 1;
        let touchStartPanX  = 0;
        let touchStartPanY  = 0;
        let resizeRAF       = null;

        // Gallery navigation track references
        let activeGalleryList = [];
        let activeGalleryIndex = -1;

        /* ── Helpers ────────────────────────────────────────────────────────── */
        const getEl = () => content.querySelector('img, svg');

        /** Clamp pan so the image cannot be dragged completely off-screen */
        const clampPan = () => {
            const el = getEl();
            if (!el || scale <= 1) { panX = 0; panY = 0; return; }
            const r = el.getBoundingClientRect();
            // how far the scaled image extends beyond the viewport centre
            const maxX = Math.max(0, (r.width  / 2) - 20);
            const maxY = Math.max(0, (r.height / 2) - 20);
            panX = Math.max(-maxX, Math.min(panX, maxX));
            panY = Math.max(-maxY, Math.min(panY, maxY));
        };

        /** Guard: ensure a number is safe (not 0, NaN, ±Infinity, negative) */
        const safeScale = (v) => {
            if (!Number.isFinite(v) || Number.isNaN(v) || v <= 0) return 1;
            return Math.max(MIN_SCALE, Math.min(v, MAX_SCALE));
        };

        /** Update the CSS transform on the element */
        const applyTransform = (instant = false) => {
            const el = getEl();
            if (!el) return;
            el.style.transition = instant ? 'none' : 'transform 160ms ease-out';
            el.style.transform  = `translate(${panX}px, ${panY}px) scale(${scale})`;
            zoomLabel.textContent = Math.round(scale * 100) + '%';
            // cursor hint
            content.classList.toggle('can-drag', scale > 1);
        };

        /** Full reset — called every time the lightbox opens */
        const resetState = () => {
            scale = 1; panX = 0; panY = 0;
            isDragging = false;
            const el = getEl();
            if (el) { el.style.transition = 'none'; el.style.transform = ''; }
            zoomLabel.textContent = '100%';
            content.classList.remove('can-drag', 'dragging');
        };

        /** Step zoom (buttons) — centred, animated */
        const stepZoom = (factor) => {
            scale = safeScale(scale * factor);
            clampPan();
            applyTransform(false);
        };

        /** Zoom anchored to a viewport point (for wheel / pinch) — instant */
        const anchoredZoom = (factor, cx, cy) => {
            const el = getEl();
            if (!el) return;
            const prev = scale;
            scale = safeScale(scale * factor);
            if (scale !== prev && scale > 1 && cx !== undefined) {
                const r = el.getBoundingClientRect();
                const ox = cx - (r.left + r.width  / 2);
                const oy = cy - (r.top  + r.height / 2);
                panX -= ox * (scale / prev - 1);
                panY -= oy * (scale / prev - 1);
            }
            if (scale === 1) { panX = 0; panY = 0; }
            clampPan();
            applyTransform(true); // instant during wheel/drag
        };

        /* ── Safe image-load measurement ────────────────────────────────────── */
        const applyImageFit = (img) => {
            const nw = img.naturalWidth;
            const nh = img.naturalHeight;

            if (!nw || !nh) {
                if (!nw) console.warn('[Lightbox] naturalWidth is 0 — using CSS fallback.');
                if (!nh) console.warn('[Lightbox] naturalHeight is 0 — using CSS fallback.');
                img.style.maxWidth  = '95vw';
                img.style.maxHeight = '95vh';
                img.style.objectFit = 'contain';
                return;
            }

            const computed = Math.min(
                (window.innerWidth  * 0.95) / nw,
                (window.innerHeight * 0.95) / nh
            );

            if (Number.isNaN(computed))    { console.warn('[Lightbox] scale is NaN — using CSS fallback.');      return; }
            if (!Number.isFinite(computed)){ console.warn('[Lightbox] scale is Infinity — using CSS fallback.'); return; }

            img.style.transform = '';
        };

        /* ── Clone & open ───────────────────────────────────────────────────── */
        const openLightbox = (source) => {
            content.innerHTML = '';
            resetState();

            // Setup active gallery context list
            const currentSection = source.closest('section');
            if (currentSection) {
                activeGalleryList = Array.from(currentSection.querySelectorAll(zoomableSelector));
                activeGalleryIndex = activeGalleryList.indexOf(source);
            } else {
                activeGalleryList = [source];
                activeGalleryIndex = 0;
            }

            updateNavArrowsState();

            // Extract the img or svg from the clicked element
            let clone;
            const tag = source.tagName.toLowerCase();

            if (tag === 'img') {
                clone = source.cloneNode(true);
            } else if (tag === 'svg') {
                clone = source.cloneNode(true);
            } else {
                // container: find child img or svg
                const childImg = source.querySelector('img');
                const childSvg = source.querySelector('svg');
                clone = childImg ? childImg.cloneNode(true)
                      : childSvg ? childSvg.cloneNode(true)
                      : null;
            }

            if (!clone) return;

            // Clear every inline size override so CSS is authoritative
            ['width','height','maxWidth','maxHeight','objectFit',
             'transform','transformOrigin'].forEach(p => { clone.style[p] = ''; });

            content.appendChild(clone);

            // Lock page scroll
            document.body.style.overflow = 'hidden';

            // For raster images: wait for decode before measuring
            if (clone.tagName.toLowerCase() === 'img') {
                if (clone.complete && clone.naturalWidth > 0) {
                    applyImageFit(clone);
                } else {
                    clone.onload  = () => applyImageFit(clone);
                    clone.onerror = () => {
                        console.warn('[Lightbox] Image failed to load — CSS fallback applied.');
                        clone.style.maxWidth  = '95vw';
                        clone.style.maxHeight = '95vh';
                        clone.style.objectFit = 'contain';
                    };
                }
            }

            // Show & animate in
            lightbox.classList.add('active');
            gsap.fromTo(lightbox,
                { opacity: 0 },
                { opacity: 1, duration: 0.28, ease: 'power2.out' }
            );
            gsap.fromTo(content,
                { scale: 0.92, opacity: 0 },
                { scale: 1,    opacity: 1, duration: 0.38, ease: 'back.out(1.4)' }
            );

            // Replay SVG animations
            if (clone.tagName.toLowerCase() === 'svg') {
                restartSvgAnimations(clone);
                animateClonedDiagram(clone);
            }
        };

        const updateNavArrowsState = () => {
            if (activeGalleryList.length <= 1) {
                arrowPrev.style.display = 'none';
                arrowNext.style.display = 'none';
            } else {
                arrowPrev.style.display = 'flex';
                arrowNext.style.display = 'flex';
                arrowPrev.style.opacity = activeGalleryIndex === 0 ? '0.3' : '1';
                arrowPrev.style.pointerEvents = activeGalleryIndex === 0 ? 'none' : 'auto';
                arrowNext.style.opacity = activeGalleryIndex === activeGalleryList.length - 1 ? '0.3' : '1';
                arrowNext.style.pointerEvents = activeGalleryIndex === activeGalleryList.length - 1 ? 'none' : 'auto';
            }
        };

        const navigateLightbox = (direction) => {
            const nextIdx = activeGalleryIndex + direction;
            if (nextIdx >= 0 && nextIdx < activeGalleryList.length) {
                const targetSrc = activeGalleryList[nextIdx];
                gsap.to(content, {
                    scale: 0.95,
                    opacity: 0,
                    duration: 0.15,
                    ease: 'power2.in',
                    onComplete: () => {
                        openLightbox(targetSrc);
                    }
                });
            }
        };

        /* ── SVG animation restart ───────────────────────────────────────────── */
        const restartSvgAnimations = (svgEl) => {
            try {
                const anims = svgEl.querySelectorAll('animate, animateTransform, animateMotion, set');
                anims.forEach(a => { a.beginElement?.(); });
            } catch(_) {}
            svgEl.querySelectorAll('*').forEach(el => {
                const style = el.style;
                if (style.animationName) {
                    const name = style.animationName;
                    style.animationName = 'none';
                    requestAnimationFrame(() => { style.animationName = name; });
                }
            });
        };

        /* ── Close ──────────────────────────────────────────────────────────── */
        const closeLightbox = () => {
            gsap.to([content, lightbox], {
                opacity: 0, scale: 0.92,
                duration: 0.26,
                ease: 'power2.in',
                onComplete: () => {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = '';
                    content.innerHTML = '';
                    gsap.set([content, lightbox], { clearProps: 'all' });
                    resetState();
                }
            });
        };

        /* ── Mouse wheel zoom ───────────────────────────────────────────────── */
        content.addEventListener('wheel', (e) => {
            e.preventDefault();
            anchoredZoom(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY);
        }, { passive: false });

        /* ── Double-click: fit ↔ 100% ───────────────────────────────────────── */
        content.addEventListener('dblclick', (e) => {
            if (scale !== 1) { scale = 1; panX = 0; panY = 0; applyTransform(false); return; }
            const el = getEl();
            if (!el) return;
            const nw = el.naturalWidth  || el.viewBox?.baseVal?.width  || 0;
            const dw = el.getBoundingClientRect().width;
            if (!nw || !dw) return;
            scale = safeScale(nw / dw);
            panX = 0; panY = 0;
            applyTransform(false);
        });

        /* ── Mouse drag ─────────────────────────────────────────────────────── */
        content.addEventListener('mousedown', (e) => {
            if (scale <= 1) return;
            isDragging  = true;
            dragStartX  = e.clientX - panX;
            dragStartY  = e.clientY - panY;
            content.classList.add('dragging');
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panX = e.clientX - dragStartX;
            panY = e.clientY - dragStartY;
            clampPan();
            applyTransform(true);
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            content.classList.remove('dragging');
        });

        /* ── Touch: single-finger pan + two-finger pinch ────────────────────── */
        let touchStartClientX = 0;
        content.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isDragging     = false;
                touchStartDist  = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                touchStartScale = scale;
                touchStartPanX  = panX;
                touchStartPanY  = panY;
            } else if (e.touches.length === 1) {
                touchStartClientX = e.touches[0].clientX;
                if (scale > 1) {
                    isDragging = true;
                    dragStartX = e.touches[0].clientX - panX;
                    dragStartY = e.touches[0].clientY - panY;
                }
            }
        }, { passive: true });

        content.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && touchStartDist > 0) {
                const dist   = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                scale = safeScale(touchStartScale * (dist / touchStartDist));
                if (scale === 1) { panX = 0; panY = 0; }
                clampPan();
                applyTransform(true);
            } else if (e.touches.length === 1 && isDragging) {
                panX = e.touches[0].clientX - dragStartX;
                panY = e.touches[0].clientY - dragStartY;
                clampPan();
                applyTransform(true);
            }
        }, { passive: true });

        content.addEventListener('touchend', (e) => {
            if (scale === 1 && touchStartClientX > 0 && e.changedTouches.length === 1) {
                // Swipe navigation in lightbox
                const diffX = e.changedTouches[0].clientX - touchStartClientX;
                if (Math.abs(diffX) > 60) {
                    if (diffX < 0 && activeGalleryIndex < activeGalleryList.length - 1) {
                        navigateLightbox(1);
                    } else if (diffX > 0 && activeGalleryIndex > 0) {
                        navigateLightbox(-1);
                    }
                }
            }
            isDragging    = false;
            touchStartDist = 0;
            touchStartClientX = 0;
            if (scale < 1) { scale = 1; panX = 0; panY = 0; applyTransform(false); }
        }, { passive: true });

        // Nav arrow clicks
        arrowPrev.addEventListener('click', () => navigateLightbox(-1));
        arrowNext.addEventListener('click', () => navigateLightbox(1));

        /* ── Zoom buttons ───────────────────────────────────────────────────── */
        btnPlus.addEventListener('click',  () => stepZoom(1.2));
        btnMinus.addEventListener('click', () => stepZoom(1 / 1.2));
        btnReset.addEventListener('click', () => { scale = 1; panX = 0; panY = 0; applyTransform(false); });

        /* ── Window resize: re-clamp pan ────────────────────────────────────── */
        window.addEventListener('resize', () => {
            cancelAnimationFrame(resizeRAF);
            resizeRAF = requestAnimationFrame(() => {
                clampPan();
                applyTransform(true);
            });
        });

        /* ── Trigger elements (Event Delegation standard) ───────────────────── */
        const zoomableSelector = [
            '.image-container',
            '.image-card',
            '.placeholder-frame:has(svg)',
            '.ecosystem-svg',
            '.usp-svg',
            '.decisions-svg',
            '.behavioral-loop-svg',
            '.floor-plan-svg'
        ].join(', ');

        document.addEventListener('click', (e) => {
            const zoomable = e.target.closest(zoomableSelector);
            if (zoomable) {
                if (zoomable.closest('.lightbox') || e.target.closest('a, button, input')) return;
                openLightbox(zoomable);
            }
        });

        /* ── Close triggers ─────────────────────────────────────────────────── */
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === content || e.target === closeBtn) {
                closeLightbox();
            }
        });
        window.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft' && activeGalleryIndex > 0) {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight' && activeGalleryIndex < activeGalleryList.length - 1) {
                navigateLightbox(1);
            }
        });

    };

    initLightbox();

    // ── 17. Typography Section Custom Animations ─────────────────────────────
    const initTypographyAnimations = () => {
        const typewriter = (element, text, speed, onComplete) => {
            if (!element) return;
            element.innerHTML = '';
            element.style.visibility = 'visible';
            
            let i = 0;
            const cursor = document.createElement('span');
            cursor.className = 'typewriter-cursor';
            cursor.textContent = '|';
            element.appendChild(cursor);
            
            const typeLetter = () => {
                if (i < text.length) {
                    cursor.before(text.charAt(i));
                    i++;
                    setTimeout(typeLetter, speed);
                } else {
                    cursor.style.animation = 'none';
                    gsap.to(cursor, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            cursor.remove();
                            if (onComplete) onComplete();
                        }
                    });
                }
            };
            typeLetter();
        };

        const typeSection = document.querySelector('#slide-type');
        if (!typeSection) return;

        // Hide title text initially
        const titleEl = typeSection.querySelector('#typewriter-main-title');
        if (titleEl) {
            titleEl.style.visibility = 'hidden';
        }

        // Hide headline initially
        const headlineEl = typeSection.querySelector('#typing-usage-headline');
        if (headlineEl) {
            headlineEl.style.visibility = 'hidden';
        }

        ScrollTrigger.create({
            trigger: '#slide-type',
            start: 'top 75%',
            onEnter: () => {
                // 1. Animate main title with typewriter effect
                if (titleEl) {
                    typewriter(titleEl, "Editorial Specimen & Scale Rules", 45, () => {
                        // 2. Animate typeface cards staggered
                        gsap.fromTo('#slide-type .reveal-card', 
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', force3D: true }
                        );
                        
                        // 3. Animate example usage headline
                        if (headlineEl) {
                            setTimeout(() => {
                                typewriter(headlineEl, "Recycle Today For a Better Tomorrow", 35);
                            }, 300);
                        }
                    });
                }
            },
            once: true
        });
    };
    initTypographyAnimations();

    // ── 18. Horizontal Peeking Carousel Photography System & Parallax ──────────
    const initPhotographySystem = () => {
        // Dynamic image data source for easy addition/scalability
        const photographyGallery = [
            { src: 'assets/photo_1.png', alt: 'Photography Art Direction 1 - Creative Lighting' },
            { src: 'assets/photo_2.png', alt: 'Photography Art Direction 2 - Symmetrical Composition' },
            { src: 'assets/photo_3.png', alt: 'Photography Art Direction 3 - Symmetrical Clean Spec' }
        ];

        const container = document.getElementById('greenloop-photo-gallery');
        const dotsContainer = document.getElementById('carousel-dots-indicator');
        const trackWrapper = document.getElementById('carousel-track-wrapper');
        const btnPrev = document.getElementById('carousel-prev');
        const btnNext = document.getElementById('carousel-next');
        
        if (!container || !trackWrapper) return;

        let currentIndex = 0;
        const slideWidth = 320;
        const slideMargin = 28;
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        let dragOffset = 0;

        // Render card nodes dynamically
        container.innerHTML = '';
        if (dotsContainer) dotsContainer.innerHTML = '';

        photographyGallery.forEach((item, index) => {
            // Create Slide Card
            const card = document.createElement('div');
            card.className = 'carousel-slide';
            card.setAttribute('data-index', index);
            
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.loading = 'lazy';
            
            card.appendChild(img);
            container.appendChild(card);

            // Create Pagination Dot
            if (dotsContainer) {
                const dot = document.createElement('div');
                dot.className = 'carousel-dot' + (index === 0 ? ' active-dot' : '');
                dot.setAttribute('data-index', index);
                dot.addEventListener('click', () => {
                    goToSlide(index);
                });
                dotsContainer.appendChild(dot);
            }
        });

        // Add class `.image-card` to selector list to trigger Lightbox via event delegation
        container.querySelectorAll('.carousel-slide').forEach(slide => {
            slide.classList.add('image-card');
        });

        const slides = container.querySelectorAll('.carousel-slide');

        const updateCarouselLayout = (instant = false) => {
            const wrapperWidth = trackWrapper.getBoundingClientRect().width;
            
            // To center the active slide:
            // Center of wrapper = wrapperWidth / 2
            // Center of active slide = slideWidth / 2
            // Offset needed = (wrapperWidth / 2) - (slideWidth / 2)
            const centerOffset = (wrapperWidth / 2) - (slideWidth / 2);
            
            // Theoretical target position for the track without dragging offset
            const targetX = centerOffset - currentIndex * (slideWidth + slideMargin);
            const currentTrackX = targetX + dragOffset;

            // Set track transform
            gsap.to(container, {
                x: currentTrackX,
                duration: instant ? 0 : 0.7,
                ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
                overwrite: 'auto'
            });

            // Set classes for Active, Peeking and regular slides
            slides.forEach((slide, i) => {
                slide.classList.remove('active-slide', 'peeking-slide');
                if (i === currentIndex) {
                    slide.classList.add('active-slide');
                } else if (i === currentIndex + 1) {
                    slide.classList.add('peeking-slide');
                }
            });

            // Update pagination indicators
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.carousel-dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active-dot', idx === currentIndex);
                });
            }
        };

        const goToSlide = (index) => {
            if (index < 0 || index >= photographyGallery.length) return;
            currentIndex = index;
            dragOffset = 0;
            updateCarouselLayout(false);
        };

        // Navigation button hooks
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (currentIndex > 0) goToSlide(currentIndex - 1);
            });
        }
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (currentIndex < photographyGallery.length - 1) goToSlide(currentIndex + 1);
            });
        }

        // Keyboard navigation support
        window.addEventListener('keydown', (e) => {
            // Check if section is visible in viewport
            const rect = trackWrapper.getBoundingClientRect();
            const isVisible = (rect.top < window.innerHeight && rect.bottom > 0);
            if (!isVisible) return;

            if (e.key === 'ArrowLeft') {
                if (currentIndex > 0) goToSlide(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                if (currentIndex < photographyGallery.length - 1) goToSlide(currentIndex + 1);
            }
        });

        // Mousewheel horizontal support
        let wheelTimeout;
        trackWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaX > 20 || e.deltaY > 20) {
                    if (currentIndex < photographyGallery.length - 1) goToSlide(currentIndex + 1);
                } else if (e.deltaX < -20 || e.deltaY < -20) {
                    if (currentIndex > 0) goToSlide(currentIndex - 1);
                }
            }, 50);
        }, { passive: false });

        // Mouse Drag / Touch Swipe momentum positioning
        const startDrag = (clientX) => {
            isDragging = true;
            startX = clientX;
            dragOffset = 0;
            gsap.killTweensOf(container);
        };

        const moveDrag = (clientX) => {
            if (!isDragging) return;
            dragOffset = clientX - startX;
            updateCarouselLayout(true);
        };

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            
            // Determine threshold for slide change (e.g. 80px)
            const threshold = 80;
            if (dragOffset < -threshold && currentIndex < photographyGallery.length - 1) {
                goToSlide(currentIndex + 1);
            } else if (dragOffset > threshold && currentIndex > 0) {
                goToSlide(currentIndex - 1);
            } else {
                goToSlide(currentIndex); // Snap back
            }
        };

        // Mouse event listeners
        trackWrapper.addEventListener('mousedown', (e) => {
            if (e.target.closest('button, .carousel-dot')) return;
            startDrag(e.clientX);
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            moveDrag(e.clientX);
        });
        window.addEventListener('mouseup', () => {
            endDrag();
        });

        // Touch event listeners
        trackWrapper.addEventListener('touchstart', (e) => {
            startDrag(e.touches[0].clientX);
        }, { passive: true });
        trackWrapper.addEventListener('touchmove', (e) => {
            moveDrag(e.touches[0].clientX);
        }, { passive: true });
        trackWrapper.addEventListener('touchend', () => {
            endDrag();
        }, { passive: true });

        // Handle initial layout and window resize updates
        setTimeout(() => updateCarouselLayout(true), 100);
        window.addEventListener('resize', () => updateCarouselLayout(true));

        // 1. Scroll animation trigger: smooth fade-up title/text, staggered images
        ScrollTrigger.create({
            trigger: '#slide-photo',
            start: 'top 75%',
            onEnter: () => {
                // Fade up title and text content
                gsap.fromTo('#slide-photo .section-header, #slide-photo .photo-info-panel, #slide-photo .carousel-container',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12, force3D: true }
                );
            },
            once: true
        });

        // 2. Parallax Scroll movement for circle and dot decorators
        gsap.to('#slide-photo .dec-1', {
            yPercent: -20,
            ease: 'none',
            scrollTrigger: {
                trigger: '#slide-photo',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
        gsap.to('#slide-photo .dec-2', {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
                trigger: '#slide-photo',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
        gsap.to('#slide-photo .dec-3', {
            yPercent: -35,
            ease: 'none',
            scrollTrigger: {
                trigger: '#slide-photo',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });

        // 3. Parallax Mousemove movement for circle and dot decorators
        const slidePhoto = document.querySelector('#slide-photo');
        if (slidePhoto) {
            slidePhoto.addEventListener('mousemove', (e) => {
                const rect = slidePhoto.getBoundingClientRect();
                const mouseX = e.clientX - rect.left - (rect.width / 2);
                const mouseY = e.clientY - rect.top - (rect.height / 2);
                
                gsap.to(slidePhoto.querySelectorAll('.dec-1'), {
                    x: mouseX * 0.03,
                    y: mouseY * 0.03,
                    duration: 0.8,
                    ease: 'power1.out'
                });
                gsap.to(slidePhoto.querySelectorAll('.dec-2'), {
                    x: mouseX * -0.025,
                    y: mouseY * -0.025,
                    duration: 0.8,
                    ease: 'power1.out'
                });
                gsap.to(slidePhoto.querySelectorAll('.dec-3'), {
                    x: mouseX * 0.05,
                    y: mouseY * 0.05,
                    duration: 0.8,
                    ease: 'power1.out'
                });
            });
        }
    };
    initPhotographySystem();

    // Initialize Ecosystem Dashboard
    function initEcosystemDashboard() {
        const mapCard = document.querySelector('.map-card');
        const tooltip = document.getElementById('map-tooltip');
        const hubLocations = document.querySelectorAll('.hub-location');
        
        if (mapCard && tooltip && hubLocations.length > 0) {
            hubLocations.forEach(hub => {
                hub.addEventListener('mouseenter', (e) => {
                    const name = hub.getAttribute('data-name');
                    const details = hub.getAttribute('data-details');
                    tooltip.innerHTML = `<strong>${name}</strong><br/>${details}`;
                    tooltip.style.opacity = '1';
                });
                
                hub.addEventListener('mousemove', (e) => {
                    const cardRect = mapCard.getBoundingClientRect();
                    const x = e.clientX - cardRect.left + 15;
                    const y = e.clientY - cardRect.top + 15;
                    tooltip.style.transform = `translate(${x}px, ${y}px)`;
                });
                
                hub.addEventListener('mouseleave', () => {
                    tooltip.style.opacity = '0';
                });
            });
        }
        
        // Setup GSAP counters & route drawing trigger
        ScrollTrigger.create({
            trigger: '#slide-mkt-channels',
            start: 'top 70%',
            onEnter: () => {
                // Route drawing animation
                gsap.fromTo('.route-line', {
                    strokeDashoffset: 100
                }, {
                    strokeDashoffset: 0,
                    duration: 2.2,
                    ease: 'power2.out',
                    stagger: 0.15
                });
                
                // Count from 0 to final values
                document.querySelectorAll('.kpi-val, .live-stat-val').forEach(el => {
                    const targetVal = parseFloat(el.getAttribute('data-val'));
                    if (isNaN(targetVal)) return;
                    
                    const isInt = el.getAttribute('data-type') === 'int';
                    const suffix = el.getAttribute('data-suffix') || '';
                    
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: targetVal,
                        duration: 2.0,
                        ease: 'power2.out',
                        onUpdate: () => {
                            if (isInt) {
                                el.textContent = Math.floor(obj.val).toLocaleString() + suffix;
                            } else {
                                el.textContent = obj.val.toFixed(1) + suffix;
                            }
                        }
                    });
                });
            }
        });

        // Simulate live activity by periodically highlighting active routes
        const routeLines = document.querySelectorAll('.route-line');
        if (routeLines.length > 0) {
            setInterval(() => {
                const randomIdx = Math.floor(Math.random() * routeLines.length);
                const route = routeLines[randomIdx];
                gsap.fromTo(route, {
                    stroke: 'rgba(34, 197, 94, 0.8)',
                    strokeWidth: 2.5
                }, {
                    stroke: 'rgba(34, 197, 94, 0.2)',
                    strokeWidth: 1.5,
                    duration: 1.5,
                    ease: 'power1.out'
                });
            }, 3000);
        }
    }
    initEcosystemDashboard();

    ScrollTrigger.refresh();

});
