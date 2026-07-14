export function ParticlePrologue() {
  return (
    <section
      className="particle-prologue"
      id="top"
      data-particle-prologue
      aria-label="Interactive Joi particle prologue"
    >
      <div className="particle-prologue-stage" data-particle-stage>
        <canvas className="particle-prologue-canvas" data-particle-canvas aria-hidden="true" />
        <div className="particle-prologue-atmosphere" aria-hidden="true" />

        <div className="particle-prologue-ui">
          <header>
            <strong>GALLO / JOI</strong>
            <span data-particle-form>FORM 00 / NEBULA</span>
          </header>

          <div className="particle-prologue-coordinates" aria-hidden="true">
            <span>PERSONALITY FIELD</span>
            <i />
            <span>23.1291° N · 113.2644° E</span>
          </div>

          <div className="particle-prologue-instructions">
            <p><span>MOVE</span> DISTURB THE FIELD</p>
            <p><span>CLICK</span> REFORM THE MEMORY</p>
          </div>

          <div className="particle-prologue-scroll">
            <span>SCROLL TO ENTER</span>
            <i aria-hidden="true" />
          </div>
        </div>

        <button
          className="particle-prologue-hit"
          data-particle-trigger
          type="button"
          aria-label="Change particle form"
        />
        <p className="sr-only" data-particle-announcement aria-live="polite">
          Joi particle field. Move to disturb it, click to change its form.
        </p>
      </div>
    </section>
  );
}
