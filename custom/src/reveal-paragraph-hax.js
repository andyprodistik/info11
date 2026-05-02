import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";

export class RevealParagraphComponent extends DDDSuper(LitElement) {
    static get properties() {
        return {
            paragraphs: { type: Array },
            visibleIndex: { type: Number },
            showButtons: { type: Boolean },
            isMenuOpen: { type: Boolean, state: true },
        };
    }

    constructor() {
        super();
        this.paragraphs = [];
        this.visibleIndex = 0;
        this.showButtons = true;
        this.isMenuOpen = false;
        this._dddTokens = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._clickOutsideHandler = (e) => {
            if (this.isMenuOpen && !this.shadowRoot.contains(e.composedPath()[0])) {
                this.isMenuOpen = false;
            }
        };
        window.addEventListener('click', this._clickOutsideHandler);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('click', this._clickOutsideHandler);
    }

    firstUpdated(changedProperties) {
        if (super.firstUpdated) {
            super.firstUpdated(changedProperties);
        }
        this._readDDDCustomProperties();
        this._processSlotContent();
    }

    _readDDDCustomProperties() {
        if (!globalThis.document || !globalThis.getComputedStyle) {
            return;
        }
        const root = globalThis.document.documentElement;
        const computed = getComputedStyle(root);
        const tokens = {};

        for (let i = 0; i < computed.length; i += 1) {
            const name = computed[i];
            if (name && name.startsWith("--ddd-")) {
                tokens[name] = computed.getPropertyValue(name).trim();
            }
        }
        this._dddTokens = tokens;
    }

    _processSlotContent() {
        const slot = this.shadowRoot.querySelector('slot');
        const assignedNodes = slot.assignedNodes();

        let fullText = "";
        assignedNodes.forEach(node => {
            fullText += (node.textContent || node.innerText || "").trim() + "\n";
        });

        // Split by double newline or multiple newlines
        this.paragraphs = fullText
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (this.paragraphs.length === 0) {
            this.paragraphs = [""];
        }

        this.requestUpdate();
    }

    static get styles() {
        return css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
      }

      .paragraph {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        margin-bottom: 1.2rem;
        color: var(--ddd-text-color, #212529);
      }

      .paragraph.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .btn-group {
        position: relative;
        display: inline-flex;
        vertical-align: middle;
        margin-top: var(--ddd-spacing-4, 20px);
      }

      .btn {
        display: inline-block;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        border: 1px solid transparent;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        cursor: pointer;
        color: #fff;
        background-color: var(--pause-button-bg, #3b5998);
        border-color: var(--pause-button-bg, #3b5998);
      }

      .btn:hover {
        background-color: var(--pause-button-bg-hover, #2d4373);
        border-color: var(--pause-button-bg-hover, #2d4373);
      }

      .btn:focus {
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(59, 89, 152, 0.5);
      }

      .btn-main {
        border-top-left-radius: 0.25rem;
        border-bottom-left-radius: 0.25rem;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        padding-right: 12px;
      }

      .dropdown-toggle {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-top-right-radius: 0.25rem;
        border-bottom-right-radius: 0.25rem;
        border-left: 1px solid rgba(255, 255, 255, 0.3);
        padding-left: 10px;
        padding-right: 10px;
      }

      .arrow-down {
        display: inline-block;
        width: 0;
        height: 0;
        margin-left: 0;
        vertical-align: middle;
        border-top: 5px solid;
        border-right: 5px solid transparent;
        border-left: 5px solid transparent;
      }

      .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1000;
        display: none;
        min-width: 10rem;
        padding: 0.5rem 0;
        margin: 0.125rem 0 0;
        font-size: 1rem;
        color: #212529;
        text-align: left;
        list-style: none;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 0.25rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        transform: translate3d(0px, 0px, 0px);
      }

      .dropdown-menu.show {
        display: block;
        animation: fadeIn 0.2s ease-out;
      }

      .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.25rem 1.5rem;
        clear: both;
        font-weight: 400;
        color: #212529;
        text-align: inherit;
        white-space: nowrap;
        background-color: transparent;
        border: 0;
        text-decoration: none;
        cursor: pointer;
      }

      .dropdown-item:hover {
        background-color: #f8f9fa;
        color: #16181b;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    }

    render() {
        return html`
      <div class="wrapper">
        <div class="content-area">
          ${this.renderParagraphs()}
        </div>
        <slot></slot>
        ${this.showButtons ? this.renderSplitButton() : ''}
      </div>
    `;
    }

    renderParagraphs() {
        return this.paragraphs.map(
            (text, index) => html`
        <div class="paragraph ${this.visibleIndex >= index ? "visible" : ""}">
          ${text}
        </div>
      `
        );
    }

    renderSplitButton() {
        return html`
      <div class="btn-group">
        <button type="button" class="btn btn-main" @click=${this.handlePause}>
          Lanjut...
        </button>

        <button
          type="button"
          class="btn dropdown-toggle"
          @click=${this.toggleMenu}
          aria-haspopup="true"
          aria-expanded=${this.isMenuOpen}
        >
          <span class="sr-only"><i class="arrow-down"></i></span>
        </button>

        <div class="dropdown-menu ${this.isMenuOpen ? 'show' : ''}">
          <button class="dropdown-item" @click=${this.showAll}>
            Tampilkan Semua
          </button>
        </div>
      </div>
    `;
    }

    toggleMenu(e) {
        e.stopPropagation();
        this.isMenuOpen = !this.isMenuOpen;
    }

    handlePause = () => {
        if (this.visibleIndex < this.paragraphs.length - 1) {
            this.visibleIndex++;
            this.launchConfetti();
        } else {
            this.visibleIndex = this.paragraphs.length - 1;
            this.showButtons = false;
        }
        this.isMenuOpen = false;
    }

    showAll = () => {
        this.visibleIndex = this.paragraphs.length - 1;
        this.showButtons = false;
        this.launchConfetti();
        this.isMenuOpen = false;
    }

    launchConfetti() {
        const overlay = document.getElementById('confetti') || document.querySelector('kuis-confeti');
        if (overlay && typeof overlay.fire === 'function') {
            overlay.fire({ duration: 1500, particleCount: 120 });
            return;
        }

        if (window.confetti) {
            const cs = getComputedStyle(document.documentElement);
            const colors = [
                cs.getPropertyValue('--ddd-theme-default-skyBlue')?.trim() || '#3da9fc',
                cs.getPropertyValue('--ddd-theme-default-accent')?.trim() || '#ef4565',
                cs.getPropertyValue('--ddd-theme-default-link')?.trim() || '#6246ea',
                cs.getPropertyValue('--ddd-theme-default-lime')?.trim() || '#84cc16',
                cs.getPropertyValue('--ddd-theme-default-warning')?.trim() || '#f59e0b',
            ];

            window.confetti({
                particleCount: 100,
                spread: 90,
                angle: 90,
                startVelocity: 45,
                origin: { x: 0.5, y: 0.5 },
                colors: colors
            });
        }
    }
}

customElements.define('reveal-paragraph', RevealParagraphComponent);
